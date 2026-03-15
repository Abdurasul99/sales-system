import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendTelegramMessage, fmtUzs } from "@/lib/telegram/bot";

// Telegram sends POST updates to this URL
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat?.id;
    const text: string = (message.text ?? "").trim();

    if (!chatId) return NextResponse.json({ ok: true });

    // ── /start ────────────────────────────────────────────────────────────────
    if (text === "/start" || text.startsWith("/start ")) {
      await sendTelegramMessage(chatId,
        `👋 <b>Привет! Я бот Sales System.</b>\n\n` +
        `Я помогу вам управлять магазином прямо из Telegram.\n\n` +
        `<b>Для подключения:</b>\n` +
        `1. Зайдите в Sales System → Настройки → Telegram\n` +
        `2. Нажмите «Подключить» и скопируйте код\n` +
        `3. Отправьте мне: <code>/connect ВАШ_КОД</code>\n\n` +
        `<b>После подключения доступны команды:</b>\n` +
        `/today — итоги за сегодня\n` +
        `/stock — товары с низким остатком\n` +
        `/top — топ-5 товаров\n` +
        `/help — все команды`
      );
      return NextResponse.json({ ok: true });
    }

    // ── /connect <token> ───────────────────────────────────────────────────────
    if (text.startsWith("/connect ")) {
      const token = text.replace("/connect ", "").trim();
      const user = await prisma.user.findUnique({ where: { telegramToken: token } });

      if (!user) {
        await sendTelegramMessage(chatId, "❌ Неверный код. Проверьте код в настройках Sales System.");
        return NextResponse.json({ ok: true });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { telegramChatId: String(chatId), telegramToken: null },
      });

      await sendTelegramMessage(chatId,
        `✅ <b>Подключено!</b>\n\nТеперь вы будете получать уведомления о продажах и складе.\n\nНаберите /today чтобы увидеть итоги за сегодня.`
      );
      return NextResponse.json({ ok: true });
    }

    // For all other commands — find user by chatId
    const user = await prisma.user.findFirst({
      where: { telegramChatId: String(chatId) },
      include: { organization: true },
    });

    if (!user || !user.organizationId) {
      await sendTelegramMessage(chatId,
        `⚠️ Аккаунт не привязан. Отправьте /start чтобы начать.`
      );
      return NextResponse.json({ ok: true });
    }

    const orgId = user.organizationId;

    // ── /today ─────────────────────────────────────────────────────────────────
    if (text === "/today") {
      const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);

      const [sales, expenses] = await Promise.all([
        prisma.sale.findMany({
          where: { organizationId: orgId, status: "COMPLETED", createdAt: { gte: todayStart } },
          select: { total: true, paymentType: true },
        }),
        prisma.expense.aggregate({
          where: { organizationId: orgId, createdAt: { gte: todayStart } },
          _sum: { amount: true },
        }),
      ]);

      const revenue = sales.reduce((s, x) => s + Number(x.total), 0);
      const expenseTotal = Number(expenses._sum.amount ?? 0);
      const cashSales = sales.filter(s => s.paymentType === "CASH").length;
      const cardSales = sales.filter(s => s.paymentType === "CARD").length;
      const debtSales = sales.filter(s => s.paymentType === "DEBT").length;

      await sendTelegramMessage(chatId,
        `📊 <b>Итоги за сегодня — ${new Date().toLocaleDateString("ru-RU")}</b>\n\n` +
        `💰 Выручка: <b>${fmtUzs(revenue)}</b>\n` +
        `📉 Расходы: ${fmtUzs(expenseTotal)}\n` +
        `📈 Прибыль: <b>${fmtUzs(revenue - expenseTotal)}</b>\n\n` +
        `🧾 Чеков: <b>${sales.length}</b>\n` +
        `  💵 Наличные: ${cashSales}\n` +
        `  💳 Карта: ${cardSales}\n` +
        `  📋 Долг: ${debtSales}`
      );
      return NextResponse.json({ ok: true });
    }

    // ── /stock ─────────────────────────────────────────────────────────────────
    if (text === "/stock") {
      const items = await prisma.$queryRaw<{ name: string; quantity: number; minStockLevel: number }[]>`
        SELECT p.name, i.quantity, p."minStockLevel"
        FROM "Inventory" i
        JOIN "Product" p ON p.id = i."productId"
        WHERE p."organizationId" = ${orgId}
          AND i.quantity <= p."minStockLevel"
        ORDER BY i.quantity ASC
        LIMIT 10
      `;

      if (!items.length) {
        await sendTelegramMessage(chatId, "✅ <b>Все товары в норме!</b>\nНет товаров с низким остатком.");
      } else {
        const rows = items.map(i => `  • ${i.name}: <b>${i.quantity} шт</b> (мин: ${i.minStockLevel})`).join("\n");
        await sendTelegramMessage(chatId, `⚠️ <b>Низкий остаток (${items.length} товаров):</b>\n\n${rows}`);
      }
      return NextResponse.json({ ok: true });
    }

    // ── /top ───────────────────────────────────────────────────────────────────
    if (text === "/top") {
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

      const topItems = await prisma.$queryRaw<{ name: string; qty: number; revenue: number }[]>`
        SELECT p.name, SUM(si.quantity) as qty, SUM(si.total) as revenue
        FROM "SaleItem" si
        JOIN "Product" p ON p.id = si."productId"
        JOIN "Sale" s ON s.id = si."saleId"
        WHERE s."organizationId" = ${orgId}
          AND s.status = 'COMPLETED'
          AND s."createdAt" >= ${monthStart}
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 5
      `;

      if (!topItems.length) {
        await sendTelegramMessage(chatId, "📦 Нет данных о продажах за текущий месяц.");
      } else {
        const rows = topItems.map((item, i) =>
          `${i + 1}. ${item.name}\n   ${Number(item.qty)} шт · ${fmtUzs(Number(item.revenue))}`
        ).join("\n");
        await sendTelegramMessage(chatId,
          `🏆 <b>Топ-5 товаров (этот месяц):</b>\n\n${rows}`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── /help ──────────────────────────────────────────────────────────────────
    if (text === "/help") {
      await sendTelegramMessage(chatId,
        `📋 <b>Доступные команды:</b>\n\n` +
        `/today — итоги продаж за сегодня\n` +
        `/stock — товары с низким остатком\n` +
        `/top — топ-5 товаров за месяц\n` +
        `/help — список команд\n\n` +
        `💡 Уведомления о продажах и складе приходят автоматически.`
      );
      return NextResponse.json({ ok: true });
    }

    // Unknown command
    await sendTelegramMessage(chatId, `Не понял команду. Наберите /help чтобы увидеть список команд.`);
    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error("[telegram webhook]", err);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
