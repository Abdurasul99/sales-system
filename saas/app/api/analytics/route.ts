import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";
import { startOfMonth } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = session.organizationId;
  const monthStart = startOfMonth(new Date());

  const [revenue, expenses, salesCount, topProducts] = await Promise.all([
    prisma.sale.aggregate({ where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: monthStart } }, _sum: { total: true } }),
    prisma.expense.aggregate({ where: { organizationId: orgId, paidAt: { gte: monthStart } }, _sum: { amount: true } }),
    prisma.sale.count({ where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: monthStart } } }),
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: { sale: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: monthStart } } },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    totalRevenue: Number(revenue._sum.total ?? 0),
    totalExpenses: Number(expenses._sum.amount ?? 0),
    totalSales: salesCount,
    topProducts: topProducts.map((p) => ({ productId: p.productId, revenue: Number(p._sum.total ?? 0), quantitySold: Number(p._sum.quantity ?? 0) })),
  });
}
