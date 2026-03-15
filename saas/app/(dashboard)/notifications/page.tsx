"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, ShoppingCart, Package, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "LOW_STOCK":
    case "WARNING": return AlertTriangle;
    case "SALE": return ShoppingCart;
    case "INVENTORY": return Package;
    case "SUCCESS": return CheckCircle;
    default: return Info;
  }
}

function getNotificationStyle(type: string) {
  switch (type) {
    case "LOW_STOCK":
    case "WARNING": return { icon: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" };
    case "ERROR": return { icon: "text-red-500", bg: "bg-red-50", border: "border-red-100" };
    case "SUCCESS": return { icon: "text-green-500", bg: "bg-green-50", border: "border-green-100" };
    case "SALE": return { icon: "text-purple-500", bg: "bg-purple-50", border: "border-purple-100" };
    default: return { icon: "text-blue-500", bg: "bg-blue-50", border: "border-blue-100" };
  }
}

// Map notification type to destination link
function getNotificationLink(n: Notification): string | null {
  switch (n.type) {
    case "LOW_STOCK": return "/warehouse";
    case "SALE": return "/sales";
    case "INVENTORY": return "/warehouse";
    case "SUCCESS": return n.data?.shiftId ? "/shifts" : null;
    case "WARNING": return "/analytics";
    default: return null;
  }
}

function formatRelativeTime(date: string): string {
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

function groupByDate(notifications: Notification[]) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  const groups = [
    { label: "Сегодня", items: [] as Notification[] },
    { label: "Вчера", items: [] as Notification[] },
    { label: "Ранее", items: [] as Notification[] },
  ];

  for (const n of notifications) {
    const d = new Date(n.createdAt); d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups[0].items.push(n);
    else if (d.getTime() === yesterday.getTime()) groups[1].items.push(n);
    else groups[2].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  async function markAsRead(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const groups = groupByDate(notifications);

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Уведомления</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {unreadCount > 0 ? `${unreadCount} непрочитанных` : "Все прочитаны"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            Прочитать все
          </button>
        )}
      </div>

      <div className="p-6 max-w-3xl">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
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
                    const link = getNotificationLink(n);

                    const inner = (
                      <div
                        className={cn(
                          "flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer",
                          n.isRead
                            ? "bg-white border-gray-100 hover:border-gray-200"
                            : cn("border", style.border, style.bg, "hover:opacity-90")
                        )}
                        onClick={() => !n.isRead && markAsRead(n.id)}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", n.isRead ? "bg-gray-100" : style.bg)}>
                          <Icon className={cn("w-5 h-5", n.isRead ? "text-gray-400" : style.icon)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={cn("text-sm font-medium leading-snug", n.isRead ? "text-gray-700" : "text-gray-900")}>
                              {n.title}
                            </p>
                            <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                              {formatRelativeTime(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                          {link && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 mt-1.5 font-medium">
                              Перейти <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        {!n.isRead && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    );

                    return link ? (
                      <Link key={n.id} href={link} onClick={() => !n.isRead && markAsRead(n.id)}>
                        {inner}
                      </Link>
                    ) : (
                      <div key={n.id}>{inner}</div>
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
