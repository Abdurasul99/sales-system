import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      organizationId: session.organizationId,
      ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {}),
    },
    include: { _count: { select: { sales: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, phone, email, address, notes } = await req.json();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const customer = await prisma.customer.create({
    data: { organizationId: session.organizationId, name, phone: phone || null, email: email || null, address: address || null, notes: notes || null },
  });
  return NextResponse.json(customer, { status: 201 });
}
