import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { createSessionForUser, setSessionCookie } from "@/lib/auth/session";

// Simple in-memory rate limiter (resets on cold start; sufficient for serverless bursts)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max attempts
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Слишком много попыток. Попробуйте через 15 минут." }, { status: 429 });
    }

    const { login, password } = await req.json();

    if (!login || !password) {
      return NextResponse.json({ error: "Введите логин и пароль" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ login }, { phone: login }],
        isActive: true,
        isBlocked: false,
      },
      include: {
        organization: { include: { subscription: { include: { plan: true } } } },
        branch: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
    }

    // Fire-and-forget — don't block login on a non-critical timestamp update
    prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } }).catch(() => {});

    const token = await createSessionForUser({
      id: user.id,
      role: user.role,
      organizationId: user.organizationId,
      branchId: user.branchId,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
        branchId: user.branchId,
        organizationName: user.organization?.name,
      },
    });

    return setSessionCookie(response, token);
  } catch (error) {
    console.error("[LOGIN]", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
