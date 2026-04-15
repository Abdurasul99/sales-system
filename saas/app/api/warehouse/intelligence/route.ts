import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import {
  calculateAverageDailySales,
  calculateStockHealth,
} from "@/lib/inventory/intelligence";
import { unstable_cache } from "next/cache";

const querySchema = z.object({
  search: z.string().trim().optional(),
  branchId: z.string().trim().optional(),
  days: z.coerce.number().int().min(7).max(180).default(30),
});

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildSuggestionReason(item: {
  product: { name: string; unit: string };
  branch: { name: string };
  stockStatus: string;
  suggestedReorderQty: number;
  daysUntilStockout: number | null;
}) {
  if (item.stockStatus === "OUT_OF_STOCK") {
    return `${item.product.name} is out of stock in ${item.branch.name}.`;
  }

  if (item.daysUntilStockout !== null) {
    return `${item.product.name} is projected to run out in ${item.daysUntilStockout} days.`;
  }

  return `Reorder ${item.suggestedReorderQty} ${item.product.unit} for ${item.product.name}.`;
}

// Cache base inventory + sales data for 2 minutes (no search filter applied here).
// Search filtering is done in-memory after retrieval so we can reuse the same cache.
async function fetchBaseWarehouseData(orgId: string, branchId: string | undefined, days: number) {
  const salesVelocityWindowStart = subDays(new Date(), days);
  const [inventory, recentSales] = await Promise.all([
    prisma.inventory.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        branch: { organizationId: orgId },
        product: { organizationId: orgId, isArchived: false, isActive: true },
      },
      include: {
        branch: { select: { id: true, name: true } },
        product: {
          select: {
            id: true, name: true, sku: true, barcode: true, unit: true,
            costPrice: true, sellingPrice: true, minStockLevel: true,
            safetyStockLevel: true, reorderPoint: true, targetStockLevel: true,
            leadTimeDays: true, category: { select: { name: true } },
          },
        },
      },
    }),
    prisma.saleItem.findMany({
      where: {
        sale: {
          organizationId: orgId,
          status: "COMPLETED",
          createdAt: { gte: salesVelocityWindowStart },
          ...(branchId ? { branchId } : {}),
        },
      },
      select: {
        productId: true,
        quantity: true,
        sale: { select: { branchId: true, createdAt: true } },
      },
    }),
  ]);
  return { inventory, recentSales };
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsedQuery = querySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams.entries())
  );
  if (!parsedQuery.success) {
    return NextResponse.json(
      { error: "Invalid warehouse intelligence query" },
      { status: 400 }
    );
  }

  const { search, branchId, days } = parsedQuery.data;
  const orgId = session.organizationId;

  if (branchId) {
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId: orgId },
      select: { id: true },
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
  }

  // Use 2-min cache for the base data load; search is filtered in memory afterward
  const getCachedData = unstable_cache(
    () => fetchBaseWarehouseData(orgId, branchId, days),
    [`warehouse-intel-${orgId}-${branchId ?? "all"}-${days}`],
    { revalidate: 120, tags: [`warehouse-${orgId}`] }
  );

  const { inventory: rawInventory, recentSales } = await getCachedData();

  // Apply search filter in-memory (avoids separate uncached DB call for searches)
  const inventory = search
    ? rawInventory.filter((r) => {
        const q = search.toLowerCase();
        return (
          r.product.name.toLowerCase().includes(q) ||
          (r.product.sku ?? "").toLowerCase().includes(q) ||
          (r.product.barcode ?? "").includes(search)
        );
      })
    : rawInventory;

  const salesVelocity = new Map<
    string,
    { quantitySold: number; lastSoldAt: Date | null }
  >();

  for (const saleItem of recentSales) {
    const key = `${saleItem.productId}:${saleItem.sale.branchId}`;
    const current = salesVelocity.get(key) ?? {
      quantitySold: 0,
      lastSoldAt: null,
    };

    current.quantitySold += Number(saleItem.quantity);
    if (!current.lastSoldAt || saleItem.sale.createdAt > current.lastSoldAt) {
      current.lastSoldAt = saleItem.sale.createdAt;
    }

    salesVelocity.set(key, current);
  }

  const items = inventory
    .map((record) => {
      const quantity = Number(record.quantity);
      const reservedQty = Number(record.reservedQty);
      const key = `${record.product.id}:${record.branch.id}`;
      const velocity = salesVelocity.get(key);
      const avgDailySales = calculateAverageDailySales(
        velocity?.quantitySold ?? 0,
        days
      );
      const health = calculateStockHealth({
        quantity,
        reservedQty,
        minStockLevel: record.product.minStockLevel,
        safetyStockLevel: record.product.safetyStockLevel,
        reorderPoint: record.product.reorderPoint,
        targetStockLevel: record.product.targetStockLevel,
        leadTimeDays: record.product.leadTimeDays,
        avgDailySales,
      });
      const stockValue = roundCurrency(quantity * Number(record.product.costPrice));

      return {
        id: record.id,
        quantity,
        reservedQty,
        availableQty: health.availableQty,
        avgDailySales,
        coverageDays: health.coverageDays,
        daysUntilStockout: health.daysUntilStockout,
        leadTimeDemand: health.leadTimeDemand,
        suggestedTargetQty: health.suggestedTargetQty,
        suggestedReorderQty: health.suggestedReorderQty,
        thresholdQty: health.thresholdQty,
        dynamicReorderPoint: health.dynamicReorderPoint,
        stockStatus: health.stockStatus,
        stockValue,
        lastSoldAt: velocity?.lastSoldAt?.toISOString() ?? null,
        branch: record.branch,
        product: {
          id: record.product.id,
          name: record.product.name,
          sku: record.product.sku,
          barcode: record.product.barcode,
          unit: record.product.unit,
          costPrice: Number(record.product.costPrice),
          sellingPrice: Number(record.product.sellingPrice),
          minStockLevel: record.product.minStockLevel,
          safetyStockLevel: record.product.safetyStockLevel,
          reorderPoint: record.product.reorderPoint,
          targetStockLevel: record.product.targetStockLevel,
          leadTimeDays: record.product.leadTimeDays,
          category: record.product.category,
        },
      };
    })
    .sort((left, right) => {
      if (left.product.name !== right.product.name) {
        return left.product.name.localeCompare(right.product.name);
      }

      return left.branch.name.localeCompare(right.branch.name);
    });

  const summary = items.reduce(
    (acc, item) => {
      acc.totalSkus += 1;
      acc.totalQuantity += item.quantity;
      acc.totalAvailableQty += item.availableQty;
      acc.estimatedStockValue = roundCurrency(acc.estimatedStockValue + item.stockValue);

      if (item.stockStatus === "OUT_OF_STOCK") {
        acc.outOfStockCount += 1;
      }
      if (item.stockStatus === "CRITICAL") {
        acc.criticalCount += 1;
      }
      if (item.stockStatus === "REORDER") {
        acc.reorderCount += 1;
      }
      if (item.stockStatus === "OVERSTOCK") {
        acc.overstockCount += 1;
      }

      if (item.suggestedReorderQty > 0) {
        acc.suggestedPurchaseQty += item.suggestedReorderQty;
      }

      return acc;
    },
    {
      totalSkus: 0,
      totalQuantity: 0,
      totalAvailableQty: 0,
      estimatedStockValue: 0,
      outOfStockCount: 0,
      criticalCount: 0,
      reorderCount: 0,
      overstockCount: 0,
      suggestedPurchaseQty: 0,
    }
  );

  const suggestions = items
    .filter((item) =>
      ["OUT_OF_STOCK", "CRITICAL", "REORDER"].includes(item.stockStatus)
    )
    .sort((left, right) => {
      if (left.stockStatus !== right.stockStatus) {
        return left.stockStatus.localeCompare(right.stockStatus);
      }

      return right.suggestedReorderQty - left.suggestedReorderQty;
    })
    .slice(0, 6)
    .map((item) => ({
      inventoryId: item.id,
      productId: item.product.id,
      branchId: item.branch.id,
      productName: item.product.name,
      branchName: item.branch.name,
      suggestedReorderQty: item.suggestedReorderQty,
      stockStatus: item.stockStatus,
      reason: buildSuggestionReason(item),
    }));

  return NextResponse.json(
    { windowDays: days, summary, suggestions, items },
    { headers: { "Cache-Control": "private, max-age=120, stale-while-revalidate=300" } }
  );
}
