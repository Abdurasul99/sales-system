import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import {
  buildReplenishmentRecommendation,
  classifyAbc
} from "./replenishment-domain";

const router = Router();

router.use(requireAuth, requirePermission("analytics.read"));

type InventoryWithProduct = {
  available: unknown;
  product: {
    reorderPoint: unknown;
  };
};

type ProductRevenueRow = {
  productId: string;
  _sum: {
    total: unknown;
    quantity?: unknown;
  };
};

type ProductLite = {
  id: string;
  article: string;
};

type BalanceWithWarehouse = {
  productId: string;
  available: unknown;
  product: {
    article: string;
    name: string;
    leadTimeDays: number;
    safetyStock: unknown;
    reorderPoint: unknown;
  };
  warehouse: {
    name: string;
  };
};

router.get("/dashboard", async (req, res) => {
  const organizationId = req.auth!.organizationId;

  const [salesAgg, purchaseAgg, customersCount, openLeads, wonDeals, closedDeals, inventory] =
    await Promise.all([
      prisma.salesOrder.aggregate({
        where: { organizationId },
        _sum: { total: true }
      }),
      prisma.purchaseOrder.aggregate({
        where: { organizationId },
        _sum: { total: true }
      }),
      prisma.customer.count({
        where: { organizationId, isActive: true }
      }),
      prisma.lead.count({
        where: {
          organizationId,
          status: {
            in: ["NEW", "QUALIFIED", "NEGOTIATION"]
          }
        }
      }),
      prisma.deal.count({
        where: { organizationId, stage: "WON" }
      }),
      prisma.deal.count({
        where: { organizationId, stage: { in: ["WON", "LOST"] } }
      }),
      prisma.inventoryBalance.findMany({
        where: { organizationId },
        include: { product: true }
      })
    ]);

  const salesTotal = Number(salesAgg._sum.total ?? 0);
  const purchaseTotal = Number(purchaseAgg._sum.total ?? 0);
  const grossSpread = Number((salesTotal - purchaseTotal).toFixed(2));
  const winRate = closedDeals ? Number(((wonDeals / closedDeals) * 100).toFixed(2)) : 0;
  const lowStockCount = (inventory as InventoryWithProduct[]).filter(
    (item: InventoryWithProduct) =>
      Number(item.available) <= Number(item.product.reorderPoint)
  ).length;

  res.json({
    kpis: {
      salesTotal,
      purchaseTotal,
      grossSpread,
      activeCustomers: customersCount,
      openLeads,
      winRate,
      lowStockCount
    }
  });
});

router.get("/abc", async (req, res) => {
  const salesByProduct = (await prisma.salesOrderLine.groupBy({
    by: ["productId"],
    _sum: { total: true },
    orderBy: { _sum: { total: "desc" } }
  })) as unknown as ProductRevenueRow[];

  const products = (await prisma.product.findMany({
    where: {
      organizationId: req.auth!.organizationId,
      id: { in: salesByProduct.map((item: ProductRevenueRow) => item.productId) }
    }
  })) as ProductLite[];

  const result = classifyAbc(
    salesByProduct.map((item: ProductRevenueRow) => ({
      productCode:
        products.find((product: ProductLite) => product.id === item.productId)?.article ??
        item.productId,
      annualRevenue: Number(item._sum.total ?? 0)
    }))
  );

  res.json({ items: result });
});

router.get("/replenishment", async (req, res) => {
  const balances = (await prisma.inventoryBalance.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      product: true,
      warehouse: true
    }
  })) as BalanceWithWarehouse[];

  const lastThirtyDays = new Date();
  lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);

  const salesByProduct = (await prisma.salesOrderLine.groupBy({
    by: ["productId"],
    where: {
      salesOrder: {
        organizationId: req.auth!.organizationId,
        createdAt: {
          gte: lastThirtyDays
        }
      }
    },
    _sum: {
      quantity: true
    }
  })) as unknown as ProductRevenueRow[];

  const suggestions = balances
    .map((balance: BalanceWithWarehouse) => {
      const soldQty = Number(
        salesByProduct.find((item: ProductRevenueRow) => item.productId === balance.productId)
          ?._sum.quantity ?? 0
      );
      const averageDailyDemand = Number((soldQty / 30).toFixed(2));
      const recommendation = buildReplenishmentRecommendation({
        availableStock: Number(balance.available),
        averageDailyDemand,
        leadTimeDays: balance.product.leadTimeDays,
        safetyStock: Number(balance.product.safetyStock),
        eoq: Math.max(Number(balance.product.reorderPoint), 1)
      });

      return {
        productId: balance.productId,
        article: balance.product.article,
        productName: balance.product.name,
        warehouseName: balance.warehouse.name,
        available: Number(balance.available),
        averageDailyDemand,
        ...recommendation
      };
    })
    .filter((item: { needsReorder: boolean }) => item.needsReorder)
    .sort(
      (
        left: { suggestedOrderQty: number },
        right: { suggestedOrderQty: number }
      ) => right.suggestedOrderQty - left.suggestedOrderQty
    );

  res.json({ suggestions });
});

export { router as analyticsRouter };
