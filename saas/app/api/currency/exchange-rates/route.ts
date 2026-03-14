import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rates, organizationId } = await req.json();
  const orgId = session.organizationId;

  await prisma.exchangeRate.createMany({
    data: rates.map((r: { fromCurrency: string; toCurrency: string; rate: number; source?: string }) => ({
      organizationId: orgId,
      fromCurrency: r.fromCurrency,
      toCurrency: r.toCurrency,
      rate: r.rate,
      source: r.source ?? "MANUAL",
    })),
  });

  return NextResponse.json({ success: true, updatedCount: rates.length });
}
