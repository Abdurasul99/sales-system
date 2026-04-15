"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Loader2,
  Package,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn, formatNumber, formatUzs } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  categoryId: string | null;
  categoryName: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  minStockLevel: number;
  safetyStockLevel: number;
  reorderPoint: number;
  targetStockLevel: number;
  leadTimeDays: number;
  description: string | null;
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
  safetyStockLevel: string;
  reorderPoint: string;
  targetStockLevel: string;
  leadTimeDays: string;
  description: string;
}

const PAGE_SIZE = 20;

function buildEmptyForm(categories: { id: string; name: string }[]): ProductFormData {
  return {
    name: "",
    sku: "",
    barcode: "",
    categoryId: categories[0]?.id ?? "",
    unit: "pcs",
    costPrice: "",
    sellingPrice: "",
    minStockLevel: "0",
    safetyStockLevel: "0",
    reorderPoint: "0",
    targetStockLevel: "0",
    leadTimeDays: "0",
    description: "",
  };
}

function getAttentionThreshold(product: Pick<Product, "minStockLevel" | "safetyStockLevel" | "reorderPoint">) {
  return Math.max(product.minStockLevel, product.safetyStockLevel, product.reorderPoint);
}

function normalizeProduct(
  data: Partial<Product> & Record<string, unknown>,
  categories: { id: string; name: string }[],
  fallback?: Product
): Product {
  const categoryId = (data.categoryId as string | null | undefined) ?? fallback?.categoryId ?? null;
  const categoryName =
    (data.categoryName as string | undefined) ??
    categories.find((category) => category.id === categoryId)?.name ??
    fallback?.categoryName ??
    "Uncategorized";

  return {
    id: String(data.id ?? fallback?.id ?? ""),
    name: String(data.name ?? fallback?.name ?? ""),
    sku: (data.sku as string | null | undefined) ?? fallback?.sku ?? null,
    barcode: (data.barcode as string | null | undefined) ?? fallback?.barcode ?? null,
    categoryId,
    categoryName,
    unit: String(data.unit ?? fallback?.unit ?? "pcs"),
    costPrice: Number(data.costPrice ?? fallback?.costPrice ?? 0),
    sellingPrice: Number(data.sellingPrice ?? fallback?.sellingPrice ?? 0),
    minStockLevel: Number(data.minStockLevel ?? fallback?.minStockLevel ?? 0),
    safetyStockLevel: Number(data.safetyStockLevel ?? fallback?.safetyStockLevel ?? 0),
    reorderPoint: Number(data.reorderPoint ?? fallback?.reorderPoint ?? 0),
    targetStockLevel: Number(data.targetStockLevel ?? fallback?.targetStockLevel ?? 0),
    leadTimeDays: Number(data.leadTimeDays ?? fallback?.leadTimeDays ?? 0),
    description: (data.description as string | null | undefined) ?? fallback?.description ?? null,
    quantity: Number(data.quantity ?? fallback?.quantity ?? 0),
    isActive: Boolean(data.isActive ?? fallback?.isActive ?? true),
    imageUrl: (data.imageUrl as string | null | undefined) ?? fallback?.imageUrl ?? null,
    createdAt: String(data.createdAt ?? fallback?.createdAt ?? new Date().toISOString()),
  };
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductFormData>(buildEmptyForm(categories));
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function handleSearch(value: string) {
    setSearch(value);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  }

  const filtered = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.barcode?.includes(debouncedSearch);
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" ? product.isActive : !product.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [debouncedSearch, filterStatus, products]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const lowStockCount = products.filter(
    (product) => product.quantity <= getAttentionThreshold(product)
  ).length;

  function openCreate() {
    setEditProduct(null);
    setForm(buildEmptyForm(categories));
    setShowModal(true);
  }

  function openEdit(product: Product) {
    setEditProduct(product);
    setForm({
      name: product.name,
      sku: product.sku ?? "",
      barcode: product.barcode ?? "",
      categoryId: product.categoryId ?? "",
      unit: product.unit,
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      minStockLevel: product.minStockLevel.toString(),
      safetyStockLevel: product.safetyStockLevel.toString(),
      reorderPoint: product.reorderPoint.toString(),
      targetStockLevel: product.targetStockLevel.toString(),
      leadTimeDays: product.leadTimeDays.toString(),
      description: product.description ?? "",
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.sellingPrice) {
      toast.error("Name and selling price are required.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        organizationId,
        costPrice: parseFloat(form.costPrice) || 0,
        sellingPrice: parseFloat(form.sellingPrice) || 0,
        minStockLevel: parseInt(form.minStockLevel, 10) || 0,
        safetyStockLevel: parseInt(form.safetyStockLevel, 10) || 0,
        reorderPoint: parseInt(form.reorderPoint, 10) || 0,
        targetStockLevel: parseInt(form.targetStockLevel, 10) || 0,
        leadTimeDays: parseInt(form.leadTimeDays, 10) || 0,
      };

      const response = await fetch(
        editProduct ? `/api/products/${editProduct.id}` : "/api/products",
        {
          method: editProduct ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save product.");
        return;
      }

      const normalized = normalizeProduct(data, categories, editProduct ?? undefined);

      if (editProduct) {
        setProducts((current) =>
          current.map((product) => (product.id === editProduct.id ? normalized : product))
        );
      } else {
        setProducts((current) => [normalized, ...current]);
      }

      toast.success(editProduct ? "Product updated." : "Product created.");
      setShowModal(false);
      setEditProduct(null);
      setForm(buildEmptyForm(categories));
    } catch {
      toast.error("Server error while saving product.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Archive this product?")) {
      return;
    }

    const response = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!response.ok) {
      toast.error("Failed to archive product.");
      return;
    }

    setProducts((current) => current.filter((product) => product.id !== id));
    toast.success("Product archived.");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-xl gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search by product, SKU, or barcode"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value as "all" | "active" | "inactive")
            }
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-purple-100 transition-all hover:bg-purple-700"
        >
          <Plus className="h-4 w-4" />
          Add product
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Total products</p>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(products.length)}</p>
        </div>
        <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Active catalog</p>
          <p className="text-2xl font-bold text-green-600">
            {formatNumber(products.filter((product) => product.isActive).length)}
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Needs replenishment</p>
          <p className="text-2xl font-bold text-amber-600">{formatNumber(lowStockCount)}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">No products found.</p>
            <p className="mt-1 text-xs text-gray-300">
              Create products here and manage their replenishment policy.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-50 bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Policy</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((product) => {
                  const threshold = getAttentionThreshold(product);
                  const isLowStock = product.quantity <= threshold;
                  const isOutOfStock = product.quantity <= 0;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 transition-colors hover:bg-gray-50/40"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                            {product.imageUrl ? (
                              <>
                                {/* Product images can be tenant-provided remote URLs, so avoid hard-coded image host rules here. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="h-full w-full rounded-lg object-cover"
                                />
                              </>
                            ) : (
                              <Package className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">{product.name}</p>
                            <p className="truncate text-xs text-gray-400">
                              {[product.sku, product.barcode].filter(Boolean).join(" / ") || "No identifiers"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{product.categoryName}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isOutOfStock || isLowStock) && (
                            <AlertTriangle
                              className={cn(
                                "h-3.5 w-3.5",
                                isOutOfStock ? "text-red-500" : "text-amber-500"
                              )}
                            />
                          )}
                          <span
                            className={cn(
                              "font-medium",
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-gray-900"
                            )}
                          >
                            {formatNumber(product.quantity)} {product.unit}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-gray-400">
                          Min {product.minStockLevel} / Safety {product.safetyStockLevel}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        <p>ROP {product.reorderPoint} / Target {product.targetStockLevel}</p>
                        <p>Lead time {product.leadTimeDays} days</p>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {formatUzs(product.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-purple-700">
                        {formatUzs(product.sellingPrice)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                            <XCircle className="h-3 w-3" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:border-purple-300 hover:text-purple-600"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-all hover:border-red-300 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-50 bg-gray-50/30 px-6 py-3">
            <p className="text-xs text-gray-400">
              {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                const pageNumber =
                  totalPages <= 5
                    ? index + 1
                    : Math.max(1, Math.min(page - 2, totalPages - 4)) + index;

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={cn(
                      "h-7 w-7 rounded-lg text-xs font-medium",
                      pageNumber === page
                        ? "bg-purple-600 text-white"
                        : "border border-gray-200 text-gray-500 hover:bg-gray-100"
                    )}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                disabled={page === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {editProduct ? "Edit product" : "New product"}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Keep pricing and replenishment policy together.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Product name</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Premium sunflower oil"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, categoryId: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Unit</label>
                <input
                  value={form.unit}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, unit: event.target.value }))
                  }
                  placeholder="pcs"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                <input
                  value={form.sku}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="SKU-001"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Barcode</label>
                <input
                  value={form.barcode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, barcode: event.target.value }))
                  }
                  placeholder="4600000000000"
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Cost price</label>
                <input
                  type="number"
                  min="0"
                  value={form.costPrice}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, costPrice: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Selling price
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.sellingPrice}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, sellingPrice: event.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="md:col-span-2 rounded-2xl border border-purple-100 bg-purple-50/50 p-4">
                <p className="text-sm font-semibold text-gray-900">Stock policy</p>
                <p className="mt-1 text-xs text-gray-500">
                  These values drive replenishment alerts and warehouse intelligence.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Minimum stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.minStockLevel}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          minStockLevel: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Safety stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.safetyStockLevel}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          safetyStockLevel: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Reorder point
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.reorderPoint}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          reorderPoint: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Target stock
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.targetStockLevel}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          targetStockLevel: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Lead time (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.leadTimeDays}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          leadTimeDays: event.target.value,
                        }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {editProduct ? "Save changes" : "Create product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
