import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { organizationId: true } });
  if (!user?.organizationId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const purchases = await prisma.purchase.findMany({
    where: { organizationId: user.organizationId },
    include: { supplier: { select: { companyName: true } }, items: { include: { product: { select: { name: true, unit: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(purchases);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { organizationId: true, branchId: true } });
  if (!user?.organizationId) return NextResponse.json({ error: "No org" }, { status: 403 });
  if (!user.branchId) return NextResponse.json({ error: "No branch assigned" }, { status: 403 });

  const body = await req.json();
  const { supplierId, invoiceNumber, notes, items } = body;
  if (!supplierId || !items?.length) return NextResponse.json({ error: "Поставщик и товары обязательны" }, { status: 400 });

  const total = items.reduce((sum: number, i: { total: number }) => sum + i.total, 0);

  const purchase = await prisma.purchase.create({
    data: {
      organizationId: user.organizationId,
      branchId: user.branchId,
      supplierId, invoiceNumber: invoiceNumber || null, notes: notes || null,
      total, paidAmount: 0, debtAmount: total,
      status: "PENDING",
      items: { create: items.map((i: { productId: string; quantity: number; costPrice: number; total: number }) => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice, total: i.total })) },
    },
    include: { supplier: { select: { companyName: true } }, items: { include: { product: { select: { name: true, unit: true } } } } },
  });

  return NextResponse.json(purchase, { status: 201 });
}
