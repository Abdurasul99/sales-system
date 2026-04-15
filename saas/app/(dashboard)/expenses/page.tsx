import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { FinanceTable } from "@/components/shared/FinanceTable";
import { startOfMonth } from "date-fns";

export default async function ExpensesPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  const monthStart = startOfMonth(new Date());
  const [expenses, categories, stats] = await Promise.all([
    prisma.expense.findMany({
      where: { organizationId: user.organizationId },
      include: { category: { select: { name: true, color: true } } },
      orderBy: { paidAt: "desc" },
      take: 100,
    }),
    prisma.expenseCategory.findMany({ where: { organizationId: user.organizationId, isActive: true } }),
    prisma.expense.aggregate({
      where: { organizationId: user.organizationId, status: "CONFIRMED", paidAt: { gte: monthStart } },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  const monthTotal = Number(stats._sum.amount ?? 0);
  const monthCount = stats._count.id;

  return (
    <div>
      <Header title="Расходы" subtitle="Управление расходами" />
      <div className="p-6">
        <FinanceTable
          records={expenses.map((e) => ({ id: e.id, description: e.description, amount: Number(e.amount), currency: e.currency, status: e.status, date: e.paidAt.toISOString(), categoryName: e.category?.name ?? "—", categoryColor: e.category?.color ?? "#7c3aed", createdBy: e.createdBy }))}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          monthTotal={monthTotal}
          monthCount={monthCount}
          type="expense"
          organizationId={user.organizationId}
        />
      </div>
    </div>
  );
}
