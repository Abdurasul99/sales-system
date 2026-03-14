import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session || session.role !== "SUPERADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const orgs = await prisma.organization.findMany({
    include: {
      subscription: { include: { plan: { select: { name: true } } } },
      _count: { select: { users: true, products: true, sales: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orgs);
}
