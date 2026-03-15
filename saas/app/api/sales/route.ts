import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { generateReceiptNumber } from "@/lib/utils";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "50");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { organizationId: session.organizationId };
  if (status) where.status = status;

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: { items: { include: { product: { select: { name: true } } } }, cashier: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({ sales, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || !session.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { branchId: bodyBranchId, paymentType, items, subtotal, discountAmount, discountType, discountValue, total, notes, currency } = body;

    if (!items?.length) return NextResponse.json({ error: "Нет товаров" }, { status: 400 });

    // Always use session values — never trust client-supplied org/cashier IDs
    const organizationId = session.organizationId;
    const cashierId = session.userId;

    // Validate branchId belongs to this organization
    const branchId = bodyBranchId ?? session.branchId;
    if (!branchId) return NextResponse.json({ error: "branchId required" }, { status: 400 });
    const branch = await prisma.branch.findFirst({ where: { id: branchId, organizationId } });
    if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 403 });

    // Determine sale status
    let status = "COMPLETED";
    if (paymentType === "DEBT") status = "DEBT";

    const receiptNumber = generateReceiptNumber("CHK");

    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          organizationId,
          branchId,
          cashierId,
          receiptNumber,
          status: status as "COMPLETED" | "DEBT",
          paymentType,
          subtotal,
          discountAmount: discountAmount ?? 0,
          discountType,
          discountValue,
          total,
          paidAmount: paymentType === "DEBT" ? 0 : total,
          debtAmount: paymentType === "DEBT" ? total : 0,
          notes,
          currency: currency ?? "UZS",
          items: {
            create: items.map((item: { productId: string; quantity: number; unitPrice: number; costPrice: number; discount: number; total: number }) => ({
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

      // Deduct inventory
      for (const item of items) {
        const inventory = await tx.inventory.findFirst({
          where: { productId: item.productId, branchId },
        });

        if (inventory) {
          const newQty = Number(inventory.quantity) - Number(item.quantity);
          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: Math.max(0, newQty) },
          });

          await tx.inventoryMovement.create({
            data: {
              inventoryId: inventory.id,
              type: "OUT_SALE",
              quantity: item.quantity,
              quantityBefore: Number(inventory.quantity),
              quantityAfter: Math.max(0, newQty),
              referenceId: newSale.id,
              referenceType: "SALE",
              createdBy: cashierId,
            },
          });
        }
      }

      return newSale;
    });

    return NextResponse.json({ success: true, saleId: sale.id, receiptNumber: sale.receiptNumber });
  } catch (error) {
    console.error("[SALES POST]", error);
    return NextResponse.json({ error: "Ошибка при создании продажи" }, { status: 500 });
  }
}
