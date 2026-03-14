import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { organizationId: session.organizationId, isArchived: false },
    include: { category: { select: { name: true } }, inventory: { select: { quantity: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, minStockLevel, description, organizationId } = body;

    if (!name || !sellingPrice) return NextResponse.json({ error: "Название и цена обязательны" }, { status: 400 });

    // Check plan limit
    const org = await prisma.organization.findUnique({
      where: { id: session.organizationId },
      include: { subscription: { include: { plan: true } } },
    });
    const maxProducts = org?.subscription?.plan?.maxProducts;
    if (maxProducts) {
      const count = await prisma.product.count({ where: { organizationId: session.organizationId, isArchived: false } });
      if (count >= maxProducts) {
        return NextResponse.json({ error: `Лимит товаров достигнут (${maxProducts}). Обновите тариф.` }, { status: 403 });
      }
    }

    const product = await prisma.product.create({
      data: {
        organizationId: session.organizationId,
        name,
        sku: sku || null,
        barcode: barcode || null,
        categoryId: categoryId || null,
        unit: unit || "шт",
        costPrice: costPrice || 0,
        sellingPrice,
        minStockLevel: minStockLevel || 0,
        description: description || null,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS POST]", error);
    return NextResponse.json({ error: "Ошибка создания товара" }, { status: 500 });
  }
}
