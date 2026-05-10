import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { organizationId: session.organizationId, isArchived: false },
    include: { category: { select: { name: true } }, inventory: { select: { quantity: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    } = body;

    if (!name || !sellingPrice) {
      return NextResponse.json(
        { error: "Name and selling price are required" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      include: { subscription: { include: { plan: true } } },
    });
    const maxProducts = org?.subscription?.plan?.maxProducts;
    if (maxProducts) {
      const count = await prisma.product.count({
        where: { organizationId: session.organizationId, isArchived: false },
      });
      if (count >= maxProducts) {
        return NextResponse.json(
          { error: `Product limit reached (${maxProducts}). Upgrade your plan.` },
          { status: 403 }
        );
      }
    }

    // Check SKU uniqueness within organization
    if (sku) {
      const existing = await prisma.product.findFirst({
        where: { organizationId: session.organizationId, sku, isArchived: false },
        select: { id: true },
      });
      if (existing) {
        return NextResponse.json(
          { error: `SKU "${sku}" is already in use` },
          { status: 409 }
        );
      }
    }

    const product = await prisma.product.create({
      data: {
        organizationId: session.organizationId,
        name,
        sku: sku || null,
        barcode: barcode || null,
        categoryId: categoryId || null,
        unit: unit || "pcs",
        costPrice: Number(costPrice || 0),
        sellingPrice: Number(sellingPrice),
        minStockLevel: Number(minStockLevel || 0),
        safetyStockLevel: Number(safetyStockLevel || 0),
        reorderPoint: Number(reorderPoint || 0),
        targetStockLevel: Number(targetStockLevel || 0),
        leadTimeDays: Number(leadTimeDays || 0),
        description: description || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS POST]", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
