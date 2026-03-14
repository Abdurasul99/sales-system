"use client";
import { useEffect, useState } from "react";
import { Plus, Package, Users, Building2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Plan {
  id: string;
  name: string;
  priceUzs: number;
  maxProducts: number | null;
  maxEmployees: number | null;
  maxBranches: number | null;
  billingCycleDays: number;
  features: { id: string; key: string; value: string }[];
  _count: { subscriptions: number };
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", priceUzs: "", maxProducts: "", maxEmployees: "", maxBranches: "", billingCycleDays: "30" });

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        priceUzs: Number(form.priceUzs),
        maxProducts: form.maxProducts ? Number(form.maxProducts) : null,
        maxEmployees: form.maxEmployees ? Number(form.maxEmployees) : null,
        maxBranches: form.maxBranches ? Number(form.maxBranches) : null,
        billingCycleDays: Number(form.billingCycleDays),
      }),
    });
    if (res.ok) {
      toast.success("Тариф создан");
      setShowModal(false);
      setForm({ name: "", priceUzs: "", maxProducts: "", maxEmployees: "", maxBranches: "", billingCycleDays: "30" });
      load();
    } else {
      toast.error("Ошибка создания");
    }
  };

  const planColors = ["from-blue-500 to-blue-600", "from-purple-500 to-purple-600", "from-orange-500 to-orange-600", "from-green-500 to-green-600"];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тарифные планы</h1>
          <p className="text-gray-500 mt-1">Управление подписками и ограничениями</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
          <Plus className="w-4 h-4" /> Новый тариф
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, i) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className={`bg-gradient-to-r ${planColors[i % planColors.length]} p-5`}>
                <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                <div className="text-white/80 text-3xl font-bold mt-1">
                  {Number(plan.priceUzs).toLocaleString("ru")} <span className="text-sm font-normal">сум/мес</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span>{plan.maxProducts ? `До ${plan.maxProducts.toLocaleString()} товаров` : "Неограничено"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{plan.maxEmployees ? `До ${plan.maxEmployees} сотрудников` : "Неограничено"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span>{plan.maxBranches ? `До ${plan.maxBranches} филиалов` : "Неограничено"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span><strong>{plan.billingCycleDays}</strong> дней</span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Активных подписок: </span>
                  <span className="font-semibold text-purple-600">{plan._count.subscriptions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Новый тарифный план</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Premium" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Цена (сум)</label>
                  <input type="number" value={form.priceUzs} onChange={e => setForm(p => ({ ...p, priceUzs: e.target.value }))} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дней в цикле</label>
                  <input type="number" value={form.billingCycleDays} onChange={e => setForm(p => ({ ...p, billingCycleDays: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Товаров</label>
                  <input type="number" value={form.maxProducts} onChange={e => setForm(p => ({ ...p, maxProducts: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="∞" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сотруд.</label>
                  <input type="number" value={form.maxEmployees} onChange={e => setForm(p => ({ ...p, maxEmployees: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="∞" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Филиалов</label>
                  <input type="number" value={form.maxBranches} onChange={e => setForm(p => ({ ...p, maxBranches: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="∞" />
                </div>
              </div>
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
