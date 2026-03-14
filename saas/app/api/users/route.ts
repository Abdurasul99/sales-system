import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { fullName, phone, login, password, role, organizationId, branchId, planId, businessName } = await req.json();

  if (!fullName || !phone || !login || !password) {
    return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
  }

  const exists = await prisma.user.findFirst({ where: { OR: [{ login }, { phone }] } });
  if (exists) return NextResponse.json({ error: "Логин или телефон уже используются" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);

  let orgId = organizationId;

  // Create organization if businessName provided and no org selected
  if (!orgId && businessName && role === "ADMIN" && planId) {
    const slug = businessName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const newOrg = await prisma.organization.create({
      data: {
        name: businessName,
        slug,
        subscription: {
          create: {
            planId,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            priceAtPurchase: 0,
            isActive: true,
          },
        },
      },
    });
    orgId = newOrg.id;

    // Create default branch
    await prisma.branch.create({
      data: { organizationId: orgId, name: "Главный филиал", isMainBranch: true },
    });
  }

  const user = await prisma.user.create({
    data: { fullName, phone, login, passwordHash, role, organizationId: orgId || null, branchId: branchId || null, isActive: true },
  });

  return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
