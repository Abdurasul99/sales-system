import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

function toCSV(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const escape = (v: string | number | null | undefined) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { organizationId: true } });
  if (!user?.organizationId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // sales | products | expenses | customers
  const orgId = user.organizationId;

  let csv = "";
  let filename = "export.csv";

  if (type === "sales") {
    const sales = await prisma.sale.findMany({
      where: { organizationId: orgId },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    filename = "sales.csv";
    csv = toCSV(
      ["Дата", "Чек №", "Статус", "Тип оплаты", "Сумма", "Скидка", "Итого", "Кол-во товаров"],
      sales.map((s) => [
        new Date(s.createdAt).toLocaleDateString("ru-RU"),
        s.receiptNumber ?? "",
        s.status,
        s.paymentType,
        s.subtotal.toString(),
        s.discountAmount.toString(),
        s.total.toString(),
        s.items.length,
      ])
    );
  } else if (type === "products") {
    const products = await prisma.product.findMany({
      where: { organizationId: orgId, isArchived: false },
      include: { category: { select: { name: true } }, inventory: { select: { quantity: true } } },
      orderBy: { name: "asc" },
    });
    filename = "products.csv";
    csv = toCSV(
      ["Название", "Категория", "Штрихкод", "Артикул", "Единица", "Себестоимость", "Цена продажи", "Остаток", "Активен"],
      products.map((p) => [
        p.name, p.category?.name ?? "", p.barcode ?? "", p.sku ?? "", p.unit,
        p.costPrice.toString(), p.sellingPrice.toString(),
        p.inventory.reduce((s, i) => s + Number(i.quantity), 0),
        p.isActive ? "Да" : "Нет",
      ])
    );
  } else if (type === "expenses") {
    const expenses = await prisma.expense.findMany({
      where: { organizationId: orgId },
      include: { category: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5000,
    });
    filename = "expenses.csv";
    csv = toCSV(
      ["Дата", "Категория", "Описание", "Сумма", "Валюта", "Статус"],
      expenses.map((e) => [
        new Date(e.createdAt).toLocaleDateString("ru-RU"),
        e.category?.name ?? "",
        e.description ?? "",
        e.amount.toString(),
        e.currency,
        e.status,
      ])
    );
  } else if (type === "customers") {
    const customers = await prisma.customer.findMany({
      where: { organizationId: orgId },
      orderBy: { fullName: "asc" },
    });
    filename = "customers.csv";
    csv = toCSV(
      ["Имя", "Телефон", "Email", "Сегмент", "Куплено всего", "Долг", "Бонусы", "Активен"],
      customers.map((c) => [
        c.fullName, c.phone ?? "", c.email ?? "", c.segment ?? "",
        c.totalPurchased.toString(), c.debtAmount.toString(),
        c.bonusBalance.toString(), c.isActive ? "Да" : "Нет",
      ])
    );
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
