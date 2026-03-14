import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cats = await prisma.incomeCategory.findMany({
    where: { organizationId: session.organizationId },
    include: { _count: { select: { incomes: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(cats);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const cat = await prisma.incomeCategory.create({
    data: { organizationId: session.organizationId, name },
  });
  return NextResponse.json(cat, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await prisma.incomeCategory.delete({ where: { id, organizationId: session.organizationId } });
  return NextResponse.json({ success: true });
}
