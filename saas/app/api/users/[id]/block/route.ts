import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { isBlocked, blockedReason } = await req.json();
  await prisma.user.update({ where: { id: params.id }, data: { isBlocked, blockedReason: blockedReason || null } });
  if (isBlocked) await prisma.session.deleteMany({ where: { userId: params.id } });
  return NextResponse.json({ success: true });
}
