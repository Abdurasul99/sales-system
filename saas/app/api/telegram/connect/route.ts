import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";
import { randomBytes } from "crypto";

// GET — returns current Telegram status + connection token
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { telegramChatId: true, telegramToken: true },
  });

  return NextResponse.json({
    connected: !!dbUser?.telegramChatId,
    token: dbUser?.telegramToken ?? null,
  });
}

// POST — generate a new connection token
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = randomBytes(6).toString("hex").toUpperCase(); // e.g. "A3F9B2"

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramToken: token, telegramChatId: null },
  });

  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "salessystemuz_bot";

  return NextResponse.json({
    token,
    connectUrl: `https://t.me/${botUsername}?start=connect`,
    command: `/connect ${token}`,
  });
}

// DELETE — disconnect Telegram
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: user.id },
    data: { telegramChatId: null, telegramToken: null },
  });

  return NextResponse.json({ success: true });
}
