import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { createSession, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
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

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    const token = await createSession(user.id);

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
