import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, slug, color, isActive } = await req.json();
  const cat = await prisma.productCategory.updateMany({ where: { id: params.id, organizationId: session.organizationId }, data: { name, slug, color, isActive } });
  return NextResponse.json(cat);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.productCategory.deleteMany({ where: { id: params.id, organizationId: session.organizationId } });
  return NextResponse.json({ success: true });
}
