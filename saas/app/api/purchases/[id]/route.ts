import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { status } = await req.json();
  const purchase = await prisma.purchase.update({
    where: { id: params.id },
    data: { status, receivedAt: status === "RECEIVED" ? new Date() : undefined },
  });

  // If received, update inventory for each item
  if (status === "RECEIVED") {
    const items = await prisma.purchaseItem.findMany({ where: { purchaseId: params.id } });
    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { branchId: true } });
    for (const item of items) {
      const inv = await prisma.inventory.findFirst({ where: { productId: item.productId, branchId: user?.branchId ?? "" } });
      if (inv) {
        await prisma.inventory.update({ where: { id: inv.id }, data: { quantity: { increment: item.quantity } } });
      }
    }
  }

  return NextResponse.json(purchase);
}
