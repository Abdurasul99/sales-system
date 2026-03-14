import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.productCategory.findMany({ where: { organizationId: session.organizationId }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, slug, color, organizationId } = await req.json();
  if (!name) return NextResponse.json({ error: "Название обязательно" }, { status: 400 });
  try {
    const cat = await prisma.productCategory.create({ data: { organizationId: session.organizationId, name, slug: slug || name.toLowerCase(), color } });
    return NextResponse.json(cat, { status: 201 });
  } catch { return NextResponse.json({ error: "Категория уже существует" }, { status: 409 }); }
}
