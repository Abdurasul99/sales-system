import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const internalToken = req.headers.get("x-internal-token");
  const { organizationId, userId, type, title, message, data } = await req.json();

  if (!organizationId) return NextResponse.json({ error: "organizationId required" }, { status: 400 });

  const notification = await prisma.notification.create({
    data: { organizationId, userId: userId || null, type, title, message, data: data ? JSON.parse(data) : null },
  });

  return NextResponse.json({ success: true, id: notification.id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  const userId = searchParams.get("userId");

  if (!organizationId) return NextResponse.json({ error: "organizationId required" }, { status: 400 });

  const notifications = await prisma.notification.findMany({
    where: { organizationId, ...(userId ? { OR: [{ userId }, { userId: null }] } : {}) },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(notifications);
}
