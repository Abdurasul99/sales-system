import { PaymentType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { generateReceiptNumber } from "@/lib/utils";

interface SaleLineItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discount: number;
  total: number;
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { organizationId: session.organizationId };
  if (status) {
    where.status = status;
  }

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true } } } },
        cashier: { select: { fullName: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({
    sales,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      branchId: bodyBranchId,
      customerId,
      paymentType,
      items,
      subtotal,
      discountAmount,
      discountType,
      discountValue,
      total,
      paidAmount: bodyPaidAmount,
      notes,
      currency,
    } = body as {
      branchId?: string;
      customerId?: string;
      paymentType: string;
      items: SaleLineItem[];
      subtotal: number;
      discountAmount?: number;
      discountType?: string;
      discountValue?: number;
      total: number;
      paidAmount?: number;
      notes?: string;
      currency?: string;
    };

    if (!items?.length) {
      return NextResponse.json({ error: "No sale items provided" }, { status: 400 });
    }

    const organizationId = session.organizationId;
    const cashierId = session.userId;
    const branchId = bodyBranchId ?? session.branchId;

    if (!branchId) {
      return NextResponse.json({ error: "branchId required" }, { status: 400 });
    }

    const branch = await prisma.branch.findFirst({
      where: { id: branchId, organizationId },
      select: { id: true },
    });
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 403 });
    }

    const demandByProduct = new Map<string, number>();
    for (const item of items) {
      const requestedQty = Number(item.quantity);
      demandByProduct.set(
        item.productId,
        (demandByProduct.get(item.productId) ?? 0) + requestedQty
      );
    }

    const inventoryRecords = await prisma.inventory.findMany({
      where: {
        branchId,
        productId: { in: Array.from(demandByProduct.keys()) },
      },
      select: {
        id: true,
        productId: true,
        quantity: true,
        reservedQty: true,
      },
    });

    const inventoryByProduct = new Map(
      inventoryRecords.map((record) => [record.productId, record])
    );
    const insufficientItems = Array.from(demandByProduct.entries())
      .map(([productId, requestedQty]) => {
        const inventory = inventoryByProduct.get(productId);
        const availableQty = inventory
          ? Math.max(0, Number(inventory.quantity) - Number(inventory.reservedQty))
          : 0;

        if (availableQty >= requestedQty) {
          return null;
        }

        return { productId, requestedQty, availableQty };
      })
      .filter(Boolean);

    if (insufficientItems.length > 0) {
      return NextResponse.json(
        {
          error: "Insufficient stock for one or more items",
          items: insufficientItems,
        },
        { status: 400 }
      );
    }

    // Validate customer belongs to org if provided
    if (customerId) {
      const customer = await prisma.customer.findFirst({
        where: { id: customerId, organizationId },
        select: { id: true },
      });
      if (!customer) {
        return NextResponse.json({ error: "Customer not found" }, { status: 404 });
      }
    }

    const receiptNumber = generateReceiptNumber("CHK");
    const normalizedPaymentType = paymentType as PaymentType;

    // Calculate paid/debt amounts
    const paid = normalizedPaymentType === "DEBT" ? 0
      : normalizedPaymentType === "MIXED" ? (bodyPaidAmount ?? total)
      : total;
    const debt = total - paid;
    const saleStatus = debt > 0 ? "DEBT" : "COMPLETED";

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          organizationId,
          branchId,
          cashierId,
          customerId: customerId ?? null,
          receiptNumber,
          status: saleStatus as "COMPLETED" | "DEBT",
          paymentType: normalizedPaymentType,
          subtotal,
          discountAmount: discountAmount ?? 0,
          discountType,
          discountValue,
          total,
          paidAmount: paid,
          debtAmount: debt,
          notes,
          currency: currency ?? "UZS",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              costPrice: item.costPrice,
              discount: item.discount,
              total: item.total,
            })),
          },
        },
      });

      for (const [productId, requestedQty] of Array.from(demandByProduct.entries())) {
        const inventory = inventoryByProduct.get(productId);
        if (!inventory) {
          throw new Error(`Inventory not found for product ${productId}`);
        }

        const quantityBefore = Number(inventory.quantity);
        const quantityAfter = quantityBefore - requestedQty;

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { quantity: quantityAfter },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryId: inventory.id,
            type: "OUT_SALE",
            quantity: requestedQty,
            quantityBefore,
            quantityAfter,
            referenceId: createdSale.id,
            referenceType: "SALE",
            createdBy: cashierId,
          },
        });
      }

      // Update customer totals
      if (customerId) {
        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalPurchased: { increment: total },
            purchaseCount: { increment: 1 },
            debtAmount: { increment: debt },
            lastPurchaseAt: new Date(),
          },
        });
      }

      return createdSale;
    });

    return NextResponse.json({
      success: true,
      saleId: sale.id,
      receiptNumber: sale.receiptNumber,
    });
  } catch (error) {
    console.error("[SALES POST]", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
