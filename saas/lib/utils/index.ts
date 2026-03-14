import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUzs(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  return new Intl.NumberFormat("ru-RU", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + " сум";
}

export function formatNumber(amount: number | string | null | undefined): string {
  const num = Number(amount ?? 0);
  return new Intl.NumberFormat("ru-RU").format(num);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateReceiptNumber(prefix = "RCP"): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function calcProfit(revenue: number, cost: number): number {
  return revenue - cost;
}

export function calcProfitMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0;
  return Math.round(((revenue - cost) / revenue) * 100 * 10) / 10;
}

export const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Супер Админ",
  ADMIN: "Администратор",
  CASHIER: "Кассир",
  WAREHOUSE_CLERK: "Кладовщик",
  SUPPLIER_CONTACT: "Поставщик",
};

export const ROLE_COLORS: Record<string, string> = {
  SUPERADMIN: "bg-red-100 text-red-700",
  ADMIN: "bg-purple-100 text-purple-700",
  CASHIER: "bg-blue-100 text-blue-700",
  WAREHOUSE_CLERK: "bg-orange-100 text-orange-700",
  SUPPLIER_CONTACT: "bg-green-100 text-green-700",
};

export const PLAN_COLORS: Record<string, string> = {
  basic: "bg-gray-100 text-gray-700",
  plus: "bg-blue-100 text-blue-700",
  premium: "bg-purple-100 text-purple-700",
  platinum: "bg-yellow-100 text-yellow-700",
};

export const PAYMENT_TYPE_LABELS: Record<string, string> = {
  CASH: "Наличные",
  CARD: "Карта",
  DEBT: "В долг",
  MIXED: "Смешанный",
  TRANSFER: "Перевод",
};

export const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Выполнен",
  CANCELLED: "Отменён",
  DEBT: "Долг",
  PARTIALLY_PAID: "Частично оплачен",
  REFUNDED: "Возврат",
  PENDING: "Ожидает",
  RECEIVED: "Получен",
  PARTIAL: "Частично",
};
