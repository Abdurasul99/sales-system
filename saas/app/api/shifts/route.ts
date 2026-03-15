import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId, userId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const [currentShift, recentShifts] = await Promise.all([
    prisma.cashierShift.findFirst({
      where: { cashierId: userId, status: "OPEN" },
      include: { branch: { select: { name: true } } },
    }),
    prisma.cashierShift.findMany({
      where: { status: "CLOSED", branch: { organizationId } },
      include: { cashier: { select: { fullName: true } }, branch: { select: { name: true } } },
      orderBy: { openedAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({ currentShift, recentShifts });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = session;

  // Check no existing open shift for user
  const existing = await prisma.cashierShift.findFirst({
    where: { cashierId: userId, status: "OPEN" },
  });
  if (existing) {
    return NextResponse.json({ error: "У вас уже есть открытая смена" }, { status: 400 });
  }

  const body = await req.json();
  const { openingBalance, branchId } = body;

  if (!branchId) {
    return NextResponse.json({ error: "branchId обязателен" }, { status: 400 });
  }

  const shift = await prisma.cashierShift.create({
    data: {
      cashierId: userId,
      branchId,
      openingBalance: Number(openingBalance ?? 0),
      openedAt: new Date(),
      status: "OPEN",
    },
  });

  return NextResponse.json(shift, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { userId } = session;
  const body = await req.json();
  const { shiftId, closingBalance, notes } = body;

  if (!shiftId) {
    return NextResponse.json({ error: "shiftId обязателен" }, { status: 400 });
  }

  const parsedClosingBalance = Number(closingBalance ?? 0);
  if (isNaN(parsedClosingBalance) || parsedClosingBalance < 0) {
    return NextResponse.json({ error: "closingBalance должен быть числом >= 0" }, { status: 400 });
  }

  const shift = await prisma.cashierShift.findFirst({
    where: { id: shiftId, cashierId: userId, status: "OPEN" },
    include: { branch: { select: { organizationId: true } } },
  });
  if (!shift) {
    return NextResponse.json({ error: "Смена не найдена или уже закрыта" }, { status: 404 });
  }

  // Calculate sales total for this shift period
  const salesAgg = await prisma.sale.aggregate({
    _sum: { total: true },
    _count: true,
    where: {
      cashierId: userId,
      branchId: shift.branchId,
      createdAt: { gte: shift.openedAt },
      status: "COMPLETED",
    },
  });

  const totalSales = Number(salesAgg._sum.total ?? 0);
  const salesCount = salesAgg._count;

  const updated = await prisma.cashierShift.update({
    where: { id: shiftId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      closingBalance: parsedClosingBalance,
      totalSales,
      notes: notes || null,
    },
  });

  // Create shift closed notification
  const orgId = shift.branch.organizationId;
  if (orgId) {
    const formattedAmount = totalSales.toLocaleString("ru-RU");
    await prisma.notification.create({
      data: {
        organizationId: orgId,
        type: "SUCCESS",
        title: "Смена закрыта",
        message: `Смена закрыта. Продаж: ${salesCount} · Итого: ${formattedAmount} сум`,
        data: { shiftId: shift.id },
      },
    });
  }

  return NextResponse.json({ ...updated, salesCount });
}
