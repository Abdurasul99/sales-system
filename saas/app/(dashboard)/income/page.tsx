import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { FinanceTable } from "@/components/shared/FinanceTable";
import { startOfMonth } from "date-fns";

export default async function IncomePage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const monthStart = startOfMonth(new Date());
  const [incomes, categories, stats] = await Promise.all([
    prisma.income.findMany({
      where: { organizationId: user.organizationId },
      include: { category: { select: { name: true, color: true } } },
      orderBy: { receivedAt: "desc" },
      take: 100,
    }),
    prisma.incomeCategory.findMany({ where: { organizationId: user.organizationId, isActive: true } }),
    prisma.income.aggregate({
      where: { organizationId: user.organizationId, receivedAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  return (
    <div>
      <Header title="Доходы" subtitle="Управление доходами" />
      <div className="p-6">
        <FinanceTable
          records={incomes.map((i) => ({ id: i.id, description: i.description, amount: Number(i.amount), currency: i.currency, status: "CONFIRMED", date: i.receivedAt.toISOString(), categoryName: i.category?.name ?? "—", categoryColor: i.category?.color ?? "#059669", createdBy: i.createdBy }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          monthTotal={Number(stats._sum.amount ?? 0)}
          monthCount={stats._count.id}
          type="income"
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
