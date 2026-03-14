"use client";

import { useState } from "react";
import { Plus, Search, Shield, CheckCircle, XCircle, Loader2, Lock, UserX } from "lucide-react";
import { cn, formatDateTime, ROLE_LABELS, ROLE_COLORS } from "@/lib/utils";
import toast from "react-hot-toast";

interface User { id: string; fullName: string; phone: string; login: string; role: string; isActive: boolean; isBlocked: boolean; organizationName: string; branchName: string; lastActiveAt: string | null; createdAt: string; }
interface Plan { id: string; name: string; slug: string; }
interface Branch { id: string; name: string; organizationId: string; }
interface Organization { id: string; name: string; }

const ROLES = ["ADMIN", "CASHIER", "WAREHOUSE_CLERK", "SUPPLIER_CONTACT"];

export function SuperAdminUsersTable({ users: initial, plans, branches, organizations }: { users: User[]; plans: Plan[]; branches: Branch[]; organizations: Organization[] }) {
  const [users, setUsers] = useState(initial);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", login: "", password: "", role: "ADMIN", organizationId: organizations[0]?.id ?? "", branchId: "", planId: plans[0]?.id ?? "", businessName: "" });

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) || u.login.toLowerCase().includes(search.toLowerCase())
  );

  async function handleCreate() {
    if (!form.fullName || !form.phone || !form.login || !form.password) { toast.error("Заполните все обязательные поля"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success("Пользователь создан");
      setShowModal(false);
      window.location.reload();
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  async function toggleBlock(userId: string, isBlocked: boolean) {
    const res = await fetch(`/api/users/${userId}/block`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBlocked: !isBlocked }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isBlocked: !isBlocked } : u));
      toast.success(isBlocked ? "Пользователь разблокирован" : "Пользователь заблокирован");
    } else toast.error("Ошибка");
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center justify-between flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Поиск по имени, телефону, логину..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100">
          <Plus className="w-4 h-4" />Создать пользователя
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Shield className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Пользователи не найдены</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50/50">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Пользователь</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Роль</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Организация / Филиал</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Последняя активность</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">Статус</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-6 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-purple-700 text-sm font-bold">{u.fullName.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.fullName}</p>
                          <p className="text-xs text-gray-400">{u.phone} · {u.login}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium", ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-500")}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs font-medium">{u.organizationName}</p>
                      <p className="text-gray-400 text-xs">{u.branchName}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{u.lastActiveAt ? formatDateTime(u.lastActiveAt) : "Не входил"}</td>
                    <td className="px-4 py-3 text-center">
                      {u.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-medium"><Lock className="w-3 h-3" />Заблокирован</span>
                      ) : u.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium"><CheckCircle className="w-3 h-3" />Активен</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium"><XCircle className="w-3 h-3" />Неактивен</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => toggleBlock(u.id, u.isBlocked)} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ml-auto", u.isBlocked ? "border-green-200 text-green-600 hover:bg-green-50" : "border-red-200 text-red-500 hover:bg-red-50")}>
                        <UserX className="w-3 h-3" />{u.isBlocked ? "Разблокировать" : "Заблокировать"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Создать пользователя</h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "ФИО *", key: "fullName", placeholder: "Иванов Иван Иванович" },
                { label: "Телефон *", key: "phone", placeholder: "+998901234567" },
                { label: "Логин *", key: "login", placeholder: "user123" },
                { label: "Пароль *", key: "password", type: "password", placeholder: "••••••••" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input type={type ?? "text"} value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Роль</label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => (
                    <button key={role} onClick={() => setForm((p) => ({ ...p, role }))} className={cn("px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left", form.role === role ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 text-gray-600 hover:border-purple-300")}>
                      {ROLE_LABELS[role]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Организация</label>
                <select value={form.organizationId} onChange={(e) => setForm((p) => ({ ...p, organizationId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Тариф (для новой орг.)</label>
                <select value={form.planId} onChange={(e) => setForm((p) => ({ ...p, planId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Отмена</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />...</> : "Создать"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
