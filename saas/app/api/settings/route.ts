import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await prisma.organization.findUnique({
    where: { id: session.organizationId },
    select: { name: true, phone: true, address: true, timezone: true, primaryCurrency: true },
  });
  return NextResponse.json(org ?? {});
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN" && session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, phone, address, timezone, primaryCurrency } = await req.json();
  const org = await prisma.organization.update({
    where: { id: session.organizationId },
    data: {
      ...(name ? { name } : {}),
      phone: phone ?? null,
      address: address ?? null,
      timezone: timezone ?? "Asia/Tashkent",
      primaryCurrency: primaryCurrency ?? "UZS",
    },
  });
  return NextResponse.json({ success: true, id: org.id });
}
