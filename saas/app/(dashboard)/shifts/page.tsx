import { redirect } from "next/navigation";
import { getCurrentUserBasic as getCurrentUser } from "@/lib/auth/session";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { formatUzs, formatDateTime, formatDate } from "@/lib/utils";
import { ShiftActions } from "./ShiftActions";
import { Clock, User } from "lucide-react";

export default async function ShiftsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "WAREHOUSE_CLERK" || user.role === "SUPPLIER_CONTACT") {
    redirect("/products");
  }

  const organizationId = user.organizationId!;

  const currentShift = await prisma.cashierShift.findFirst({
    where: { cashierId: user.id, status: "OPEN" },
    include: { branch: { select: { name: true } } },
  });

  const recentShifts = await prisma.cashierShift.findMany({
    where: {
      status: "CLOSED",
      branch: { organizationId },
    },
    include: {
      cashier: { select: { fullName: true } },
      branch: { select: { name: true } },
    },
    orderBy: { openedAt: "desc" },
    take: 10,
  });

  const branches = await prisma.branch.findMany({
    where: { organizationId, isActive: true },
    select: { id: true, name: true },
  });

  const defaultBranchId = user.branchId ?? branches[0]?.id ?? "";

  return (
    <div>
      <Header title="Смены" subtitle="Управление кассовыми сменами" />
      <div className="p-6 space-y-6">
        {/* Current shift status */}
        {currentShift ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                  <h3 className="font-semibold text-green-800 text-base">Смена открыта</h3>
                </div>
                <p className="text-sm text-green-700">
                  Начало: {formatDateTime(currentShift.openedAt)}
                </p>
                {currentShift.branch && (
                  <p className="text-sm text-green-600 mt-0.5">
                    Филиал: {currentShift.branch.name}
                  </p>
                )}
                <p className="text-sm text-green-700 mt-1">
                  Начальный баланс:{" "}
                  <span className="font-semibold">
                    {formatUzs(Number(currentShift.openingBalance))}
                  </span>
                </p>
              </div>
              <ShiftActions
                mode="close"
                shiftId={currentShift.id}
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 bg-gray-400 rounded-full" />
                  <h3 className="font-semibold text-gray-700 text-base">Смена закрыта</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Откройте новую смену чтобы начать работу
                </p>
              </div>
              <ShiftActions
                mode="open"
                defaultBranchId={defaultBranchId}
                branches={branches}
              />
            </div>
          </div>
        )}

        {/* Recent shifts table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="font-semibold text-gray-800 text-sm">
              Последние смены
            </h3>
          </div>
          {recentShifts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/50">
                    <th className="text-left text-xs text-gray-400 font-medium px-6 py-3">Кассир</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Филиал</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Начало</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Конец</th>
                    <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">
                      Нач. баланс
                    </th>
                    <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">
                      Кон. баланс
                    </th>
                    <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">
                      Итог продаж
                    </th>
                    <th className="text-center text-xs text-gray-400 font-medium px-4 py-3">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentShifts.map((shift) => (
                    <tr key={shift.id} className="border-b border-gray-50 hover:bg-gray-50/40">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                          </div>
                          <span className="text-gray-800 font-medium">
                            {shift.cashier.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {shift.branch.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {formatDate(shift.openedAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {shift.closedAt ? formatDate(shift.closedAt) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {formatUzs(Number(shift.openingBalance))}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {shift.closingBalance != null
                          ? formatUzs(Number(shift.closingBalance))
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatUzs(Number(shift.totalSales))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            shift.status === "OPEN"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {shift.status === "OPEN" ? "Открыта" : "Закрыта"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <Clock className="w-10 h-10 mb-3" />
              <p className="text-sm text-gray-400">Нет закрытых смен</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
