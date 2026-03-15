"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BarChart3, ShoppingCart, Package, Tag, TrendingDown, TrendingUp,
  Truck, DollarSign, Users, Settings, LogOut, ChevronDown,
  Building2, Crown, LayoutDashboard, Warehouse, UserCog, Menu, X,
  Clock, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SidebarProps {
  user: {
    fullName: string;
    role: string;
    organizationName?: string | null;
    planName?: string | null;
  };
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
  children?: { label: string; href: string }[];
  badge?: number;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "ПРОДАЖИ",
    items: [
      { label: "Аналитика", href: "/analytics", icon: BarChart3, roles: ["ADMIN"] },
      { label: "Продажи", href: "/sales", icon: ShoppingCart, roles: ["ADMIN", "CASHIER"] },
      { label: "Смены", href: "/shifts", icon: Clock, roles: ["ADMIN", "CASHIER"] },
    ],
  },
  {
    label: "СКЛАД",
    items: [
      { label: "Товары", href: "/products", icon: Package, roles: ["ADMIN", "WAREHOUSE_CLERK"] },
      { label: "Категории", href: "/categories", icon: Tag, roles: ["ADMIN"] },
      { label: "Склад", href: "/warehouse", icon: Warehouse, roles: ["ADMIN", "WAREHOUSE_CLERK"] },
    ],
  },
  {
    label: "ФИНАНСЫ",
    items: [
      {
        label: "Расходы", href: "/expenses", icon: TrendingDown, roles: ["ADMIN"],
        children: [
          { label: "Список расходов", href: "/expenses" },
          { label: "Категории расходов", href: "/expenses/categories" },
        ],
      },
      {
        label: "Доходы", href: "/income", icon: TrendingUp, roles: ["ADMIN"],
        children: [
          { label: "Список доходов", href: "/income" },
          { label: "Категории доходов", href: "/income/categories" },
        ],
      },
      { label: "Обмен валют", href: "/currency", icon: DollarSign, roles: ["ADMIN"] },
    ],
  },
  {
    label: "РАБОТА",
    items: [
      { label: "Поставщики", href: "/suppliers", icon: Truck, roles: ["ADMIN", "WAREHOUSE_CLERK"] },
      { label: "Клиенты", href: "/customers", icon: Users, roles: ["ADMIN", "CASHIER"] },
      { label: "Уведомления", href: "/notifications", icon: Bell, roles: ["ADMIN", "CASHIER", "WAREHOUSE_CLERK"] },
    ],
  },
  {
    label: "СИСТЕМА",
    items: [
      { label: "Настройки", href: "/settings", icon: Settings, roles: ["ADMIN"] },
    ],
  },
];

const SUPERADMIN_ITEMS: NavItem[] = [
  { label: "Обзор", href: "/superadmin", icon: LayoutDashboard },
  { label: "Организации", href: "/superadmin/organizations", icon: Building2 },
  { label: "Пользователи", href: "/superadmin/users", icon: UserCog },
  { label: "Планы", href: "/superadmin/plans", icon: Crown },
  { label: "Филиалы", href: "/superadmin/branches", icon: Building2 },
];

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Супер Админ",
  ADMIN: "Администратор",
  CASHIER: "Кассир",
  WAREHOUSE_CLERK: "Кладовщик",
  SUPPLIER_CONTACT: "Поставщик",
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const isSuperAdmin = user.role === "SUPERADMIN";

  useEffect(() => {
    if (isSuperAdmin) return;
    fetch("/api/notifications?unread=true")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d && typeof d.count === "number") setUnreadCount(d.count); })
      .catch(() => {});
  }, [isSuperAdmin]);

  function toggleGroup(href: string) {
    setOpenGroups((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Вы вышли из системы");
    router.push("/login");
    router.refresh();
  }

  const SidebarContent = () => {
    if (isSuperAdmin) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
            <div className="flex-shrink-0 w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight">Sales System</p>
                <p className="text-xs text-red-500 font-medium">SuperAdmin</p>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ml-auto text-gray-400 hover:text-gray-600 hidden lg:block"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 scrollbar-hide">
            {SUPERADMIN_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-gray-100 p-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-700 text-sm font-bold">
                  {user.fullName.charAt(0).toUpperCase()}
                </span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                  <p className="text-xs text-gray-400">{ROLE_LABELS[user.role] || user.role}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
          <div className="flex-shrink-0 w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight">Sales System</p>
              {user.organizationName && (
                <p className="text-xs text-gray-400 truncate">{user.organizationName}</p>
              )}
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-gray-400 hover:text-gray-600 hidden lg:block"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
          {NAV_GROUPS.map((group) => {
            const filteredItems = group.items.filter(
              (item) => !item.roles || item.roles.includes(user.role)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={group.label} className="mb-3">
                {!collapsed && (
                  <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = item.children
                      ? item.children.some((c) => pathname === c.href)
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                    const isGroupOpen = openGroups.includes(item.href);
                    const Icon = item.icon;
                    const showBadge = item.href === "/notifications" && unreadCount > 0;

                    if (item.children) {
                      return (
                        <div key={item.href}>
                          <button
                            onClick={() => toggleGroup(item.href)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                              isActive
                                ? "bg-purple-50 text-purple-700"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left">{item.label}</span>
                                <ChevronDown
                                  className={cn(
                                    "w-3.5 h-3.5 transition-transform",
                                    isGroupOpen && "rotate-180"
                                  )}
                                />
                              </>
                            )}
                          </button>
                          {isGroupOpen && !collapsed && (
                            <div className="ml-7 mt-0.5 space-y-0.5">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => setMobileOpen(false)}
                                  className={cn(
                                    "block px-3 py-2 rounded-lg text-sm transition-all",
                                    pathname === child.href
                                      ? "bg-purple-50 text-purple-700 font-medium"
                                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative",
                          isActive
                            ? "bg-purple-600 text-white shadow-md shadow-purple-200"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <Icon className="w-4 h-4" />
                          {showBadge && collapsed && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                          )}
                        </div>
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {showBadge && (
                              <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-gray-100 p-3">
          {user.planName && !collapsed && (
            <div className="px-3 py-2 bg-purple-50 rounded-xl mb-2">
              <p className="text-xs text-purple-600 font-medium">Тариф: {user.planName}</p>
            </div>
          )}
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-700 text-sm font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-400">{ROLE_LABELS[user.role] || user.role}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Выйти"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-white border border-gray-200 rounded-xl flex items-center justify-center shadow-sm"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-200 sidebar-transition",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 z-50 h-screen w-60 bg-white border-r border-gray-100 transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
