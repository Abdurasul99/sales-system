import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Header } from "@/components/layout/Header";
import prisma from "@/lib/db/prisma";
import { Bell, AlertTriangle, Info, CheckCircle, ShoppingCart, Package } from "lucide-react";
import { cn } from "@/lib/utils";

function getNotificationIcon(type: string) {
  switch (type) {
    case "LOW_STOCK":
    case "WARNING":
      return AlertTriangle;
    case "SALE":
      return ShoppingCart;
    case "INVENTORY":
      return Package;
    case "SUCCESS":
      return CheckCircle;
    default:
      return Info;
  }
}

function getNotificationStyle(type: string) {
  switch (type) {
    case "LOW_STOCK":
    case "WARNING":
      return { icon: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" };
    case "ERROR":
      return { icon: "text-red-500", bg: "bg-red-50", border: "border-red-100" };
    case "SUCCESS":
      return { icon: "text-green-500", bg: "bg-green-50", border: "border-green-100" };
    case "SALE":
      return { icon: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" };
    default:
      return { icon: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" };
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Только что";
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return "Вчера";
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit" }).format(new Date(date));
}

function groupByDate(
  notifications: { id: string; type: string; title: string; message: string; isRead: boolean; createdAt: Date; link: string | null }[]
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const groups: { label: string; items: typeof notifications }[] = [
    { label: "Сегодня", items: [] },
    { label: "Вчера", items: [] },
    { label: "Ранее", items: [] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups[0].items.push(n);
    else if (d.getTime() === yesterday.getTime()) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const organizationId = user.organizationId!;

  const notifications = await prisma.notification.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Mark all as read
  await prisma.notification.updateMany({
    where: { organizationId, isRead: false },
    data: { isRead: true },
  });

  const groups = groupByDate(
    notifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      isRead: n.isRead,
      createdAt: n.createdAt,
      link: null as string | null,
    }))
  );

  return (
    <div>
      <Header title="Уведомления" subtitle="Центр уведомлений" />
      <div className="p-6 max-w-3xl">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Нет уведомлений</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Здесь будут появляться уведомления о продажах, складе и других событиях.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groups.map((group) => (
              <div key={group.label}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.items.map((n) => {
                    const Icon = getNotificationIcon(n.type);
                    const style = getNotificationStyle(n.type);
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex gap-4 p-4 rounded-2xl border transition-colors",
                          n.isRead
                            ? "bg-white border-gray-100"
                            : cn("border", style.border, style.bg)
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                            n.isRead ? "bg-gray-100" : style.bg
                          )}
                        >
                          <Icon
                            className={cn("w-5 h-5", n.isRead ? "text-gray-400" : style.icon)}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm font-medium leading-snug",
                                n.isRead ? "text-gray-700" : "text-gray-900"
                              )}
                            >
                              {n.title}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
