import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId },
    include: {
      _count: { select: { sales: true } },
    },
  });

  if (!customer) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });

  const salesSummary = await prisma.sale.aggregate({
    where: { customerId: id, status: "COMPLETED" },
    _sum: { total: true },
    _count: true,
  });

  return NextResponse.json({
    ...customer,
    salesCount: salesSummary._count,
    totalSalesAmount: Number(salesSummary._sum.total ?? 0),
  });
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const customer = await prisma.customer.findFirst({ where: { id, organizationId } });
  if (!customer) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });

  const body = await req.json();
  const { fullName, phone, email, segment } = body;

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...(fullName !== undefined && { fullName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(segment !== undefined && { segment }),
    },
  });

  return NextResponse.json(updated);
}
