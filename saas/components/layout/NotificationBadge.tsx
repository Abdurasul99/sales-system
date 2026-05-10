"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotificationCount } from "@/components/providers/NotificationCountProvider";

export function NotificationBadge() {
  const { count } = useNotificationCount();

  return (
    <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
      <Bell className="w-5 h-5 text-gray-600" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
