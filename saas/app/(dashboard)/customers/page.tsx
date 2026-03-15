"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, User, Phone, Mail, ShoppingBag, AlertTriangle, Star, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";
import { formatUzs, cn } from "@/lib/utils";

interface Customer {
  id: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  segment: string | null;
  bonusBalance: number;
  cashbackBalance: number;
  debtAmount: number;
  totalPurchased: number;
  isActive: boolean;
  createdAt: string;
  _count: { sales: number };
}

const SEGMENT_STYLES: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  REGULAR: "bg-blue-100 text-blue-700",
  NEW: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debtorFilter, setDebtorFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    segment: "",
  });

  const load = async () => {
    setLoading(true);
    const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search]);

  const filtered = debtorFilter
    ? customers.filter((c) => Number(c.debtAmount) > 0)
    : customers;

  const totalDebt = customers.reduce((sum, c) => sum + Number(c.debtAmount ?? 0), 0);
  const totalBonus = customers.reduce((sum, c) => sum + Number(c.bonusBalance ?? 0), 0);
  const debtorCount = customers.filter((c) => Number(c.debtAmount) > 0).length;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Укажите имя клиента");
      return;
    }
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Клиент добавлен");
      setShowModal(false);
      setForm({ fullName: "", phone: "", email: "", segment: "" });
      load();
    } else {
      const d = await res.json();
      toast.error(d.error ?? "Ошибка");
    }
  };

  const stats = [
    {
      label: "Всего клиентов",
      value: customers.length.toLocaleString("ru-RU"),
      color: "text-purple-700",
      bg: "bg-purple-50",
    },
    {
      label: "Должников",
      value: debtorCount.toLocaleString("ru-RU"),
      color: "text-red-700",
      bg: "bg-red-50",
    },
    {
      label: "Общий долг",
      value: formatUzs(totalDebt),
      color: "text-orange-700",
      bg: "bg-orange-50",
    },
    {
      label: "Бонусный баланс",
      value: formatUzs(totalBonus),
      color: "text-yellow-700",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Клиенты</h1>
          <p className="text-sm text-gray-500 mt-0.5">База клиентов и история покупок</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition text-sm font-medium w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Добавить клиента
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className={cn("rounded-2xl p-4", s.bg)}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={cn("text-lg font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
        </div>
        <button
          onClick={() => setDebtorFilter(!debtorFilter)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors",
            debtorFilter
              ? "bg-red-600 text-white border-red-600"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          )}
        >
          <AlertTriangle className="w-4 h-4" />
          Должники
          {debtorCount > 0 && (
            <span
              className={cn(
                "text-xs font-bold px-1.5 py-0.5 rounded-full",
                debtorFilter ? "bg-white/20 text-white" : "bg-red-100 text-red-600"
              )}
            >
              {debtorCount}
            </span>
          )}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50/70 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Клиент
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Сегмент
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Покупок
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Баланс бонусов
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Долг
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-gray-50/50 transition cursor-pointer"
                  onClick={() => router.push(`/customers/${c.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{c.fullName}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {c.phone && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Phone className="w-2.5 h-2.5" />
                              {c.phone}
                            </span>
                          )}
                          {c.email && (
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Mail className="w-2.5 h-2.5" />
                              {c.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {c.segment ? (
                      <span
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium",
                          SEGMENT_STYLES[c.segment] ?? "bg-gray-100 text-gray-600"
                        )}
                      >
                        {c.segment}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <ShoppingBag className="w-3 h-3 text-gray-400" />
                      {c._count?.sales ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {Number(c.bonusBalance) > 0 ? (
                      <span className="flex items-center justify-end gap-1 text-sm font-medium text-yellow-600">
                        <Star className="w-3 h-3" />
                        {formatUzs(Number(c.bonusBalance))}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {Number(c.debtAmount) > 0 ? (
                      <span className="font-semibold text-red-600 text-sm">
                        {formatUzs(Number(c.debtAmount))}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-medium",
                        c.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      )}
                    >
                      {c.isActive ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400 text-sm">
            {debtorFilter ? "Должников не найдено" : "Клиенты не найдены"}
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))
        ) : (
          filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/customers/${c.id}`)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{c.fullName}</div>
                    {c.segment && (
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-md",
                          SEGMENT_STYLES[c.segment] ?? "bg-gray-100 text-gray-500"
                        )}
                      >
                        {c.segment}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {Number(c.debtAmount) > 0 && (
                    <span className="text-xs font-bold text-red-600">
                      {formatUzs(Number(c.debtAmount))}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                {c.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {c.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" />
                  {c._count?.sales ?? 0} покупок
                </span>
                {Number(c.bonusBalance) > 0 && (
                  <span className="flex items-center gap-1 text-yellow-600">
                    <Star className="w-3 h-3" />
                    {formatUzs(Number(c.bonusBalance))}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 text-sm">
            {debtorFilter ? "Должников не найдено" : "Клиенты не найдены"}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Новый клиент</h2>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
                  required
                  placeholder="Иванов Иван"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+998 ..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Сегмент</label>
                <select
                  value={form.segment}
                  onChange={(e) => setForm((p) => ({ ...p, segment: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="">Выберите сегмент</option>
                  <option value="NEW">Новый</option>
                  <option value="REGULAR">Постоянный</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVE">Неактивный</option>
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 text-sm"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium"
                >
                  Добавить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
