import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const inventory = await prisma.inventory.findMany({
    where: {
      product: {
        organizationId: session.organizationId,
        isArchived: false,
        ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
      },
    },
    include: {
      product: { include: { category: true } },
      branch: { select: { name: true } },
    },
    orderBy: { product: { name: "asc" } },
  });

  return NextResponse.json(inventory);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId, branchId, quantity, type, notes } = await req.json();
  if (!productId || !quantity || !type) {
    return NextResponse.json({ error: "productId, quantity, type required" }, { status: 400 });
  }

  const qty = Number(quantity);
  const movementType = type === "RECEIVE" ? "IN_ADJUSTMENT" : "OUT_WRITEOFF";

  // Verify product belongs to org
  const product = await prisma.product.findFirst({
    where: { id: productId, organizationId: session.organizationId },
  });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  // Get the branch to use — always validate it belongs to this org
  const targetBranchId = branchId ?? session.branchId;
  if (!targetBranchId) return NextResponse.json({ error: "branchId required" }, { status: 400 });
  const branch = await prisma.branch.findFirst({ where: { id: targetBranchId, organizationId: session.organizationId } });
  if (!branch) return NextResponse.json({ error: "Branch not found" }, { status: 403 });

  const result = await prisma.$transaction(async (tx) => {
    let inv = await tx.inventory.findUnique({
      where: { productId_branchId: { productId, branchId: targetBranchId } },
    });

    const before = inv ? Number(inv.quantity) : 0;

    if (type === "WRITEOFF" && before < qty) {
      throw new Error("Недостаточно товара на складе");
    }

    const after = type === "RECEIVE" ? before + qty : before - qty;

    if (inv) {
      inv = await tx.inventory.update({
        where: { productId_branchId: { productId, branchId: targetBranchId } },
        data: { quantity: after },
      });
    } else {
      inv = await tx.inventory.create({
        data: { productId, branchId: targetBranchId, quantity: after },
      });
    }

    await tx.inventoryMovement.create({
      data: {
        inventoryId: inv.id,
        type: movementType,
        quantity: qty,
        quantityBefore: before,
        quantityAfter: after,
        notes: notes || null,
        createdBy: session.userId,
      },
    });

    return { inv, after };
  });

  // Check low stock and create notification
  const newQuantity = result.after;
  const updatedProductId = result.inv.productId;
  const stockProduct = await prisma.product.findUnique({
    where: { id: updatedProductId },
    select: { name: true, minStockLevel: true, organizationId: true },
  });
  if (stockProduct && newQuantity <= (stockProduct.minStockLevel ?? 5)) {
    // Deduplicate: skip if a LOW_STOCK notification was created in the last 24 h for this product
    const recentNotif = await prisma.notification.findFirst({
      where: {
        organizationId: stockProduct.organizationId,
        type: "LOW_STOCK",
        data: { path: ["productId"], equals: updatedProductId },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (!recentNotif) {
      await prisma.notification.create({
        data: {
          organizationId: stockProduct.organizationId,
          type: "LOW_STOCK",
          title: "low_stock",
          message: `${stockProduct.name}: ${newQuantity} remaining`,
          data: { productId: updatedProductId, quantity: newQuantity, minStockLevel: stockProduct.minStockLevel },
        },
      });
    }
  }

  return NextResponse.json(result.inv, { status: 201 });
}
