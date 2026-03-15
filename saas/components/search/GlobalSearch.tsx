"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Users, Truck, X, Loader2 } from "lucide-react";
import { cn, formatUzs } from "@/lib/utils";

interface SearchResults {
  products: { id: string; name: string; sellingPrice: number; sku: string | null; barcode: string | null }[];
  customers: { id: string; fullName: string; phone: string | null; debtAmount: number }[];
  suppliers: { id: string; companyName: string; phone: string | null }[];
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults(null); setSelected(0); }
  }, [open]);

  // Debounced search
  const search = useCallback((q: string) => {
    clearTimeout(timerRef.current);
    if (q.length < 2) { setResults(null); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data);
        setSelected(0);
      } finally { setLoading(false); }
    }, 300);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    search(v);
  }

  // Flatten results for keyboard navigation
  const allItems = [
    ...(results?.products ?? []).map((p) => ({ type: "product" as const, id: p.id, label: p.name, sub: p.barcode ?? p.sku ?? "", href: "/products" })),
    ...(results?.customers ?? []).map((c) => ({ type: "customer" as const, id: c.id, label: c.fullName, sub: c.phone ?? "", href: `/customers/${c.id}` })),
    ...(results?.suppliers ?? []).map((s) => ({ type: "supplier" as const, id: s.id, label: s.companyName, sub: s.phone ?? "", href: "/suppliers" })),
  ];

  function handleKeyNav(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelected((s) => Math.min(s + 1, allItems.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); }
    if (e.key === "Enter" && allItems[selected]) { router.push(allItems[selected].href); setOpen(false); }
  }

  const typeIcon = (type: string) => {
    if (type === "product") return <Package className="w-4 h-4 text-purple-500" />;
    if (type === "customer") return <Users className="w-4 h-4 text-blue-500" />;
    return <Truck className="w-4 h-4 text-green-500" />;
  };

  const typeLabel = (type: string) => {
    if (type === "product") return "Товар";
    if (type === "customer") return "Клиент";
    return "Поставщик";
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden lg:flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-all w-56"
      >
        <Search className="w-4 h-4" />
        <span className="flex-1 text-left">Поиск...</span>
        <kbd className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-400">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          {loading ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin shrink-0" /> : <Search className="w-5 h-5 text-gray-400 shrink-0" />}
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyNav}
            placeholder="Поиск товаров, клиентов, поставщиков..."
            className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none"
          />
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Results */}
        {results && allItems.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">Ничего не найдено</div>
        )}

        {results && allItems.length > 0 && (
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {/* Group by type */}
            {(["product", "customer", "supplier"] as const).map((type) => {
              const items = allItems.filter((i) => i.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type}>
                  <p className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-50/50">{typeLabel(type) + "ы"}</p>
                  {items.map((item) => {
                    const idx = allItems.indexOf(item);
                    return (
                      <button
                        key={item.id}
                        onClick={() => { router.push(item.href); setOpen(false); }}
                        className={cn("w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 text-left transition-colors", idx === selected && "bg-purple-50")}
                      >
                        {typeIcon(item.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.label}</p>
                          {item.sub && <p className="text-xs text-gray-400">{item.sub}</p>}
                        </div>
                        <kbd className="text-xs text-gray-300">↵</kbd>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {!results && query.length < 2 && (
          <div className="px-4 py-6">
            <p className="text-xs font-semibold text-gray-400 mb-3">Быстрый переход</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Товары", href: "/products", icon: Package },
                { label: "Клиенты", href: "/customers", icon: Users },
                { label: "Поставщики", href: "/suppliers", icon: Truck },
                { label: "Аналитика", href: "/analytics", icon: Search },
              ].map((item) => (
                <button key={item.href} onClick={() => { router.push(item.href); setOpen(false); }} className="flex items-center gap-2 p-3 border border-gray-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 text-sm text-gray-600 transition-all">
                  <item.icon className="w-4 h-4 text-purple-500" />{item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="px-4 py-2 border-t border-gray-50 flex items-center gap-4 text-xs text-gray-300">
          <span>↑↓ навигация</span>
          <span>↵ открыть</span>
          <span>Esc закрыть</span>
        </div>
      </div>
    </div>
  );
}
