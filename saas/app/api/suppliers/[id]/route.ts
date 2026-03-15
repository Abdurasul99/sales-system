import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  // Whitelist only updatable fields — prevent mass assignment attacks
  const { companyName, contactName, phone, email, inn, address, notes } = body;

  await prisma.supplier.updateMany({
    where: { id: params.id, organizationId: session.organizationId },
    data: { companyName, contactName, phone, email, inn, address, notes },
  });
  return NextResponse.json({ success: true });
}
