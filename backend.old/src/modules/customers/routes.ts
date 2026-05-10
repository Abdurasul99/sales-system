import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const createCustomerSchema = z.object({
  companyId: z.string().min(1),
  segmentId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  type: z.string().default("B2C"),
  segment: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  address: z.string().optional()
});

const createInteractionSchema = z.object({
  customerId: z.string().min(1),
  channel: z.string().min(2),
  summary: z.string().min(3),
  happenedAt: z.string().datetime().optional()
});

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      segmentRef: true,
      interactions: {
        orderBy: { happenedAt: "desc" },
        take: 5
      },
      salesOrders: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ customers });
});

router.post("/", requirePermission("customer.manage"), async (req, res, next) => {
  try {
    const payload = createCustomerSchema.parse(req.body);
    const customer = await prisma.customer.create({
      data: {
        organizationId: req.auth!.organizationId,
        ...payload,
        code: payload.code.toUpperCase()
      }
    });

    res.status(201).json({ customer });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/interactions",
  requirePermission("crm.manage"),
  async (req, res, next) => {
    try {
      const payload = createInteractionSchema.parse(req.body);
      const interaction = await prisma.customerInteraction.create({
        data: {
          organizationId: req.auth!.organizationId,
          customerId: payload.customerId,
          createdById: req.auth!.userId,
          channel: payload.channel,
          summary: payload.summary,
          happenedAt: payload.happenedAt ? new Date(payload.happenedAt) : new Date()
        }
      });

      res.status(201).json({ interaction });
    } catch (error) {
      next(error);
    }
  }
);

export { router as customersRouter };
