"use client";

import { useState } from "react";
import { Plus, TrendingDown, TrendingUp, Calendar, XCircle, Loader2 } from "lucide-react";
import { cn, formatUzs, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface FinanceRecord {
  id: string; description: string; amount: number; currency: string;
  status: string; date: string; categoryName: string; categoryColor: string; createdBy: string | null;
}

interface FinanceTableProps {
  records: FinanceRecord[];
  categories: { id: string; name: string }[];
  monthTotal: number;
  monthCount: number;
  type: "expense" | "income";
  organizationId: string;
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-green-50 text-green-700",
  PENDING: "bg-yellow-50 text-yellow-700",
  CANCELLED: "bg-red-50 text-red-700",
};
const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: "Подтверждён",
  PENDING: "Ожидает",
  CANCELLED: "Отменён",
};

export function FinanceTable({ records: initialRecords, categories, monthTotal: initialMonthTotal, monthCount: initialMonthCount, type, organizationId }: FinanceTableProps) {
  const [records, setRecords] = useState(initialRecords);
  const [monthTotal, setMonthTotal] = useState(initialMonthTotal);
  const [monthCount, setMonthCount] = useState(initialMonthCount);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", categoryId: categories[0]?.id ?? "", currency: "UZS" });

  const isExpense = type === "expense";
  const Icon = isExpense ? TrendingDown : TrendingUp;
  const color = isExpense ? "text-red-600" : "text-green-600";
  const bgColor = isExpense ? "bg-red-50" : "bg-green-50";
  const borderColor = isExpense ? "border-red-100" : "border-green-100";

  async function handleSave() {
    if (!form.description || !form.amount) { toast.error("Заполните обязательные поля"); return; }
    setSaving(true);
    try {
      const endpoint = isExpense ? "/api/expenses" : "/api/income";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), organizationId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success(isExpense ? "Расход добавлен" : "Доход добавлен");
      const amount = parseFloat(form.amount);
      setRecords((prev) => [...prev, data]);
      setMonthTotal((prev) => prev + amount);
      setMonthCount((prev) => prev + 1);
      setForm({ description: "", amount: "", categoryId: categories[0]?.id ?? "", currency: "UZS" });
      setShowModal(false);
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn("rounded-2xl border p-5 shadow-sm", bgColor, borderColor)}>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isExpense ? "bg-red-100" : "bg-green-100")}>
              <Icon className={cn("w-5 h-5", color)} />
            </div>
            <div>
              <p className="text-xs text-gray-500">За текущий месяц</p>
              <p className={cn("text-xl font-bold", color)}>{formatUzs(monthTotal)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Количество записей</p>
          <p className="text-2xl font-bold text-gray-900">{monthCount}</p>
          <p className="text-xs text-gray-400">за этот месяц</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Средняя сумма</p>
          <p className="text-xl font-bold text-gray-900">{monthCount > 0 ? formatUzs(monthTotal / monthCount) : "—"}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700">{isExpense ? "Список расходов" : "Список доходов"}</h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100">
          <Plus className="w-4 h-4" />{isExpense ? "Добавить расход" : "Добавить доход"}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Icon className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">{isExpense ? "Расходы не найдены" : "Доходы не найдены"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50/50">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Описание</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Категория</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Дата</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">Статус</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-6 py-3">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{r.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: (r.categoryColor ?? "#7c3aed") + "20", color: r.categoryColor ?? "#7c3aed" }}>
                        {r.categoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <Calendar className="w-3 h-3" />
                        {formatDate(r.date)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium", STATUS_STYLES[r.status] ?? "bg-gray-50 text-gray-500")}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className={cn("px-6 py-3 text-right font-bold text-base", color)}>
                      {isExpense ? "−" : "+"}{formatUzs(r.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{isExpense ? "Новый расход" : "Новый доход"}</h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание *</label>
                <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Например: Аренда склада" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Сумма (сум) *</label>
                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Категория</label>
                <select value={form.categoryId} onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Без категории</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />...</> : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
