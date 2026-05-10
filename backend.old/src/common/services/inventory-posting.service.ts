import { Prisma } from "@prisma/client";

import {
  calculateAvailability,
  issueInventory,
  receiveInventory,
  reserveInventory
} from "../../modules/inventory/inventory-domain";

export type InventoryLedgerEvent =
  | "PURCHASE_RECEIPT"
  | "SALE_ISSUE"
  | "RETURN_IN"
  | "RETURN_OUT"
  | "ADJUSTMENT"
  | "RESERVATION"
  | "RELEASE"
  | "WRITE_OFF"
  | "TRANSFER_IN"
  | "TRANSFER_OUT";

type PostInventoryMovementInput = {
  tx: Prisma.TransactionClient;
  organizationId: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  eventType: InventoryLedgerEvent;
  createdById?: string;
  referenceType?: string;
  referenceId?: string;
  note?: string;
  lotId?: string;
  lotCode?: string;
  serialNumber?: string;
  expiryDate?: Date;
};

function resolveNextSnapshot(input: {
  current: { onHand: number; reserved: number };
  quantity: number;
  eventType: InventoryLedgerEvent;
}) {
  if (
    input.eventType === "PURCHASE_RECEIPT" ||
    input.eventType === "RETURN_IN" ||
    input.eventType === "TRANSFER_IN"
  ) {
    return receiveInventory(input.current, input.quantity);
  }

  if (input.eventType === "RESERVATION") {
    return reserveInventory(input.current, input.quantity);
  }

  return issueInventory(input.current, input.quantity);
}

export async function postInventoryMovement(input: PostInventoryMovementInput) {
  const balance = await input.tx.inventoryBalance.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: input.warehouseId,
        productId: input.productId
      }
    },
    update: {},
    create: {
      organizationId: input.organizationId,
      warehouseId: input.warehouseId,
      productId: input.productId,
      onHand: 0,
      reserved: 0,
      available: 0
    }
  });

  const current = {
    onHand: Number(balance.onHand),
    reserved: Number(balance.reserved)
  };
  const nextSnapshot = resolveNextSnapshot({
    current,
    quantity: input.quantity,
    eventType: input.eventType
  });

  let lotId: string | undefined = input.lotId;

  if (input.lotId && !input.lotCode) {
    await input.tx.inventoryLot.update({
      where: { id: input.lotId },
      data: {
        quantity:
          input.eventType === "PURCHASE_RECEIPT" ||
          input.eventType === "RETURN_IN" ||
          input.eventType === "TRANSFER_IN"
            ? { increment: input.quantity }
            : { decrement: input.quantity }
      }
    });
  } else if (input.lotCode) {
    const lot = await input.tx.inventoryLot.upsert({
      where: {
        warehouseId_productId_code: {
          warehouseId: input.warehouseId,
          productId: input.productId,
          code: input.lotCode
        }
      },
      update: {
        serialNumber: input.serialNumber,
        expiryDate: input.expiryDate,
        quantity:
          input.eventType === "PURCHASE_RECEIPT" ||
          input.eventType === "RETURN_IN" ||
          input.eventType === "TRANSFER_IN"
            ? { increment: input.quantity }
            : { decrement: input.quantity }
      },
      create: {
        organizationId: input.organizationId,
        warehouseId: input.warehouseId,
        productId: input.productId,
        code: input.lotCode,
        serialNumber: input.serialNumber,
        expiryDate: input.expiryDate,
        quantity:
          input.eventType === "PURCHASE_RECEIPT" ||
          input.eventType === "RETURN_IN" ||
          input.eventType === "TRANSFER_IN"
            ? input.quantity
            : 0
      }
    });

    lotId = lot.id;
  }

  const updatedBalance = await input.tx.inventoryBalance.update({
    where: { id: balance.id },
    data: {
      onHand: nextSnapshot.onHand,
      reserved: nextSnapshot.reserved,
      available: calculateAvailability(nextSnapshot)
    }
  });

  const movement = await input.tx.inventoryMovement.create({
    data: {
      organizationId: input.organizationId,
      inventoryBalanceId: balance.id,
      lotId,
      createdById: input.createdById,
      eventType: input.eventType,
      quantity: input.quantity,
      beforeOnHand: current.onHand,
      afterOnHand: nextSnapshot.onHand,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      note: input.note
    }
  });

  return {
    balance: updatedBalance,
    movement,
    lotId
  };
}
