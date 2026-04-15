"use client";

import { useCallback, useDeferredValue, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Package,
  Search,
  TrendingUp,
  Warehouse,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatDateTime, formatNumber, formatUzs } from "@/lib/utils";

type StockStatus = "OUT_OF_STOCK" | "CRITICAL" | "REORDER" | "HEALTHY" | "OVERSTOCK";

interface WarehouseItem {
  id: string;
  quantity: number;
  reservedQty: number;
  availableQty: number;
  avgDailySales: number;
  coverageDays: number | null;
  daysUntilStockout: number | null;
  leadTimeDemand: number;
  suggestedTargetQty: number;
  suggestedReorderQty: number;
  thresholdQty: number;
  dynamicReorderPoint: number;
  stockStatus: StockStatus;
  stockValue: number;
  lastSoldAt: string | null;
  branch: { id: string; name: string };
  product: {
    id: string;
    name: string;
    sku: string | null;
    barcode: string | null;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    minStockLevel: number;
    safetyStockLevel: number;
    reorderPoint: number;
    targetStockLevel: number;
    leadTimeDays: number;
    category: { name: string } | null;
  };
}

interface WarehouseResponse {
  windowDays: number;
  summary: {
    totalSkus: number;
    totalQuantity: number;
    totalAvailableQty: number;
    estimatedStockValue: number;
    outOfStockCount: number;
    criticalCount: number;
    reorderCount: number;
    overstockCount: number;
    suggestedPurchaseQty: number;
  };
  suggestions: Array<{
    inventoryId: string;
    productId: string;
    branchId: string;
    productName: string;
    branchName: string;
    suggestedReorderQty: number;
    stockStatus: StockStatus;
    reason: string;
  }>;
  items: WarehouseItem[];
}

const STATUS_STYLES: Record<StockStatus, string> = {
  OUT_OF_STOCK: "bg-red-100 text-red-700",
  CRITICAL: "bg-orange-100 text-orange-700",
  REORDER: "bg-amber-100 text-amber-700",
  HEALTHY: "bg-green-100 text-green-700",
  OVERSTOCK: "bg-blue-100 text-blue-700",
};

export default function WarehousePage() {
  const [data, setData] = useState<WarehouseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [modal, setModal] = useState<{ type: "RECEIVE" | "WRITEOFF"; item: WarehouseItem } | null>(null);
  const [form, setForm] = useState({ quantity: "", notes: "" });

  const load = useCallback(async (query: string, signal?: AbortSignal) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/warehouse/intelligence?search=${encodeURIComponent(query)}`, {
        signal,
      });
      if (!response.ok) {
        throw new Error("Failed to load warehouse intelligence");
      }

      const payload = (await response.json()) as WarehouseResponse;
      setData(payload);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Failed to load warehouse data.");
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void load(deferredSearch, controller.signal);
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [deferredSearch, load]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!modal) {
      return;
    }

    const response = await fetch("/api/warehouse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: modal.item.product.id,
        branchId: modal.item.branch.id,
        quantity: Number(form.quantity),
        type: modal.type,
        notes: form.notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Warehouse adjustment failed." }));
      toast.error(error.error ?? "Warehouse adjustment failed.");
      return;
    }

    toast.success(modal.type === "RECEIVE" ? "Stock received." : "Stock written off.");
    setModal(null);
    setForm({ quantity: "", notes: "" });
    void load(deferredSearch);
  }

  const summary = data?.summary ?? {
    totalSkus: 0,
    totalQuantity: 0,
    totalAvailableQty: 0,
    estimatedStockValue: 0,
    outOfStockCount: 0,
    criticalCount: 0,
    reorderCount: 0,
    overstockCount: 0,
    suggestedPurchaseQty: 0,
  };
  const items = data?.items ?? [];
  const suggestions = data?.suggestions ?? [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouse intelligence</h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor stock health, replenishment urgency, and operational adjustments.
            </p>
          </div>
          {summary.outOfStockCount + summary.criticalCount + summary.reorderCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {summary.outOfStockCount + summary.criticalCount + summary.reorderCount} lines need attention
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Tracked SKUs</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatNumber(summary.totalSkus)}</p>
          </div>
          <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Out of stock</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{formatNumber(summary.outOfStockCount)}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Reorder now</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">
              {formatNumber(summary.criticalCount + summary.reorderCount)}
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Overstock</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{formatNumber(summary.overstockCount)}</p>
          </div>
          <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Estimated stock value</p>
            <p className="mt-1 text-2xl font-bold text-purple-700">
              {formatUzs(summary.estimatedStockValue)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr,1fr]">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <Warehouse className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Replenishment queue</h2>
                <p className="text-sm text-gray-500">
                  Priority lines based on current stock, lead time, and sales velocity.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                [...Array(4)].map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
                ))
              ) : suggestions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-400">
                  No urgent replenishment suggestions right now.
                </div>
              ) : (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.inventoryId}
                    className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{suggestion.productName}</p>
                          <span
                            className={cn(
                              "rounded-lg px-2 py-0.5 text-xs font-semibold",
                              STATUS_STYLES[suggestion.stockStatus]
                            )}
                          >
                            {suggestion.stockStatus.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{suggestion.branchName}</p>
                        <p className="mt-2 text-sm text-gray-600">{suggestion.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        Buy {formatNumber(suggestion.suggestedReorderQty)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">Current view</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Total on hand</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(summary.totalQuantity)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Available after reservations</span>
                <span className="font-semibold text-gray-900">
                  {formatNumber(summary.totalAvailableQty)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Suggested purchase qty</span>
                <span className="font-semibold text-purple-700">
                  {formatNumber(summary.suggestedPurchaseQty)}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-900">Interpretation</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><code className="rounded bg-red-100 px-1 py-0.5 text-xs font-semibold text-red-700">OUT OF STOCK</code>: no sellable inventory remains.</li>
                <li><code className="rounded bg-orange-100 px-1 py-0.5 text-xs font-semibold text-orange-700">CRITICAL</code>: inventory is below minimum or safety stock.</li>
                <li><code className="rounded bg-yellow-100 px-1 py-0.5 text-xs font-semibold text-yellow-700">REORDER</code>: below reorder point; replenish soon.</li>
                <li><code className="rounded bg-blue-100 px-1 py-0.5 text-xs font-semibold text-blue-700">OVERSTOCK</code>: significantly above suggested target.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search warehouse by product, SKU, or barcode"
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
          <table className="w-full">
            <thead className="border-b border-gray-100 bg-gray-50/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Branch
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  On hand
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  Avg/day
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  Stock cover
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                  Policy
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  Suggested buy
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(8)].map((_, index) => (
                  <tr key={index}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-4 animate-pulse rounded bg-gray-100" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    Nothing matched this warehouse view.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">
                          <Package className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{item.product.name}</span>
                            <span
                              className={cn(
                                "rounded-lg px-2 py-0.5 text-xs font-semibold",
                                STATUS_STYLES[item.stockStatus]
                              )}
                            >
                              {item.stockStatus.replaceAll("_", " ")}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400">
                            {item.product.category?.name ?? "Uncategorized"}
                            {item.product.barcode ? ` / ${item.product.barcode}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{item.branch.name}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-semibold text-gray-900">
                        {formatNumber(item.quantity)} {item.product.unit}
                      </div>
                      <p className="text-xs text-gray-400">
                        Available {formatNumber(item.availableQty)} / Reserved {formatNumber(item.reservedQty)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-600">
                      {formatNumber(item.avgDailySales)} / day
                    </td>
                    <td className="px-4 py-4 text-right text-sm text-gray-600">
                      {item.coverageDays === null ? "No demand" : `${item.coverageDays} days`}
                      <p className="text-xs text-gray-400">
                        {item.lastSoldAt ? `Last sold ${formatDateTime(item.lastSoldAt)}` : "No recent sales"}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <p>Min {item.product.minStockLevel} / Safety {item.product.safetyStockLevel}</p>
                      <p>ROP {item.dynamicReorderPoint} / Target {item.suggestedTargetQty}</p>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-semibold text-purple-700">
                        {formatNumber(item.suggestedReorderQty)} {item.product.unit}
                      </span>
                      <p className="text-xs text-gray-400">{formatUzs(item.stockValue)} value</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setModal({ type: "RECEIVE", item });
                            setForm({ quantity: "", notes: "" });
                          }}
                          className="flex items-center gap-1 rounded-lg bg-green-50 px-3 py-1.5 text-xs text-green-700 transition hover:bg-green-100"
                        >
                          <ArrowDown className="h-3 w-3" />
                          Receive
                        </button>
                        <button
                          onClick={() => {
                            setModal({ type: "WRITEOFF", item });
                            setForm({ quantity: "", notes: "" });
                          }}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-700 transition hover:bg-red-100"
                        >
                          <ArrowUp className="h-3 w-3" />
                          Write off
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 md:hidden">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))
          ) : (
            items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <span
                        className={cn(
                          "rounded-lg px-2 py-0.5 text-[11px] font-semibold",
                          STATUS_STYLES[item.stockStatus]
                        )}
                      >
                        {item.stockStatus.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.branch.name} / {item.product.category?.name ?? "Uncategorized"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatNumber(item.quantity)} {item.product.unit}
                    </p>
                    <p className="text-xs text-gray-400">
                      Buy {formatNumber(item.suggestedReorderQty)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  <p>Available {formatNumber(item.availableQty)} / Avg/day {formatNumber(item.avgDailySales)}</p>
                  <p>ROP {item.dynamicReorderPoint} / Target {item.suggestedTargetQty}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setModal({ type: "RECEIVE", item });
                      setForm({ quantity: "", notes: "" });
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-50 py-2 text-xs text-green-700"
                  >
                    <ArrowDown className="h-3 w-3" />
                    Receive
                  </button>
                  <button
                    onClick={() => {
                      setModal({ type: "WRITEOFF", item });
                      setForm({ quantity: "", notes: "" });
                    }}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-red-50 py-2 text-xs text-red-700"
                  >
                    <ArrowUp className="h-3 w-3" />
                    Write off
                  </button>
                </div>
              </div>
            ))
          )}
          {!loading && items.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">Nothing matched this view.</div>
          )}
        </div>

        {modal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <div className="w-full rounded-t-2xl bg-white shadow-2xl sm:max-w-md sm:rounded-2xl">
              <div
                className={cn(
                  "rounded-t-2xl border-b border-gray-200 p-5 sm:rounded-t-2xl",
                  modal.type === "RECEIVE" ? "bg-green-50" : "bg-red-50"
                )}
              >
                <h2 className="text-base font-semibold text-gray-900">
                  {modal.type === "RECEIVE" ? "Receive stock" : "Write off stock"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {modal.item.product.name} / {modal.item.branch.name} / Available{" "}
                  {formatNumber(modal.item.availableQty)} {modal.item.product.unit}
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4 p-5">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, quantity: event.target.value }))
                    }
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                  <input
                    value={form.notes}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, notes: event.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={
                      modal.type === "WRITEOFF"
                        ? "Damage, expiry, audit correction..."
                        : "Receiving details or supplier reference..."
                    }
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={cn(
                      "flex-1 rounded-lg px-4 py-2.5 text-sm text-white",
                      modal.type === "RECEIVE"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    )}
                  >
                    {modal.type === "RECEIVE" ? "Confirm receive" : "Confirm write-off"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  );
}
