import { PurchaseStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getSessionFromRequest } from "@/lib/auth/session";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const session = await getSessionFromRequest(req);
  if (!session?.organizationId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = (await req.json()) as { status?: PurchaseStatus };
  if (!status) {
    return NextResponse.json({ error: "status required" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findFirst({
    where: { id: params.id, organizationId: session.organizationId },
    select: {
      id: true,
      branchId: true,
      status: true,
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  if (status === "RECEIVED" && purchase.status === "RECEIVED") {
    return NextResponse.json(
      { error: "Purchase is already received" },
      { status: 400 }
    );
  }

  const updatedPurchase = await prisma.$transaction(async (tx) => {
    const updated = await tx.purchase.update({
      where: { id: params.id },
      data: {
        status,
        receivedAt: status === "RECEIVED" ? new Date() : undefined,
      },
    });

    if (status !== "RECEIVED") {
      return updated;
    }

    const items = await tx.purchaseItem.findMany({
      where: { purchaseId: params.id },
      select: {
        productId: true,
        quantity: true,
      },
    });

    for (const item of items) {
      const existingInventory = await tx.inventory.findUnique({
        where: {
          productId_branchId: {
            productId: item.productId,
            branchId: purchase.branchId,
          },
        },
      });

      const quantityBefore = existingInventory ? Number(existingInventory.quantity) : 0;
      const quantityAfter = quantityBefore + Number(item.quantity);

      const inventory = existingInventory
        ? await tx.inventory.update({
            where: {
              productId_branchId: {
                productId: item.productId,
                branchId: purchase.branchId,
              },
            },
            data: { quantity: quantityAfter },
          })
        : await tx.inventory.create({
            data: {
              productId: item.productId,
              branchId: purchase.branchId,
              quantity: quantityAfter,
            },
          });

      await tx.inventoryMovement.create({
        data: {
          inventoryId: inventory.id,
          type: "IN_PURCHASE",
          quantity: Number(item.quantity),
          quantityBefore,
          quantityAfter,
          referenceId: purchase.id,
          referenceType: "PURCHASE",
          createdBy: session.userId,
        },
      });
    }

    return updated;
  });

  return NextResponse.json(updatedPurchase);
}
