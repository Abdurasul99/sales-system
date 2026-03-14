"use client";
import { useEffect, useState } from "react";
import { Plus, Building2, MapPin, Phone, Users } from "lucide-react";
import toast from "react-hot-toast";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isMainBranch: boolean;
  organization: { name: string };
  _count: { users: number };
}

interface Org { id: string; name: string }

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ organizationId: "", name: "", address: "", phone: "", isMainBranch: false });

  const load = async () => {
    setLoading(true);
    const [bRes, oRes] = await Promise.all([fetch("/api/branches"), fetch("/api/organizations")]);
    setBranches(await bRes.json());
    if (oRes.ok) setOrgs(await oRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Филиал создан");
      setShowModal(false);
      setForm({ organizationId: "", name: "", address: "", phone: "", isMainBranch: false });
      load();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Ошибка");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Филиалы</h1>
          <p className="text-gray-500 mt-1">Все филиалы всех организаций</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          <Plus className="w-4 h-4" /> Новый филиал
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Название</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Организация</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Адрес</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Сотрудников</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-gray-900">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.organization.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.address ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.address}</span> : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {b.phone ? <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{b.phone}</span> : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b._count.users}</span>
                  </td>
                  <td className="px-6 py-4">
                    {b.isMainBranch
                      ? <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">Главный</span>
                      : <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Дополнительный</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {branches.length === 0 && (
            <div className="py-12 text-center text-gray-400">Нет филиалов</div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Новый филиал</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Организация</label>
                <select value={form.organizationId} onChange={e => setForm(p => ({ ...p, organizationId: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="">Выберите...</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Главный филиал" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
                <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isMainBranch} onChange={e => setForm(p => ({ ...p, isMainBranch: e.target.checked }))} className="rounded text-purple-600" />
                <span className="text-sm text-gray-700">Главный филиал</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">Отмена</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Создать</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
