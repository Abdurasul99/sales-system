import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId },
  });
  if (!customer) return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });

  const body = await req.json();
  const { amount } = body;
  const paymentAmount = Number(amount);

  if (!paymentAmount || paymentAmount <= 0) {
    return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
  }

  const currentDebt = Number(customer.debtAmount);
  if (paymentAmount > currentDebt) {
    return NextResponse.json({ error: "Сумма превышает долг" }, { status: 400 });
  }

  const newDebt = Math.max(0, currentDebt - paymentAmount);

  const updated = await prisma.customer.update({
    where: { id },
    data: { debtAmount: newDebt },
  });

  return NextResponse.json({
    success: true,
    previousDebt: currentDebt,
    paidAmount: paymentAmount,
    newDebt,
  });
}
