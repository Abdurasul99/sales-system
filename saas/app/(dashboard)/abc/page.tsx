import { getCurrentUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { formatUzs } from "@/lib/utils";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function ABCPage() {
  const user = await getCurrentUser();
  if (!user || !user.organizationId) redirect("/login");

  // Get all products with their total sales revenue
  const salesItems = await prisma.saleItem.findMany({
    where: { sale: { organizationId: user.organizationId, status: "COMPLETED" } },
    include: { product: { select: { name: true, sku: true } } },
  });

  // Aggregate by product
  const productMap = new Map<string, { name: string; sku: string | null; revenue: number; qty: number }>();
  for (const item of salesItems) {
    if (!item.product) continue;
    const existing = productMap.get(item.productId);
    const itemTotal = Number(item.total);
    const itemQty = Number(item.quantity);
    if (existing) {
      existing.revenue = existing.revenue + itemTotal;
      existing.qty = existing.qty + itemQty;
    } else {
      productMap.set(item.productId, { name: item.product.name, sku: item.product.sku, revenue: itemTotal, qty: itemQty });
    }
  }

  const products = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);

  // ABC classification
  let cumulative = 0;
  const classified = products.map((p) => {
    cumulative += p.revenue;
    const pct = totalRevenue > 0 ? (cumulative / totalRevenue) * 100 : 0;
    const category: "A" | "B" | "C" = pct <= 80 ? "A" : pct <= 95 ? "B" : "C";
    return { ...p, category, pct: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0 };
  });

  const aCount = classified.filter((p) => p.category === "A").length;
  const bCount = classified.filter((p) => p.category === "B").length;
  const cCount = classified.filter((p) => p.category === "C").length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">ABC Анализ</h1>
        <p className="text-sm text-gray-500 mt-0.5">Классификация товаров по вкладу в выручку</p>
      </div>

      {/* Legend cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { cat: "A", label: "Приоритетные", count: aCount, color: "bg-green-50 border-green-200 text-green-700", desc: "80% выручки" },
          { cat: "B", label: "Важные", count: bCount, color: "bg-yellow-50 border-yellow-200 text-yellow-700", desc: "15% выручки" },
          { cat: "C", label: "Второстепенные", count: cCount, color: "bg-gray-50 border-gray-200 text-gray-600", desc: "5% выручки" },
        ].map((item) => (
          <div key={item.cat} className={`border rounded-2xl p-4 ${item.color}`}>
            <div className="text-2xl font-black">{item.cat}</div>
            <div className="text-sm font-semibold mt-1">{item.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{item.count} товаров · {item.desc}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {classified.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Package className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-gray-400">Нет данных о продажах для анализа</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/50 border-b border-gray-50">
                <tr>
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">#</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Товар</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Выручка</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Кол-во продаж</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">Доля %</th>
                  <th className="text-center text-xs text-gray-400 font-medium px-6 py-3">Категория</th>
                </tr>
              </thead>
              <tbody>
                {classified.map((p, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/40">
                    <td className="px-6 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.sku && <p className="text-xs text-gray-400">{p.sku}</p>}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-purple-700">{formatUzs(p.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.qty}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.pct.toFixed(1)}%</td>
                    <td className="px-6 py-3 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold",
                        p.category === "A" ? "bg-green-100 text-green-700" :
                        p.category === "B" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      )}>{p.category}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
