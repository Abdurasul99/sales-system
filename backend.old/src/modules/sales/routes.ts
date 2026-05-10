import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { postInventoryMovement } from "../../common/services/inventory-posting.service";
import { postLedgerEntry } from "../../common/services/ledger-posting.service";
import { buildDocumentNumber } from "../../common/utils/number-series";
import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAuditLog } from "../audit/audit.service";
import { calculateSalesTotals } from "./sales-domain";

const leadSchema = z.object({
  customerId: z.string().optional(),
  title: z.string().min(3),
  source: z.string().optional(),
  expectedValue: z.coerce.number().min(0).optional(),
  currencyCode: z.string().default("UZS")
});

const dealSchema = z.object({
  customerId: z.string().optional(),
  leadId: z.string().optional(),
  title: z.string().min(3),
  expectedValue: z.coerce.number().min(0).optional(),
  probability: z.coerce.number().min(0).max(100).default(0),
  currencyCode: z.string().default("UZS")
});

const createSalesOrderSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1),
  warehouseId: z.string().min(1),
  customerId: z.string().optional(),
  dealId: z.string().optional(),
  currencyCode: z.string().default("UZS"),
  discountAmount: z.coerce.number().min(0).default(0),
  taxAmount: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        lotId: z.string().optional(),
        quantity: z.coerce.number().positive(),
        unitPrice: z.coerce.number().min(0),
        costPrice: z.coerce.number().min(0),
        discount: z.coerce.number().min(0).default(0)
      })
    )
    .min(1)
});

const router = Router();

router.use(requireAuth);

router.get("/pipeline", requirePermission("sales.read"), async (req, res) => {
  const [leads, deals] = await Promise.all([
    prisma.lead.findMany({
      where: { organizationId: req.auth!.organizationId },
      include: { customer: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.deal.findMany({
      where: { organizationId: req.auth!.organizationId },
      include: { customer: true, lead: true },
      orderBy: { createdAt: "desc" }
    })
  ]);

  res.json({ leads, deals });
});

router.post("/leads", requirePermission("sales.write"), async (req, res, next) => {
  try {
    const payload = leadSchema.parse(req.body);
    const lead = await prisma.lead.create({
      data: {
        organizationId: req.auth!.organizationId,
        customerId: payload.customerId,
        ownerId: req.auth!.userId,
        title: payload.title,
        source: payload.source,
        expectedValue: payload.expectedValue,
        currencyCode: payload.currencyCode
      }
    });

    res.status(201).json({ lead });
  } catch (error) {
    next(error);
  }
});

router.post("/deals", requirePermission("sales.write"), async (req, res, next) => {
  try {
    const payload = dealSchema.parse(req.body);
    const deal = await prisma.deal.create({
      data: {
        organizationId: req.auth!.organizationId,
        customerId: payload.customerId,
        leadId: payload.leadId,
        ownerId: req.auth!.userId,
        title: payload.title,
        expectedValue: payload.expectedValue,
        probability: payload.probability,
        currencyCode: payload.currencyCode
      }
    });

    res.status(201).json({ deal });
  } catch (error) {
    next(error);
  }
});

router.get("/orders", requirePermission("sales.read"), async (req, res) => {
  const orders = await prisma.salesOrder.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      customer: true,
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

router.post("/orders", requirePermission("sales.write"), async (req, res, next) => {
  try {
    const payload = createSalesOrderSchema.parse(req.body);
    const totals = calculateSalesTotals(payload.lines, payload.discountAmount, payload.taxAmount);

    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const number = buildDocumentNumber("SO");

      for (const line of payload.lines) {
        await postInventoryMovement({
          tx,
          organizationId: req.auth!.organizationId,
          warehouseId: payload.warehouseId,
          productId: line.productId,
          quantity: line.quantity,
          eventType: "SALE_ISSUE",
          createdById: req.auth!.userId,
          referenceType: "sales_order",
          note: number,
          lotId: line.lotId
        });
      }

      const createdOrder = await tx.salesOrder.create({
        data: {
          organizationId: req.auth!.organizationId,
          companyId: payload.companyId,
          branchId: payload.branchId,
          warehouseId: payload.warehouseId,
          customerId: payload.customerId,
          dealId: payload.dealId,
          createdById: req.auth!.userId,
          number,
          status: "FULFILLED",
          currencyCode: payload.currencyCode,
          subtotal: totals.subtotal,
          discountAmount: payload.discountAmount,
          taxAmount: payload.taxAmount,
          total: totals.total,
          paidAmount: totals.total,
          marginAmount: totals.marginAmount,
          note: payload.note,
          lines: {
            create: totals.lines.map((line, index) => ({
              productId: payload.lines[index]!.productId,
              lotId: payload.lines[index]!.lotId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              costPrice: line.costPrice,
              discount: line.discount,
              total: line.total
            }))
          }
        },
        include: {
          lines: true
        }
      });

      await postLedgerEntry({
        tx,
        organizationId: req.auth!.organizationId,
        companyId: payload.companyId,
        branchId: payload.branchId,
        salesOrderId: createdOrder.id,
        createdById: req.auth!.userId,
        direction: "INCOME",
        category: "SALE",
        currencyCode: payload.currencyCode,
        amount: totals.total,
        note: createdOrder.number
      });

      return createdOrder;
    });

    await writeAuditLog({
      prisma,
      organizationId: req.auth!.organizationId,
      userId: req.auth!.userId,
      action: "create",
      entity: "sales_order",
      entityId: order.id,
      payload: { number: order.number, total: order.total.toString() }
    });

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

export { router as salesRouter };
