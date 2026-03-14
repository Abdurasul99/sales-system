"use client";
import { useEffect, useState } from "react";
import { Search, Package, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface InventoryItem {
  id: string;
  quantity: number;
  branch: { name: string };
  product: {
    id: string;
    name: string;
    barcode: string | null;
    unit: string;
    minStockLevel: number;
    costPrice: number;
    sellingPrice: number;
    category: { name: string } | null;
  };
}

export default function WarehousePage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<{ type: "RECEIVE" | "WRITEOFF"; item: InventoryItem } | null>(null);
  const [form, setForm] = useState({ quantity: "", notes: "" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/warehouse?search=${encodeURIComponent(search)}`);
      if (!res.ok) throw new Error("Server error");
      setInventory(await res.json());
    } catch {
      toast.error("Ошибка загрузки склада");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    const res = await fetch("/api/warehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: modal.item.product.id,
        quantity: Number(form.quantity),
        type: modal.type,
        notes: form.notes,
      }),
    });
    if (res.ok) {
      toast.success(modal.type === "RECEIVE" ? "Товар принят на склад" : "Списание выполнено");
      setModal(null);
      setForm({ quantity: "", notes: "" });
      load();
    } else {
      const err = await res.json().catch(() => ({ error: "Ошибка" }));
      toast.error(err.error ?? "Ошибка");
    }
  };

  const lowStockCount = inventory.filter(i => Number(i.quantity) <= i.product.minStockLevel).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Склад</h1>
          <p className="text-sm text-gray-500 mt-0.5">Управление остатками товаров</p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{lowStockCount} товаров с низким остатком</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по названию..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Товар</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Категория</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Филиал</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Остаток</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Мин.</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Себест.</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : inventory.map((item) => {
              const qty = Number(item.quantity);
              const isLow = qty <= item.product.minStockLevel;
              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition ${isLow ? "bg-red-50/30" : ""}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Package className={`w-4 h-4 shrink-0 ${isLow ? "text-red-500" : "text-purple-500"}`} />
                      <div>
                        <div className="font-medium text-gray-900">{item.product.name}</div>
                        {item.product.barcode && <div className="text-xs text-gray-400 font-mono">{item.product.barcode}</div>}
                      </div>
                      {isLow && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.product.category?.name ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.branch.name}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                      {qty} {item.product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">
                    {item.product.minStockLevel} {item.product.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">
                    {Number(item.product.costPrice).toLocaleString("ru")} сум
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setModal({ type: "RECEIVE", item }); setForm({ quantity: "", notes: "" }); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100 transition"
                      >
                        <ArrowDown className="w-3 h-3" /> Приход
                      </button>
                      <button
                        onClick={() => { setModal({ type: "WRITEOFF", item }); setForm({ quantity: "", notes: "" }); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100 transition"
                      >
                        <ArrowUp className="w-3 h-3" /> Списание
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && inventory.length === 0 && (
          <div className="py-12 text-center text-gray-400">Товары не найдены</div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)
        ) : inventory.map((item) => {
          const qty = Number(item.quantity);
          const isLow = qty <= item.product.minStockLevel;
          return (
            <div key={item.id} className={`bg-white rounded-xl border p-4 ${isLow ? "border-red-200 bg-red-50/20" : "border-gray-200"}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900">{item.product.name}</span>
                    {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.product.category?.name} · {item.branch.name}</div>
                </div>
                <span className={`text-lg font-bold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                  {qty} <span className="text-xs font-normal text-gray-500">{item.product.unit}</span>
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">Мин: {item.product.minStockLevel} {item.product.unit} · Себест: {Number(item.product.costPrice).toLocaleString("ru")} сум</div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setModal({ type: "RECEIVE", item }); setForm({ quantity: "", notes: "" }); }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-50 text-green-700 rounded-lg text-xs hover:bg-green-100"
                >
                  <ArrowDown className="w-3 h-3" /> Приход
                </button>
                <button
                  onClick={() => { setModal({ type: "WRITEOFF", item }); setForm({ quantity: "", notes: "" }); }}
                  className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 text-red-700 rounded-lg text-xs hover:bg-red-100"
                >
                  <ArrowUp className="w-3 h-3" /> Списание
                </button>
              </div>
            </div>
          );
        })}
        {!loading && inventory.length === 0 && (
          <div className="py-12 text-center text-gray-400">Товары не найдены</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md">
            <div className={`p-5 border-b border-gray-200 rounded-t-2xl sm:rounded-t-xl ${modal.type === "RECEIVE" ? "bg-green-50" : "bg-red-50"}`}>
              <h2 className="text-base font-semibold text-gray-900">
                {modal.type === "RECEIVE" ? "Приход товара" : "Списание товара"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{modal.item.product.name} — остаток: {Number(modal.item.quantity)} {modal.item.product.unit}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество *</label>
                <input
                  type="number" min="1" value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
                <input
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder={modal.type === "WRITEOFF" ? "Брак, истёк срок..." : "Новая поставка..."}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                  Отмена
                </button>
                <button type="submit"
                  className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm ${modal.type === "RECEIVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                  {modal.type === "RECEIVE" ? "Принять" : "Списать"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
