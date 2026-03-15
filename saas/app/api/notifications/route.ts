import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const unread = searchParams.get("unread");

  if (unread === "true") {
    const count = await prisma.notification.count({
      where: { organizationId, isRead: false },
    });
    return NextResponse.json({ count });
  }

  const notifications = await prisma.notification.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  // Also allow internal calls with x-internal-token header (server-to-server only)
  const internalToken = req.headers.get("x-internal-token");
  const validInternalToken = process.env.INTERNAL_API_TOKEN;
  let organizationId: string | null = null;

  if (session) {
    organizationId = session.organizationId;
  } else if (internalToken && validInternalToken && internalToken === validInternalToken) {
    // Validated internal server-to-server call
    const body = await req.json();
    organizationId = body.organizationId ?? null;

    if (!organizationId) {
      return NextResponse.json({ error: "organizationId required" }, { status: 400 });
    }

    const { type, title, message, userId, data } = body;
    const notification = await prisma.notification.create({
      data: {
        organizationId,
        userId: userId || null,
        type,
        title,
        message,
        data: data ? (typeof data === "string" ? JSON.parse(data) : data) : null,
      },
    });
    return NextResponse.json({ success: true, id: notification.id }, { status: 201 });
  } else {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!organizationId) {
    return NextResponse.json({ error: "No organization" }, { status: 400 });
  }

  const body = await req.json();
  const { type, title, message, userId } = body;

  if (!type || !title || !message) {
    return NextResponse.json({ error: "type, title, message обязательны" }, { status: 400 });
  }

  const notification = await prisma.notification.create({
    data: {
      organizationId,
      userId: userId || null,
      type,
      title,
      message,
    },
  });

  return NextResponse.json({ success: true, id: notification.id }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organizationId } = session;
  if (!organizationId) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const { id, all } = body;

  // Mark all unread as read
  if (all === true) {
    const result = await prisma.notification.updateMany({
      where: { organizationId, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ success: true, updated: result.count });
  }

  if (!id) {
    return NextResponse.json({ error: "id обязателен" }, { status: 400 });
  }

  const notification = await prisma.notification.updateMany({
    where: { id, organizationId },
    data: { isRead: true },
  });

  return NextResponse.json({ success: true, updated: notification.count });
}
