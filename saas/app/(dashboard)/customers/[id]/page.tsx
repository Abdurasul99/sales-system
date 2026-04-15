import { redirect } from "next/navigation";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { formatUzs, formatDate, PAYMENT_TYPE_LABELS, STATUS_LABELS, cn } from "@/lib/utils";
import { User, Phone, Mail, ShoppingBag, AlertTriangle, Star, Coins } from "lucide-react";
import { DebtPaymentButton } from "./DebtPaymentButton";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  DEBT: "bg-yellow-100 text-yellow-700",
  PARTIALLY_PAID: "bg-orange-100 text-orange-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

const SEGMENT_STYLES: Record<string, string> = {
  VIP: "bg-yellow-100 text-yellow-700",
  REGULAR: "bg-blue-100 text-blue-700",
  NEW: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organizationId = user.organizationId!;

  const customer = await prisma.customer.findFirst({
    where: { id, organizationId },
  });

  if (!customer) redirect("/customers");

  const recentSales = await prisma.sale.findMany({
    where: { customerId: id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      cashier: { select: { fullName: true } },
      _count: { select: { items: true } },
    },
  });

  const debtAmount = Number(customer.debtAmount);
  const bonusBalance = Number(customer.bonusBalance);
  const cashbackBalance = Number(customer.cashbackBalance);
  const totalPurchased = Number(customer.totalPurchased);

  return (
    <div>
      <Header title="Профиль клиента" subtitle={customer.fullName} />
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Customer profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{customer.fullName}</h2>
                {customer.segment && (
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-semibold",
                      SEGMENT_STYLES[customer.segment] ?? "bg-gray-100 text-gray-600"
                    )}
                  >
                    {customer.segment}
                  </span>
                )}
                <span
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-medium",
                    customer.isActive
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  {customer.isActive ? "Активен" : "Неактивен"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-4">
                {customer.phone && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {customer.phone}
                  </span>
                )}
                {customer.email && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {customer.email}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <ShoppingBag className="w-3.5 h-3.5 text-gray-400" />
                  С нами с {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-xs text-purple-500 mb-1">Всего покупок</p>
              <p className="text-lg font-bold text-purple-800">{formatUzs(totalPurchased)}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4">
              <p className="text-xs text-yellow-600 mb-1 flex items-center gap-1">
                <Star className="w-3 h-3" />Бонусы
              </p>
              <p className="text-lg font-bold text-yellow-700">{formatUzs(bonusBalance)}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4">
              <p className="text-xs text-green-600 mb-1">Кэшбэк</p>
              <p className="text-lg font-bold text-green-700">{formatUzs(cashbackBalance)}</p>
            </div>
            <div className={cn("rounded-xl p-4", debtAmount > 0 ? "bg-red-50" : "bg-gray-50")}>
              <p className={cn("text-xs mb-1", debtAmount > 0 ? "text-red-500" : "text-gray-400")}>
                Долг
              </p>
              <p
                className={cn(
                  "text-lg font-bold",
                  debtAmount > 0 ? "text-red-700" : "text-gray-400"
                )}
              >
                {debtAmount > 0 ? formatUzs(debtAmount) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Debt warning */}
        {debtAmount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Задолженность клиента</p>
                <p className="text-sm text-red-600 mt-0.5">
                  Клиент имеет непогашенный долг на сумму{" "}
                  <span className="font-bold">{formatUzs(debtAmount)}</span>
                </p>
              </div>
            </div>
            <DebtPaymentButton customerId={id} debtAmount={debtAmount} />
          </div>
        )}

        {/* Recent purchases */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">Последние покупки</h3>
          </div>
          {recentSales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Чек</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                      Кассир
                    </th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                      Оплата
                    </th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">
                      Статус
                    </th>
                    <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">
                      Товаров
                    </th>
                    <th className="text-right text-xs text-gray-400 font-medium px-6 py-3">
                      Сумма
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <p className="font-medium text-gray-900">{sale.receiptNumber}</p>
                        <p className="text-xs text-gray-400">{formatDate(sale.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{sale.cashier.fullName}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {PAYMENT_TYPE_LABELS[sale.paymentType] ?? sale.paymentType}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-medium",
                            STATUS_STYLES[sale.status] ?? "bg-gray-100 text-gray-600"
                          )}
                        >
                          {STATUS_LABELS[sale.status] ?? sale.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600">
                        {sale._count.items}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-gray-900">
                        {formatUzs(Number(sale.total))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <ShoppingBag className="w-10 h-10 mb-3" />
              <p className="text-sm text-gray-400">Покупок нет</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
