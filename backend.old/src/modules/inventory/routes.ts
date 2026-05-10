import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { postInventoryMovement } from "../../common/services/inventory-posting.service";
import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { calculateAvailability } from "./inventory-domain";

const movementSchema = z.object({
  warehouseId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  eventType: z.enum([
    "PURCHASE_RECEIPT",
    "SALE_ISSUE",
    "RETURN_IN",
    "RETURN_OUT",
    "ADJUSTMENT",
    "RESERVATION",
    "RELEASE",
    "WRITE_OFF",
    "TRANSFER_IN",
    "TRANSFER_OUT"
  ]),
  note: z.string().optional(),
  lotCode: z.string().optional(),
  serialNumber: z.string().optional(),
  expiryDate: z.string().datetime().optional()
});

const router = Router();

router.use(requireAuth);

type InventoryListItem = {
  reserved: unknown;
  onHand: unknown;
  product: {
    reorderPoint: unknown;
  };
};

router.get("/", requirePermission("inventory.read"), async (req, res) => {
  const lowOnly = req.query.lowOnly === "true";
  const inventory = await prisma.inventoryBalance.findMany({
    where: {
      organizationId: req.auth!.organizationId
    },
    include: {
      product: true,
      warehouse: true
    },
    orderBy: { updatedAt: "desc" }
  });

  const items = (inventory as InventoryListItem[])
    .map((item: InventoryListItem) => ({
      ...item,
      available: calculateAvailability({
        onHand: Number(item.onHand),
        reserved: Number(item.reserved)
      })
    }))
    .filter((item: InventoryListItem & { available: number }) =>
      lowOnly ? item.available <= Number(item.product.reorderPoint) : true
    );

  res.json({ items });
});

router.post("/movements", requirePermission("inventory.write"), async (req, res, next) => {
  try {
    const payload = movementSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const posted = await postInventoryMovement({
        tx,
        organizationId: req.auth!.organizationId,
        warehouseId: payload.warehouseId,
        productId: payload.productId,
        quantity: payload.quantity,
        eventType: payload.eventType,
        createdById: req.auth!.userId,
        note: payload.note,
        lotCode: payload.lotCode,
        serialNumber: payload.serialNumber,
        expiryDate: payload.expiryDate ? new Date(payload.expiryDate) : undefined
      });

      return {
        updated: posted.balance,
        movement: posted.movement
      };
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

export { router as inventoryRouter };
