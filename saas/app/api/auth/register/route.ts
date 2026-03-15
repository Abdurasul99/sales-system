import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50) +
    "-" +
    Date.now().toString(36)
  );
}

export async function POST(req: NextRequest) {
  try {
    const { organizationName, fullName, phone, login, password } = await req.json();

    if (
      !organizationName?.trim() ||
      !fullName?.trim() ||
      !phone?.trim() ||
      !login?.trim() ||
      !password
    ) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    // Check login uniqueness
    const existingLogin = await prisma.user.findUnique({ where: { login } });
    if (existingLogin) {
      return NextResponse.json({ error: "Логин уже занят" }, { status: 400 });
    }

    // Check phone uniqueness
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) {
      return NextResponse.json({ error: "Телефон уже зарегистрирован" }, { status: 400 });
    }

    // Find pro plan for trial (fall back to any active plan if pro doesn't exist)
    const premiumPlan =
      (await prisma.subscriptionPlan.findUnique({ where: { slug: "pro" } })) ??
      (await prisma.subscriptionPlan.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "desc" } }));
    if (!premiumPlan) {
      return NextResponse.json({ error: "Тарифные планы не настроены" }, { status: 500 });
    }

    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 30);

    // Create org + subscription + branch + user in transaction
    await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: organizationName.trim(),
          slug: slugify(organizationName),
          subscription: {
            create: {
              planId: premiumPlan.id,
              startDate: new Date(),
              endDate: trialEnd,
              isTrial: true,
              trialEndsAt: trialEnd,
              priceAtPurchase: 0,
              isActive: true,
            } as any,
          },
        },
      });

      const branch = await tx.branch.create({
        data: { organizationId: org.id, name: "Главный офис", isMainBranch: true },
      });

      await tx.user.create({
        data: {
          organizationId: org.id,
          branchId: branch.id,
          fullName: fullName.trim(),
          phone: phone.trim(),
          login: login.trim(),
          passwordHash: await bcrypt.hash(password, 12),
          role: "ADMIN",
        },
      });
    });

    return NextResponse.json({ success: true, message: "Аккаунт создан. 30 дней бесплатно!" });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
