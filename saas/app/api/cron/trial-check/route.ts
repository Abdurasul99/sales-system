import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { sendEmail, trialExpiryEmail } from "@/lib/email/send";

/**
 * Cron endpoint: check for expiring trials and notify orgs.
 * Trigger via Vercel Cron (vercel.json) or an external scheduler.
 * Protected by CRON_SECRET header.
 *
 * Schedule: daily at 09:00 UTC
 */
export async function GET(request: Request) {
  // Validate cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find subscriptions where isTrial=true and trialEndsAt is in 1 or 3 days
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);
  in3Days.setHours(23, 59, 59, 999);

  const in3DaysStart = new Date(now);
  in3DaysStart.setDate(in3DaysStart.getDate() + 3);
  in3DaysStart.setHours(0, 0, 0, 0);

  const in1DayStart = new Date(now);
  in1DayStart.setDate(in1DayStart.getDate() + 1);
  in1DayStart.setHours(0, 0, 0, 0);

  const in1DayEnd = new Date(now);
  in1DayEnd.setDate(in1DayEnd.getDate() + 1);
  in1DayEnd.setHours(23, 59, 59, 999);

  // Fetch trials expiring in exactly 1 day or 3 days
  const expiringSubscriptions = await (prisma as any).subscription.findMany({
    where: {
      isTrial: true,
      OR: [
        { trialEndsAt: { gte: in3DaysStart, lte: in3Days } },
        { trialEndsAt: { gte: in1DayStart, lte: in1DayEnd } },
      ],
    },
    include: {
      organization: {
        include: {
          users: {
            where: { role: "ADMIN" },
            select: { email: true, fullName: true },
          },
        },
      },
    },
  });

  const results = { notified: 0, errors: 0, skipped: 0 };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://project-mdd25.vercel.app";

  for (const sub of expiringSubscriptions) {
    const org = sub.organization;
    if (!org) { results.skipped++; continue; }

    const trialEndsAt = new Date(sub.trialEndsAt);
    const daysLeft = Math.max(1, Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86400000));

    // Prevent duplicate notifications: check if we already sent one today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const alreadyNotified = await prisma.notification.findFirst({
      where: {
        organizationId: org.id,
        type: "WARNING",
        title: { contains: "пробный период" },
        createdAt: { gte: todayStart },
      },
    });

    if (alreadyNotified) { results.skipped++; continue; }

    // Create in-app notification
    await prisma.notification.create({
      data: {
        organizationId: org.id,
        type: "WARNING",
        title: `Истекает пробный период`,
        message: `Ваш пробный доступ закончится через ${daysLeft} ${daysLeft === 1 ? "день" : "дня"}. Выберите тариф чтобы продолжить.`,
        data: { daysLeft, trialEndsAt: trialEndsAt.toISOString() },
      },
    });

    // Send email to all ADMIN users in the org
    const adminEmails = org.users.map((u: { email: string }) => u.email).filter(Boolean);
    if (adminEmails.length > 0) {
      const upgradeUrl = `${appUrl}/billing`;
      const html = trialExpiryEmail(org.name, daysLeft, upgradeUrl);
      const ok = await sendEmail({
        to: adminEmails,
        subject: `⏰ Пробный период заканчивается через ${daysLeft} ${daysLeft === 1 ? "день" : "дня"} — ${org.name}`,
        html,
      });
      if (ok) results.notified++;
      else results.errors++;
    } else {
      results.notified++;
    }
  }

  return NextResponse.json({
    success: true,
    processed: expiringSubscriptions.length,
    ...results,
    timestamp: now.toISOString(),
  });
}
