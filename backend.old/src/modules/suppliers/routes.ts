import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const createSupplierSchema = z.object({
  companyId: z.string().min(1),
  name: z.string().min(2),
  code: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  address: z.string().optional(),
  averageLeadDays: z.coerce.number().min(0).default(0)
});

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      purchaseOrders: {
        take: 3,
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ suppliers });
});

router.post("/", requirePermission("supplier.manage"), async (req, res, next) => {
  try {
    const payload = createSupplierSchema.parse(req.body);
    const supplier = await prisma.supplier.create({
      data: {
        organizationId: req.auth!.organizationId,
        ...payload,
        code: payload.code.toUpperCase()
      }
    });

    res.status(201).json({ supplier });
  } catch (error) {
    next(error);
  }
});

export { router as suppliersRouter };
