import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Called by a cron job every 4 minutes to prevent Neon DB from sleeping.
// Neon free tier auto-pauses after 5 min inactivity — cold start costs 3-5s.
// Set up: curl -s https://your-domain/api/cron/keepalive -H "x-cron-secret: $CRON_SECRET"
export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  await prisma.$queryRaw`SELECT 1`;
  const ms = Date.now() - start;

  return NextResponse.json({ ok: true, ms });
}
