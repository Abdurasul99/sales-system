import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cats = await prisma.expenseCategory.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const cat = await prisma.expenseCategory.create({
    data: { organizationId: session.organizationId, name },
  });
  return NextResponse.json(cat, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  try {
    await prisma.expenseCategory.delete({ where: { id, organizationId: session.organizationId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Нельзя удалить категорию с расходами" }, { status: 409 });
  }
}
