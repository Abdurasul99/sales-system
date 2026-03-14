import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { formatUzs } from "@/lib/utils";
import { Building2, Users, Crown, Activity } from "lucide-react";

export default async function SuperAdminPage() {
  const [orgCount, userCount, planCount, activeSubCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
    prisma.subscriptionPlan.count({ where: { isActive: true } }),
    prisma.subscription.count({ where: { isActive: true } }),
  ]);

  const recentOrgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { subscription: { include: { plan: { select: { name: true } } } } },
  });

  const stats = [
    { label: "Организаций", value: orgCount, icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Пользователей", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Тарифов", value: planCount, icon: Crown, color: "text-yellow-600", bg: "bg-yellow-50" },
    { label: "Активных подписок", value: activeSubCount, icon: Activity, color: "text-green-600", bg: "bg-green-50" },
  ];

  return (
    <div>
      <Header title="Платформа" subtitle="SuperAdmin панель управления" />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-800 text-sm">Последние организации</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Организация</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Тариф</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentOrgs.map((org) => (
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
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${org.isActive && !org.isBlocked ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {org.isBlocked ? "Заблокирован" : org.isActive ? "Активен" : "Неактивен"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
