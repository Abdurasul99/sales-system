"use client";

import { useState, useMemo } from "react";
import {
  Search, ShoppingCart, Plus, Minus, Trash2, X, Barcode,
  CreditCard, Banknote, AlertCircle, Printer, Check, Loader2,
} from "lucide-react";
import { cn, formatUzs } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  sku: string | null;
  categoryId: string | null;
  categoryName: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  imageUrl: string | null;
}

interface CartItem extends Product {
  cartQty: number;
  discount: number;
  lineTotal: number;
}

interface SalesPOSProps {
  products: Product[];
  categories: { id: string; name: string }[];
  cashierId: string;
  branchId: string;
  organizationId: string;
}

type PaymentType = "CASH" | "CARD" | "DEBT" | "MIXED";

export function SalesPOS({ products, categories, cashierId, branchId, organizationId }: SalesPOSProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<PaymentType>("CASH");
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (selectedCategory) list = list.filter((p) => p.categoryId === selectedCategory);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.barcode?.includes(search) || p.sku?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, search, selectedCategory]);

  function addToCart(product: Product) {
    if (product.quantity <= 0) {
      toast.error(`${product.name}: нет на складе`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        if (existing.cartQty >= product.quantity) {
          toast.error(`Максимум ${product.quantity} ${product.unit}`);
          return prev;
        }
        return prev.map((i) =>
          i.id === product.id
            ? { ...i, cartQty: i.cartQty + 1, lineTotal: (i.cartQty + 1) * i.sellingPrice - i.discount }
            : i
        );
      }
      return [...prev, { ...product, cartQty: 1, discount: 0, lineTotal: product.sellingPrice }];
    });
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, cartQty: qty, lineTotal: qty * i.sellingPrice - i.discount }
          : i
      )
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.lineTotal, 0);
  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * globalDiscount) / 100
      : globalDiscount;
  const total = Math.max(0, subtotal - discountAmount);

  async function processSale() {
    if (cart.length === 0) { toast.error("Добавьте товары в корзину"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          branchId,
          cashierId,
          paymentType,
          items: cart.map((i) => ({
            productId: i.id,
            quantity: i.cartQty,
            unitPrice: i.sellingPrice,
            costPrice: i.costPrice,
            discount: i.discount,
            total: i.lineTotal,
          })),
          subtotal,
          discountAmount,
          discountType,
          discountValue: globalDiscount,
          total,
          notes,
          currency: "UZS",
        }),
      });

      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Ошибка при оформлении"); return; }

      toast.success("Продажа оформлена!");
      setLastReceipt(data.receiptNumber);
      setCart([]);
      setGlobalDiscount(0);
      setNotes("");
    } catch {
      toast.error("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  }

  const [mobileTab, setMobileTab] = useState<"products" | "cart">("products");

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Mobile tab bar */}
      <div className="lg:hidden flex border-b border-gray-100 bg-white">
        <button
          onClick={() => setMobileTab("products")}
          className={cn("flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors",
            mobileTab === "products" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500")}
        >
          <Search className="w-4 h-4" /> Товары
        </button>
        <button
          onClick={() => setMobileTab("cart")}
          className={cn("flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors relative",
            mobileTab === "cart" ? "border-purple-600 text-purple-700" : "border-transparent text-gray-500")}
        >
          <ShoppingCart className="w-4 h-4" /> Корзина
          {cart.length > 0 && <span className="absolute top-2 right-8 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
      {/* Product grid */}
      <div className={cn("flex-1 flex flex-col overflow-hidden border-r border-gray-100", mobileTab === "cart" ? "hidden lg:flex" : "flex")}>
        {/* Search + filter */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Поиск по названию, штрихкоду, артикулу..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                !selectedCategory ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                  selectedCategory === cat.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => {
                const inCart = cart.find((i) => i.id === product.id);
                const outOfStock = product.quantity <= 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={outOfStock}
                    className={cn(
                      "bg-white border rounded-xl p-3 text-left transition-all hover:shadow-md hover:border-purple-200 active:scale-95",
                      outOfStock && "opacity-50 cursor-not-allowed",
                      inCart && "border-purple-300 bg-purple-50/50"
                    )}
                  >
                    <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{product.name}</p>
                    <p className="text-xs text-gray-400 mb-2">{product.categoryName}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-700">{formatUzs(product.sellingPrice)}</span>
                      {inCart && (
                        <span className="text-xs bg-purple-600 text-white rounded-full px-1.5 py-0.5">
                          {inCart.cartQty}
                        </span>
                      )}
                    </div>
                    <p className={cn("text-xs mt-1", outOfStock ? "text-red-500" : "text-gray-400")}>
                      {outOfStock ? "Нет в наличии" : `${product.quantity} ${product.unit}`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart panel */}
      <div className={cn("w-full lg:w-80 xl:w-96 flex flex-col bg-white", mobileTab === "products" ? "hidden lg:flex" : "flex")}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-gray-900 text-sm">Корзина</span>
            {cart.length > 0 && (
              <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5">{cart.length}</span>
            )}
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600">
              Очистить
            </button>
          )}
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Выберите товары слева</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs font-medium text-gray-800 flex-1 pr-2 leading-tight">{item.name}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.cartQty - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-purple-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">{item.cartQty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.cartQty + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:border-purple-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatUzs(item.lineTotal)}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{formatUzs(item.sellingPrice)} × {item.cartQty}</p>
              </div>
            ))
          )}
        </div>

        {/* Checkout panel */}
        <div className="border-t border-gray-100 p-4 space-y-3">
          {/* Discount */}
          <div className="flex gap-2">
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as "PERCENTAGE" | "FIXED")}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="PERCENTAGE">%</option>
              <option value="FIXED">сум</option>
            </select>
            <input
              type="number"
              min={0}
              max={discountType === "PERCENTAGE" ? 100 : subtotal}
              value={globalDiscount}
              onChange={(e) => {
                const val = Number(e.target.value);
                const capped = discountType === "PERCENTAGE"
                  ? Math.min(100, Math.max(0, val))
                  : Math.max(0, val);
                setGlobalDiscount(capped);
              }}
              placeholder="Скидка"
              className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Подытог</span><span>{formatUzs(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Скидка</span><span>−{formatUzs(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-1.5">
              <span>Итого</span><span>{formatUzs(total)}</span>
            </div>
          </div>

          {/* Payment type */}
          <div className="grid grid-cols-2 gap-2">
            {(["CASH", "CARD", "DEBT", "MIXED"] as PaymentType[]).map((pt) => {
              const labels = { CASH: "Наличные", CARD: "Карта", DEBT: "В долг", MIXED: "Смешанный" };
              const icons = { CASH: Banknote, CARD: CreditCard, DEBT: AlertCircle, MIXED: ShoppingCart };
              const Icon = icons[pt];
              return (
                <button
                  key={pt}
                  onClick={() => setPaymentType(pt)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                    paymentType === pt
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {labels[pt]}
                </button>
              );
            })}
          </div>

          {/* Last receipt success */}
          {lastReceipt && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2">
              <Check className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-700">Продажа оформлена</p>
                <p className="text-xs text-green-500">{lastReceipt}</p>
              </div>
              <button className="ml-auto text-green-400 hover:text-green-600">
                <Printer className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={processSale}
            disabled={loading || cart.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Обработка...</>
            ) : (
              <><Check className="w-4 h-4" />Оформить продажу</>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Mobile floating cart button */}
      {cart.length > 0 && mobileTab === "products" && (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setMobileTab("cart")}
            className="flex items-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-2xl shadow-xl shadow-purple-300"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-semibold">{cart.length} товара</span>
            <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm font-bold">{formatUzs(total)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
