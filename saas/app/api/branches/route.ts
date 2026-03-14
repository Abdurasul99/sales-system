import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  const branches = await prisma.branch.findMany({
    where: organizationId ? { organizationId } : {},
    include: { organization: { select: { name: true } }, _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(branches);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { organizationId, name, address, phone, isMainBranch } = await req.json();
  if (!organizationId || !name) return NextResponse.json({ error: "organizationId and name required" }, { status: 400 });
  const branch = await prisma.branch.create({
    data: { organizationId, name, address: address || null, phone: phone || null, isMainBranch: isMainBranch ?? false },
  });
  return NextResponse.json(branch, { status: 201 });
}
