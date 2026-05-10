import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { OnboardingCheck } from "@/components/onboarding/OnboardingCheck";
import prisma from "@/lib/db/prisma";
import { startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { unstable_cache } from "next/cache";

async function fetchAnalytics(orgId: string) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);

  const [
    totalSalesMonth,
    totalSalesWeek,
    totalSalesToday,
    cancelledSales,
    totalExpensesMonth,
    totalIncomeMonth,
    lowStockCount,
    recentSales,
    salesByDay,
    topProducts,
    productCount,
  ] = await Promise.all([
    // Monthly sales total
    prisma.sale.aggregate({
      where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: monthStart } },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Weekly
    prisma.sale.aggregate({
      where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: weekStart } },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Today
    prisma.sale.aggregate({
      where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: todayStart } },
      _sum: { total: true },
      _count: { id: true },
    }),
    // Cancelled
    prisma.sale.count({
      where: { organizationId: orgId, status: "CANCELLED", createdAt: { gte: monthStart } },
    }),
    // Expenses this month
    prisma.expense.aggregate({
      where: { organizationId: orgId, status: "CONFIRMED", paidAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    // Other income this month
    prisma.income.aggregate({
      where: { organizationId: orgId, receivedAt: { gte: monthStart } },
      _sum: { amount: true },
    }),
    // Low stock products
    prisma.inventory.count({
      where: {
        product: { organizationId: orgId, isActive: true },
        quantity: { lte: 5 },
      },
    }),
    // Recent 5 sales
    prisma.sale.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        receiptNumber: true,
        total: true,
        status: true,
        paymentType: true,
        createdAt: true,
        cashier: { select: { fullName: true } },
        _count: { select: { items: true } },
      },
    }),
    // Sales by day last 30 days
    prisma.$queryRaw<{ date: Date; total: number; count: bigint }[]>`
      SELECT
        DATE("createdAt") as date,
        SUM(total)::float as total,
        COUNT(*)::int as count
      FROM "Sale"
      WHERE "organizationId" = ${orgId}
        AND status = 'COMPLETED'
        AND "createdAt" >= ${monthStart}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `,
    // Top 5 products this month
    prisma.saleItem.groupBy({
      by: ["productId"],
      where: {
        sale: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: monthStart } },
      },
      _sum: { total: true, quantity: true },
      orderBy: { _sum: { total: "desc" } },
      take: 5,
    }),
    prisma.product.count({ where: { organizationId: orgId } }),
  ]);

  // Resolve top product names
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const topProductsWithNames = topProducts.map((p) => ({
    productId: p.productId,
    name: products.find((pr) => pr.id === p.productId)?.name ?? "—",
    total: Number(p._sum.total ?? 0),
    quantity: Number(p._sum.quantity ?? 0),
  }));

  const revenue = Number(totalSalesMonth._sum.total ?? 0);
  const expenses = Number(totalExpensesMonth._sum.amount ?? 0);
  const otherIncome = Number(totalIncomeMonth._sum.amount ?? 0);
  const profit = revenue + otherIncome - expenses;

  return {
    revenue,
    expenses,
    otherIncome,
    profit,
    salesCountMonth: totalSalesMonth._count.id,
    salesCountWeek: totalSalesWeek._count.id,
    salesCountToday: totalSalesToday._count.id,
    revenueWeek: Number(totalSalesWeek._sum.total ?? 0),
    revenueToday: Number(totalSalesToday._sum.total ?? 0),
    cancelledSales,
    lowStockCount,
    productCount,
    recentSales: recentSales.map((s) => ({
      id: s.id,
      receiptNumber: s.receiptNumber,
      total: Number(s.total),
      status: s.status,
      paymentType: s.paymentType,
      cashier: s.cashier.fullName,
      itemCount: s._count.items,
      createdAt: s.createdAt.toISOString(),
    })),
    salesByDay: salesByDay.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      total: Number(d.total),
      count: Number(d.count),
    })),
    topProducts: topProductsWithNames,
  };
}

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const orgId = user.organizationId;

  // Cache analytics for 3 minutes — avoids 12 DB queries on every tab switch.
  // Tag "analytics" so we can revalidate on new sale/expense mutations later.
  const getCachedAnalytics = unstable_cache(
    () => fetchAnalytics(orgId),
    [`analytics-${orgId}`],
    { revalidate: 180, tags: [`analytics-${orgId}`] }
  );

  const analytics = await getCachedAnalytics();

  return (
    <div>
      <Header title="Аналитика" subtitle="Обзор продаж и финансов" />
      <div className="p-4 md:p-6">
        <AnalyticsDashboard data={analytics} />
      </div>
      <OnboardingCheck hasProducts={analytics.productCount > 0} organizationId={user.organizationId!} />
    </div>
  );
}
