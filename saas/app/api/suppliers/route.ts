import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const suppliers = await prisma.supplier.findMany({ where: { organizationId: session.organizationId }, orderBy: { companyName: "asc" } });
  return NextResponse.json(suppliers);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { companyName, contactName, phone, email, inn, address, notes } = await req.json();
  if (!companyName) return NextResponse.json({ error: "Название компании обязательно" }, { status: 400 });
  const supplier = await prisma.supplier.create({
    data: { organizationId: session.organizationId, companyName, contactName, phone, email, inn, address: address || null, notes },
  });
  return NextResponse.json(supplier, { status: 201 });
}
