import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, clearSessionCookie } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);

  if (session?.sessionId) {
    await prisma.session.deleteMany({ where: { id: session.sessionId } }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  return clearSessionCookie(response);
}
