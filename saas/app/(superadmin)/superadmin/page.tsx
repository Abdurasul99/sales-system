import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { formatUzs, formatDate } from "@/lib/utils";
import { Building2, Users, Crown, Activity, TrendingUp, CalendarDays } from "lucide-react";
import { revalidatePath } from "next/cache";

async function toggleOrgBlock(formData: FormData) {
  "use server";
  const orgId = formData.get("orgId") as string;
  const isBlocked = formData.get("isBlocked") === "true";
  await prisma.organization.update({
    where: { id: orgId },
    data: { isBlocked: !isBlocked },
  });
  revalidatePath("/superadmin");
}

export default async function SuperAdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPERADMIN") redirect("/analytics");

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalOrganizations, totalUsers, newOrgsThisMonth, allOrgs, totalRevenueAgg] =
    await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
      prisma.organization.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.organization.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          subscription: { include: { plan: { select: { name: true, slug: true } } } },
          _count: { select: { users: true } },
        },
      }),
      prisma.sale.aggregate({
        _sum: { total: true },
        where: { status: "COMPLETED" },
      }),
    ]);

  const activeOrganizations = allOrgs.filter(
    (o) => o.isActive && !o.isBlocked && o.subscription?.isActive
  ).length;

  const totalRevenue = Number(totalRevenueAgg._sum.total ?? 0);

  // Group by plan
  const planCounts: Record<string, number> = {};
  for (const org of allOrgs) {
    const planName = org.subscription?.plan?.name ?? "Без тарифа";
    planCounts[planName] = (planCounts[planName] ?? 0) + 1;
  }

  const stats = [
    {
      label: "Всего организаций",
      value: totalOrganizations,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-50",
      format: "number" as const,
    },
    {
      label: "Активные орг.",
      value: activeOrganizations,
      icon: Activity,
      color: "text-green-600",
      bg: "bg-green-50",
      format: "number" as const,
    },
    {
      label: "Всего пользователей",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      format: "number" as const,
    },
    {
      label: "Общая выручка",
      value: totalRevenue,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      format: "uzs" as const,
    },
    {
      label: "Новых за 30 дней",
      value: newOrgsThisMonth,
      icon: CalendarDays,
      color: "text-orange-600",
      bg: "bg-orange-50",
      format: "number" as const,
    },
    {
      label: "Активных тарифов",
      value: Object.keys(planCounts).length,
      icon: Crown,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      format: "number" as const,
    },
  ];

  return (
    <div>
      <Header title="Платформа" subtitle="SuperAdmin панель управления" />
      <div className="p-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {s.format === "uzs"
                    ? formatUzs(s.value)
                    : (s.value as number).toLocaleString("ru-RU")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Plan distribution */}
        {Object.keys(planCounts).length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Распределение по тарифам</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(planCounts).map(([plan, count]) => (
                <div
                  key={plan}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-xl"
                >
                  <Crown className="w-3.5 h-3.5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-800">{plan}</span>
                  <span className="text-sm font-bold text-purple-600">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Organizations table */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">
              Все организации ({allOrgs.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">
                    Организация
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Тариф</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">
                    Пользователей
                  </th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">
                    Статус
                  </th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                    Создан
                  </th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody>
                {allOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-400">{org.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                        {org.subscription?.plan?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-gray-700 font-medium">{org._count.users}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          org.isBlocked
                            ? "bg-red-50 text-red-600"
                            : org.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {org.isBlocked ? "Заблокирован" : org.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <form action={toggleOrgBlock}>
                        <input type="hidden" name="orgId" value={org.id} />
                        <input type="hidden" name="isBlocked" value={String(org.isBlocked)} />
                        <button
                          type="submit"
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            org.isBlocked
                              ? "bg-green-50 text-green-700 hover:bg-green-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {org.isBlocked ? "Разблокировать" : "Заблокировать"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allOrgs.length === 0 && (
              <div className="py-12 text-center text-gray-400 text-sm">
                Организации не найдены
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
