import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const plans = await prisma.subscriptionPlan.findMany({
    include: { features: true, _count: { select: { subscriptions: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, slug, priceUzs, maxProducts, maxEmployees, maxBranches, billingCycleDays, features } = await req.json();
  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      slug: slug ?? name.toLowerCase().replace(/\s+/g, "-"),
      priceUzs: priceUzs ?? 0,
      maxProducts: maxProducts ?? null,
      maxEmployees: maxEmployees ?? null,
      maxBranches: maxBranches ?? null,
      billingCycleDays: billingCycleDays ?? 30,
      features: features?.length ? { create: features.map((f: { key: string; value: string }) => ({ key: f.key, value: f.value })) } : undefined,
    },
    include: { features: true },
  });
  return NextResponse.json(plan, { status: 201 });
}
