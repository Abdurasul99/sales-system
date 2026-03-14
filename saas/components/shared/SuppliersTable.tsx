"use client";

import { useState } from "react";
import { Plus, Truck, Phone, Mail, Building2, Edit, XCircle, Loader2, CheckCircle } from "lucide-react";
import { cn, formatUzs } from "@/lib/utils";
import toast from "react-hot-toast";

interface Supplier { id: string; companyName: string; contactName: string | null; phone: string | null; email: string | null; inn: string | null; isActive: boolean; currentBalance: number; purchasesCount: number; }

export function SuppliersTable({ suppliers: initial, organizationId }: { suppliers: Supplier[]; organizationId: string }) {
  const [suppliers, setSuppliers] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ companyName: "", contactName: "", phone: "", email: "", inn: "", address: "", notes: "" });

  async function handleSave() {
    if (!form.companyName.trim()) { toast.error("Введите название компании"); return; }
    setSaving(true);
    try {
      const res = await fetch(editSupplier ? `/api/suppliers/${editSupplier.id}` : "/api/suppliers", {
        method: editSupplier ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, organizationId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success(editSupplier ? "Поставщик обновлён" : "Поставщик добавлен");
      setShowModal(false);
      window.location.reload();
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Всего: <b className="text-gray-900">{suppliers.length}</b></span>
          <span>Активных: <b className="text-green-600">{suppliers.filter((s) => s.isActive).length}</b></span>
        </div>
        <button onClick={() => { setEditSupplier(null); setForm({ companyName: "", contactName: "", phone: "", email: "", inn: "", address: "", notes: "" }); setShowModal(true); }} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100">
          <Plus className="w-4 h-4" />Добавить поставщика
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-20 flex flex-col items-center text-center shadow-sm">
          <Truck className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Поставщики не добавлены</p>
          <p className="text-gray-300 text-sm mt-1">Добавьте поставщика для управления закупками</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{s.companyName}</p>
                    {s.contactName && <p className="text-xs text-gray-400">{s.contactName}</p>}
                  </div>
                </div>
                <span className={cn("px-2 py-1 rounded-lg text-xs font-medium", s.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
                  {s.isActive ? "Активен" : "Неактивен"}
                </span>
              </div>
              <div className="space-y-1.5 mb-3">
                {s.phone && <div className="flex items-center gap-2 text-xs text-gray-500"><Phone className="w-3.5 h-3.5" />{s.phone}</div>}
                {s.email && <div className="flex items-center gap-2 text-xs text-gray-500"><Mail className="w-3.5 h-3.5" />{s.email}</div>}
                {s.inn && <div className="flex items-center gap-2 text-xs text-gray-500"><CheckCircle className="w-3.5 h-3.5" />ИНН: {s.inn}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-400">Закупок: {s.purchasesCount}</p>
                  {s.currentBalance !== 0 && (
                    <p className={cn("text-sm font-semibold", s.currentBalance > 0 ? "text-red-600" : "text-green-600")}>
                      {s.currentBalance > 0 ? "Долг: " : "Переплата: "}{formatUzs(Math.abs(s.currentBalance))}
                    </p>
                  )}
                </div>
                <button onClick={() => { setEditSupplier(s); setForm({ companyName: s.companyName, contactName: s.contactName ?? "", phone: s.phone ?? "", email: s.email ?? "", inn: s.inn ?? "", address: "", notes: "" }); setShowModal(true); }} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-600">
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editSupplier ? "Редактировать" : "Новый поставщик"}</h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Компания *", key: "companyName", placeholder: "ООО Ромашка" },
                { label: "Контактное лицо", key: "contactName", placeholder: "Иванов Иван" },
                { label: "Телефон", key: "phone", placeholder: "+998901234567" },
                { label: "Email", key: "email", placeholder: "info@supplier.uz" },
                { label: "ИНН", key: "inn", placeholder: "123456789" },
                { label: "Адрес", key: "address", placeholder: "г. Ташкент..." },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              ))}
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
