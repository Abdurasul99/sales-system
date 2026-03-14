import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { description, amount, categoryId, currency } = await req.json();
  if (!description || !amount) return NextResponse.json({ error: "Обязательные поля не заполнены" }, { status: 400 });
  const income = await prisma.income.create({
    data: { organizationId: session.organizationId, description, amount, categoryId: categoryId || null, currency: currency || "UZS", createdBy: session.userId },
  });
  return NextResponse.json(income, { status: 201 });
}
