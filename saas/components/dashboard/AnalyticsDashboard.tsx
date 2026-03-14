"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, ShoppingCart, XCircle,
  AlertTriangle, DollarSign, BarChart2, Package,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { formatUzs, formatDate, PAYMENT_TYPE_LABELS, STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  revenue: number;
  expenses: number;
  otherIncome: number;
  profit: number;
  salesCountMonth: number;
  salesCountWeek: number;
  salesCountToday: number;
  revenueWeek: number;
  revenueToday: number;
  cancelledSales: number;
  lowStockCount: number;
  recentSales: {
    id: string;
    receiptNumber: string;
    total: number;
    status: string;
    paymentType: string;
    cashier: string;
    itemCount: number;
    createdAt: string;
  }[];
  salesByDay: { date: string; total: number; count: number }[];
  topProducts: { productId: string; name: string; total: number; quantity: number }[];
}

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  DEBT: "bg-yellow-100 text-yellow-700",
  PARTIALLY_PAID: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#d8b4fe", "#e9d5ff"];

type Period = "today" | "week" | "month";

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const [period, setPeriod] = useState<Period>("month");

  const periodRevenue = period === "today" ? data.revenueToday : period === "week" ? data.revenueWeek : data.revenue;
  const periodCount = period === "today" ? data.salesCountToday : period === "week" ? data.salesCountWeek : data.salesCountMonth;

  const statCards = [
    {
      label: "Выручка",
      value: formatUzs(periodRevenue),
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Расходы",
      value: formatUzs(data.expenses),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-100",
    },
    {
      label: "Чистая прибыль",
      value: formatUzs(data.profit),
      icon: DollarSign,
      color: data.profit >= 0 ? "text-purple-600" : "text-red-600",
      bg: data.profit >= 0 ? "bg-purple-50" : "bg-red-50",
      border: data.profit >= 0 ? "border-purple-100" : "border-red-100",
    },
    {
      label: "Продаж",
      value: periodCount.toLocaleString("ru-RU"),
      icon: ShoppingCart,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Отменено",
      value: data.cancelledSales.toLocaleString("ru-RU"),
      icon: XCircle,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
    },
    {
      label: "Мало на складе",
      value: data.lowStockCount.toLocaleString("ru-RU"),
      icon: AlertTriangle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-100",
    },
  ];

  if (data.salesCountMonth === 0 && data.expenses === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
          <BarChart2 className="w-10 h-10 text-purple-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет данных для отображения</h3>
        <p className="text-gray-400 text-sm max-w-sm">
          Начните вводить продажи, расходы и доходы чтобы увидеть аналитику здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Period toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-800">Обзор показателей</h2>
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(["today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                period === p
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {p === "today" ? "Сегодня" : p === "week" ? "Неделя" : "Месяц"}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={cn(
                "bg-white rounded-2xl border p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow",
                card.border
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", card.bg)}>
                <Icon className={cn("w-5 h-5", card.color)} />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">{card.label}</p>
                <p className="text-base font-bold text-gray-900 leading-tight">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Выручка по дням</h3>
          {data.salesByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.salesByDay}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v) => v.slice(8)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: number) => [formatUzs(v), "Выручка"]}
                  labelFormatter={(l) => `Дата: ${l}`}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#7c3aed"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
              Нет данных за этот период
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Топ товаров</h3>
          {data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => {
                const maxTotal = data.topProducts[0].total;
                const pct = maxTotal > 0 ? (p.total / maxTotal) * 100 : 0;
                return (
                  <div key={p.productId}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm text-gray-700 font-medium truncate max-w-[140px]">{p.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{p.quantity.toFixed(0)} шт</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i] }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 text-right">{formatUzs(p.total)}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <Package className="w-8 h-8 mb-2" />
              <p className="text-sm">Нет данных</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent sales */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Последние продажи</h3>
        </div>
        {data.recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Чек</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Кассир</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Тип оплаты</th>
                  <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Статус</th>
                  <th className="text-right text-xs text-gray-400 font-medium px-6 py-3">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSales.map((sale) => (
                  <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-900">{sale.receiptNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(sale.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sale.cashier}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {PAYMENT_TYPE_LABELS[sale.paymentType] ?? sale.paymentType}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2.5 py-1 rounded-lg text-xs font-medium", STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600")}>
                        {STATUS_LABELS[sale.status] ?? sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right font-semibold text-gray-900">
                      {formatUzs(sale.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <ShoppingCart className="w-10 h-10 mb-3" />
            <p className="text-sm text-gray-400">Продажи отсутствуют</p>
          </div>
        )}
      </div>
    </div>
  );
}
