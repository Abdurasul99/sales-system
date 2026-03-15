"use client";
import { useState } from "react";
import { Plus, Truck, Package, ChevronDown, ChevronUp, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { cn, formatUzs, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

type PurchaseStatus = "PENDING" | "RECEIVED" | "PARTIAL" | "CANCELLED";

interface PurchaseItem { productId: string; quantity: number; costPrice: number; total: number; product: { name: string; unit: string } | null; }
interface Purchase {
  id: string; invoiceNumber: string | null; status: PurchaseStatus; total: number; paidAmount: number; debtAmount: number;
  receivedAt: string | null; createdAt: string; notes: string | null;
  supplier: { companyName: string } | null;
  items: PurchaseItem[];
}
interface Supplier { id: string; companyName: string; }
interface Product { id: string; name: string; unit: string; costPrice: number; }

const STATUS_LABEL: Record<PurchaseStatus, string> = { PENDING: "Ожидает", RECEIVED: "Получено", PARTIAL: "Частично", CANCELLED: "Отменено" };
const STATUS_COLOR: Record<PurchaseStatus, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  RECEIVED: "bg-green-50 text-green-700",
  PARTIAL: "bg-blue-50 text-blue-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export function PurchasesClient({ purchases: initial, suppliers, products, organizationId }: { purchases: Purchase[]; suppliers: Supplier[]; products: Product[]; organizationId: string }) {
  const [purchases, setPurchases] = useState(initial);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ supplierId: "", invoiceNumber: "", notes: "" });
  const [items, setItems] = useState<{ productId: string; quantity: string; costPrice: string }[]>([
    { productId: "", quantity: "1", costPrice: "" },
  ]);

  function addItem() { setItems((p) => [...p, { productId: "", quantity: "1", costPrice: "" }]); }
  function removeItem(i: number) { setItems((p) => p.filter((_, idx) => idx !== i)); }

  const total = items.reduce((sum, item) => sum + (parseFloat(item.costPrice) || 0) * (parseFloat(item.quantity) || 0), 0);

  async function handleSave() {
    if (!form.supplierId) { toast.error("Выберите поставщика"); return; }
    const validItems = items.filter((i) => i.productId && parseFloat(i.quantity) > 0 && parseFloat(i.costPrice) >= 0);
    if (validItems.length === 0) { toast.error("Добавьте хотя бы один товар"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId, supplierId: form.supplierId, invoiceNumber: form.invoiceNumber || null, notes: form.notes || null,
          items: validItems.map((i) => ({ productId: i.productId, quantity: parseFloat(i.quantity), costPrice: parseFloat(i.costPrice), total: parseFloat(i.quantity) * parseFloat(i.costPrice) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка"); return; }
      toast.success("Закупка создана");
      setPurchases((p) => [data, ...p]);
      setShowModal(false);
      setForm({ supplierId: "", invoiceNumber: "", notes: "" });
      setItems([{ productId: "", quantity: "1", costPrice: "" }]);
    } catch { toast.error("Ошибка"); } finally { setSaving(false); }
  }

  async function markReceived(id: string) {
    const res = await fetch(`/api/purchases/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "RECEIVED" }) });
    if (res.ok) { setPurchases((p) => p.map((x) => x.id === id ? { ...x, status: "RECEIVED" as PurchaseStatus } : x)); toast.success("Отмечено как получено"); }
    else toast.error("Ошибка");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 text-sm text-gray-500">
          <span>Всего: <b className="text-gray-900">{purchases.length}</b></span>
          <span>Ожидает: <b className="text-yellow-600">{purchases.filter((p) => p.status === "PENDING").length}</b></span>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium shadow-md shadow-purple-100">
          <Plus className="w-4 h-4" />Новая закупка
        </button>
      </div>

      {purchases.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl py-20 flex flex-col items-center text-center shadow-sm">
          <Truck className="w-12 h-12 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Закупок пока нет</p>
          <p className="text-gray-300 text-sm mt-1">Добавьте первую закупку от поставщика</p>
        </div>
      ) : (
        <div className="space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{p.supplier?.companyName ?? "Неизвестный поставщик"}</p>
                  <p className="text-xs text-gray-400">{p.invoiceNumber ? `№${p.invoiceNumber} • ` : ""}{formatDate(p.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-gray-900">{formatUzs(p.total)}</p>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", STATUS_COLOR[p.status])}>{STATUS_LABEL[p.status]}</span>
                </div>
                {expandedId === p.id ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
              </div>
              {expandedId === p.id && (
                <div className="px-5 pb-4 border-t border-gray-50">
                  <table className="w-full text-sm mt-3">
                    <thead><tr className="text-xs text-gray-400"><th className="text-left pb-2">Товар</th><th className="text-right pb-2">Кол-во</th><th className="text-right pb-2">Цена</th><th className="text-right pb-2">Сумма</th></tr></thead>
                    <tbody>
                      {p.items.map((item, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="py-2 text-gray-700">{item.product?.name ?? "—"}</td>
                          <td className="py-2 text-right text-gray-500">{item.quantity} {item.product?.unit}</td>
                          <td className="py-2 text-right text-gray-500">{formatUzs(item.costPrice)}</td>
                          <td className="py-2 text-right font-medium">{formatUzs(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.status === "PENDING" && (
                    <button onClick={() => markReceived(p.id)} className="mt-3 flex items-center gap-2 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium">
                      <CheckCircle className="w-4 h-4" />Отметить как полученное
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Новая закупка</h3>
              <button onClick={() => setShowModal(false)}><XCircle className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Поставщик *</label>
                <select value={form.supplierId} onChange={(e) => setForm((p) => ({ ...p, supplierId: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Выберите поставщика</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Номер накладной</label>
                <input value={form.invoiceNumber} onChange={(e) => setForm((p) => ({ ...p, invoiceNumber: e.target.value }))} placeholder="АКТ-001" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Товары</label>
                  <button onClick={addItem} className="text-xs text-purple-600 hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Добавить строку</button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={item.productId} onChange={(e) => { const prod = products.find((p) => p.id === e.target.value); setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, productId: e.target.value, costPrice: prod ? prod.costPrice.toString() : x.costPrice } : x)); }} className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500">
                        <option value="">Товар</option>
                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input type="number" value={item.quantity} onChange={(e) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, quantity: e.target.value } : x))} placeholder="Кол-во" className="w-20 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      <input type="number" value={item.costPrice} onChange={(e) => setItems((prev) => prev.map((x, idx) => idx === i ? { ...x, costPrice: e.target.value } : x))} placeholder="Цена" className="w-24 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500" />
                      {items.length > 1 && <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><XCircle className="w-4 h-4" /></button>}
                    </div>
                  ))}
                </div>
                {total > 0 && <p className="text-right text-sm font-semibold text-gray-900 mt-2">Итого: {formatUzs(total)}</p>}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">Отмена</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Создать закупку"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
