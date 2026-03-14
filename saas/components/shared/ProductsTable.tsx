"use client";

import { useState } from "react";
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn, formatUzs, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryName: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  isActive: boolean;
  imageUrl: string | null;
  createdAt: string;
}

interface ProductFormData {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  unit: string;
  costPrice: string;
  sellingPrice: string;
  minStockLevel: string;
  description: string;
}

export function ProductsTable({
  products: initialProducts,
  categories,
  organizationId,
}: {
  products: Product[];
  categories: { id: string; name: string }[];
  organizationId: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormData>({
    name: "", sku: "", barcode: "", categoryId: "", unit: "шт",
    costPrice: "", sellingPrice: "", minStockLevel: "0", description: "",
  });

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? p.isActive : !p.isActive);
    return matchSearch && matchStatus;
  });

  function openCreate() {
    setEditProduct(null);
    setForm({ name: "", sku: "", barcode: "", categoryId: categories[0]?.id ?? "", unit: "шт", costPrice: "", sellingPrice: "", minStockLevel: "0", description: "" });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.sellingPrice) { toast.error("Заполните обязательные поля"); return; }
    setSaving(true);
    try {
      const payload = { ...form, organizationId, costPrice: parseFloat(form.costPrice) || 0, sellingPrice: parseFloat(form.sellingPrice), minStockLevel: parseInt(form.minStockLevel) || 0 };
      const res = await fetch(editProduct ? `/api/products/${editProduct.id}` : "/api/products", {
        method: editProduct ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success(editProduct ? "Товар обновлён" : "Товар создан");
      setShowModal(false);
      window.location.reload();
    } catch { toast.error("Ошибка сервера"); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить товар?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { setProducts((prev) => prev.filter((p) => p.id !== id)); toast.success("Товар удалён"); }
    else toast.error("Ошибка удаления");
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Поиск по названию, штрихкоду..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">Все</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-purple-100"
        >
          <Plus className="w-4 h-4" />Добавить товар
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Всего товаров</p>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
        </div>
        <div className="bg-white border border-green-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Активных</p>
          <p className="text-2xl font-bold text-green-600">{products.filter((p) => p.isActive).length}</p>
        </div>
        <div className="bg-white border border-red-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Нет на складе</p>
          <p className="text-2xl font-bold text-red-500">{products.filter((p) => p.quantity <= 0).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm font-medium">Товары не найдены</p>
            <p className="text-gray-300 text-xs mt-1">Добавьте первый товар нажав кнопку выше</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50/50">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Товар</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Категория</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Остаток</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Себестоимость</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Цена продажи</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">Статус</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-6 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-4 h-4 text-gray-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          {p.barcode && <p className="text-xs text-gray-400">{p.barcode}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.categoryName}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.quantity <= 0 ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        ) : p.quantity <= 5 ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                        ) : null}
                        <span className={cn("font-medium", p.quantity <= 0 ? "text-red-600" : p.quantity <= 5 ? "text-yellow-600" : "text-gray-900")}>
                          {p.quantity} {p.unit}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">{formatUzs(p.costPrice)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-700">{formatUzs(p.sellingPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      {p.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />Активен
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                          <XCircle className="w-3 h-3" />Скрыт
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditProduct(p); setForm({ name: p.name, sku: p.sku ?? "", barcode: p.barcode ?? "", categoryId: "", unit: p.unit, costPrice: p.costPrice.toString(), sellingPrice: p.sellingPrice.toString(), minStockLevel: "0", description: "" }); setShowModal(true); }} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-all">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-red-300 hover:text-red-500 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{editProduct ? "Редактировать товар" : "Новый товар"}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Название *", key: "name", placeholder: "Название товара" },
                { label: "Артикул (SKU)", key: "sku", placeholder: "SKU-001" },
                { label: "Штрихкод", key: "barcode", placeholder: "4600000000000" },
                { label: "Себестоимость (сум)", key: "costPrice", placeholder: "0", type: "number" },
                { label: "Цена продажи (сум) *", key: "sellingPrice", placeholder: "0", type: "number" },
                { label: "Мин. остаток", key: "minStockLevel", placeholder: "0", type: "number" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                  <input
                    type={type ?? "text"}
                    value={form[key as keyof ProductFormData]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Категория</label>
                <select value={form.categoryId} onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Без категории</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Единица измерения</label>
                <select value={form.unit} onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  {["шт", "кг", "г", "л", "м", "м²", "коробка", "упак"].map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Сохраняем...</> : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
