import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, sku, barcode, categoryId, unit, costPrice, sellingPrice, minStockLevel, isActive } = body;

  const product = await prisma.product.updateMany({
    where: { id: params.id, organizationId: session.organizationId },
    data: { name, sku, barcode, categoryId: categoryId || null, unit, costPrice, sellingPrice, minStockLevel, isActive },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.product.updateMany({
    where: { id: params.id, organizationId: session.organizationId },
    data: { isArchived: true },
  });

  return NextResponse.json({ success: true });
}
