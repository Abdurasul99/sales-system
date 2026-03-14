import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      organization: {
        include: {
          subscription: { include: { plan: { include: { features: true } } } },
        },
      },
      branch: true,
      permissions: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    organizationId: user.organizationId,
    branchId: user.branchId,
    organization: user.organization,
    branch: user.branch,
    permissions: user.permissions,
    plan: user.organization?.subscription?.plan ?? null,
  });
}
