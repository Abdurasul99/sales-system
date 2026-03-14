"use client";
import { useEffect, useState } from "react";
import { Building2, Users, Package, Crown, CheckCircle, XCircle, Ban } from "lucide-react";
import toast from "react-hot-toast";

interface Org {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: string;
  subscription: {
    isActive: boolean;
    endDate: string;
    plan: { name: string };
  } | null;
  _count: { users: number; products: number; sales: number };
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/superadmin/organizations");
    if (res.ok) setOrgs(await res.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    const reason = isBlocked ? undefined : prompt("Причина блокировки:");
    if (!isBlocked && !reason) return;
    const res = await fetch(`/api/superadmin/organizations/${id}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked, blockedReason: reason }),
    });
    if (res.ok) { toast.success(isBlocked ? "Организация разблокирована" : "Организация заблокирована"); load(); }
    else toast.error("Ошибка");
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Организации</h1>
        <p className="text-gray-500 mt-1">Все зарегистрированные организации на платформе</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Организация</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Тариф</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Подписка</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Польз.</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Товары</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Продажи</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : orgs.map(org => {
              const subExpired = org.subscription && new Date(org.subscription.endDate) < new Date();
              return (
                <tr key={org.id} className={`hover:bg-gray-50 transition ${org.isBlocked ? "bg-red-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      <div>
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{org.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {org.subscription ? (
                      <div className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700">{org.subscription.plan.name}</span>
                      </div>
                    ) : <span className="text-gray-400 text-sm">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {org.subscription ? (
                      <span className={subExpired ? "text-red-500" : "text-green-600"}>
                        {subExpired ? "Истекла" : `до ${new Date(org.subscription.endDate).toLocaleDateString("ru")}`}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    <span className="flex items-center justify-end gap-1"><Users className="w-3 h-3" />{org._count.users}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    <span className="flex items-center justify-end gap-1"><Package className="w-3 h-3" />{org._count.products}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-gray-700">{org._count.sales}</td>
                  <td className="px-6 py-4">
                    {org.isBlocked ? (
                      <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                        <XCircle className="w-3 h-3" /> Заблокирована
                      </span>
                    ) : org.isActive ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3 h-3" /> Активна
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Неактивна</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleBlock(org.id, org.isBlocked)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${org.isBlocked ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                      <Ban className="w-3 h-3" /> {org.isBlocked ? "Разблокировать" : "Заблокировать"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && orgs.length === 0 && (
          <div className="py-12 text-center text-gray-400">Нет организаций</div>
        )}
      </div>
    </div>
  );
}
