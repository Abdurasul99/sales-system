"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Tag, XCircle, Loader2 } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category { id: string; name: string; slug: string; isActive: boolean; color: string | null; productCount: number; }

const COLORS = ["#7c3aed","#db2777","#2563eb","#059669","#d97706","#dc2626","#0891b2","#65a30d"];

export function CategoriesManager({ categories: initial, organizationId }: { categories: Category[]; organizationId: string }) {
  const [categories, setCategories] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) { toast.error("Введите название"); return; }
    setSaving(true);
    try {
      const payload = { name, slug: slugify(name), color, organizationId, isActive: true };
      const res = await fetch(editCat ? `/api/categories/${editCat.id}` : "/api/categories", {
        method: editCat ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success(editCat ? "Категория обновлена" : "Категория создана");
      setShowModal(false);
      window.location.reload();
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  async function handleDelete(id: string, productCount: number) {
    if (productCount > 0) { toast.error(`Нельзя удалить: в категории ${productCount} товаров`); return; }
    if (!confirm("Удалить категорию?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) { setCategories((p) => p.filter((c) => c.id !== id)); toast.success("Удалено"); }
    else toast.error("Ошибка");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Всего категорий: <span className="font-semibold text-gray-900">{categories.length}</span></p>
        <button onClick={() => { setEditCat(null); setName(""); setColor(COLORS[0]); setShowModal(true); }} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100">
          <Plus className="w-4 h-4" />Добавить категорию
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center text-center">
          <Tag className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Категории отсутствуют</p>
          <p className="text-gray-300 text-sm mt-1">Создайте первую категорию для организации товаров</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (cat.color ?? "#7c3aed") + "20" }}>
                  <Tag className="w-5 h-5" style={{ color: cat.color ?? "#7c3aed" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.productCount} товаров</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium", cat.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500")}>
                  {cat.isActive ? "Активна" : "Скрыта"}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => { setEditCat(cat); setName(cat.name); setColor(cat.color ?? COLORS[0]); setShowModal(true); }} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-purple-300 hover:text-purple-600">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat.id, cat.productCount)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-300 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editCat ? "Редактировать" : "Новая категория"}</h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Название *</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Напитки" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Цвет</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button key={c} onClick={() => setColor(c)} className={cn("w-7 h-7 rounded-lg transition-all", color === c && "ring-2 ring-offset-2 ring-gray-400 scale-110")} style={{ backgroundColor: c }} />
                  ))}
                </div>
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
