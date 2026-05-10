import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { postInventoryMovement } from "../../common/services/inventory-posting.service";
import { postLedgerEntry } from "../../common/services/ledger-posting.service";
import { buildDocumentNumber } from "../../common/utils/number-series";
import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const createPurchaseOrderSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1),
  warehouseId: z.string().min(1),
  supplierId: z.string().min(1),
  currencyCode: z.string().default("UZS"),
  additionalCost: z.coerce.number().min(0).default(0),
  expectedAt: z.string().datetime().optional(),
  note: z.string().optional(),
  receiveNow: z.boolean().default(true),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().positive(),
        unitCost: z.coerce.number().min(0),
        lotCode: z.string().optional(),
        expiryDate: z.string().datetime().optional()
      })
    )
    .min(1)
});

const router = Router();

router.use(requireAuth);

router.get("/orders", requirePermission("purchase.read"), async (req, res) => {
  const orders = await prisma.purchaseOrder.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      supplier: true,
      lines: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ orders });
});

router.post("/orders", requirePermission("purchase.write"), async (req, res, next) => {
  try {
    const payload = createPurchaseOrderSchema.parse(req.body);
    const subtotal = payload.lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
    const total = Number((subtotal + payload.additionalCost).toFixed(2));

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const number = buildDocumentNumber("PO");

      const createdOrder = await tx.purchaseOrder.create({
        data: {
          organizationId: req.auth!.organizationId,
          companyId: payload.companyId,
          branchId: payload.branchId,
          warehouseId: payload.warehouseId,
          supplierId: payload.supplierId,
          createdById: req.auth!.userId,
          number,
          status: payload.receiveNow ? "FULFILLED" : "CONFIRMED",
          currencyCode: payload.currencyCode,
          subtotal,
          additionalCost: payload.additionalCost,
          total,
          paidAmount: total,
          expectedAt: payload.expectedAt ? new Date(payload.expectedAt) : undefined,
          receivedAt: payload.receiveNow ? new Date() : undefined,
          note: payload.note,
          lines: {
            create: payload.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              receivedQty: payload.receiveNow ? line.quantity : 0,
              unitCost: line.unitCost,
              lineTotal: Number((line.quantity * line.unitCost).toFixed(2)),
              lotCode: line.lotCode,
              expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined
            }))
          }
        },
        include: {
          lines: true
        }
      });

      if (payload.receiveNow) {
        for (const line of payload.lines) {
          await postInventoryMovement({
            tx,
            organizationId: req.auth!.organizationId,
            warehouseId: payload.warehouseId,
            productId: line.productId,
            quantity: line.quantity,
            eventType: "PURCHASE_RECEIPT",
            createdById: req.auth!.userId,
            referenceType: "purchase_order",
            referenceId: createdOrder.id,
            note: createdOrder.number,
            lotCode: line.lotCode,
            expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined
          });
        }
      }

      await postLedgerEntry({
        tx,
        organizationId: req.auth!.organizationId,
        companyId: payload.companyId,
        branchId: payload.branchId,
        purchaseOrderId: createdOrder.id,
        createdById: req.auth!.userId,
        direction: "EXPENSE",
        category: "PURCHASE",
        currencyCode: payload.currencyCode,
        amount: total,
        note: createdOrder.number
      });

      return createdOrder;
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export { router as purchasesRouter };
