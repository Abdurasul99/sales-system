import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.product.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    name,
    sku,
    barcode,
    categoryId,
    unit,
    costPrice,
    sellingPrice,
    minStockLevel,
    safetyStockLevel,
    reorderPoint,
    targetStockLevel,
    leadTimeDays,
    description,
    isActive,
  } = body;

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name,
      sku: sku || null,
      barcode: barcode || null,
      categoryId: categoryId || null,
      unit,
      costPrice: Number(costPrice || 0),
      sellingPrice: Number(sellingPrice || 0),
      minStockLevel: Number(minStockLevel || 0),
      safetyStockLevel: Number(safetyStockLevel || 0),
      reorderPoint: Number(reorderPoint || 0),
      targetStockLevel: Number(targetStockLevel || 0),
      leadTimeDays: Number(leadTimeDays || 0),
      description: description || null,
      isActive,
    },
    include: {
      category: { select: { id: true, name: true } },
      inventory: { select: { quantity: true } },
    },
  });

  return NextResponse.json({
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? "Uncategorized",
    unit: product.unit,
    costPrice: Number(product.costPrice),
    sellingPrice: Number(product.sellingPrice),
    minStockLevel: product.minStockLevel,
    safetyStockLevel: product.safetyStockLevel,
    reorderPoint: product.reorderPoint,
    targetStockLevel: product.targetStockLevel,
    leadTimeDays: product.leadTimeDays,
    description: product.description,
    quantity: product.inventory.reduce((sum, item) => sum + Number(item.quantity), 0),
    isActive: product.isActive,
    imageUrl: product.imageUrl,
    createdAt: product.createdAt.toISOString(),
  });
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.product.updateMany({
    where: { id: params.id, organizationId: session.organizationId },
    data: { isArchived: true },
  });

  return NextResponse.json({ success: true });
}
