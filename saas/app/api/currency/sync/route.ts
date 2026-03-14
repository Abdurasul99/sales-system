import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

// Called by N8N workflow: Sales - Currency Rate Sync
// Expects: { rates: { USD: number, EUR: number, RUB: number, CNY: number }, date: string }
export async function POST(req: NextRequest) {
  const internalToken = req.headers.get("x-internal-token");
  if (internalToken !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { rates, date } = await req.json();
  if (!rates) return NextResponse.json({ error: "rates required" }, { status: 400 });

  const rateDate = date ? new Date(date) : new Date();
  const currencies = Object.keys(rates);

  // Find all organizations to update rates for
  const orgs = await prisma.organization.findMany({ select: { id: true } });

  const results = [];
  for (const org of orgs) {
    for (const code of currencies) {
      const rate = Number(rates[code]);
      if (!rate || isNaN(rate)) continue;

      const existing = await prisma.exchangeRate.findFirst({
        where: { organizationId: org.id, fromCurrency: code, toCurrency: "UZS" },
      });

      if (existing) {
        await prisma.exchangeRate.update({
          where: { id: existing.id },
          data: { rate, date: rateDate },
        });
      } else {
        await prisma.exchangeRate.create({
          data: { organizationId: org.id, fromCurrency: code, toCurrency: "UZS", rate, date: rateDate },
        });
      }
      results.push({ org: org.id, code, rate });
    }
  }

  return NextResponse.json({ success: true, updated: results.length });
}
