import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";

const createWarehouseSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().optional(),
  name: z.string().min(2),
  code: z.string().min(2),
  address: z.string().optional()
});

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const warehouses = await prisma.warehouse.findMany({
    where: {
      company: {
        organizationId: req.auth!.organizationId
      }
    },
    include: {
      branch: true,
      locations: true,
      inventory: {
        take: 10
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ warehouses });
});

router.post("/", requirePermission("warehouse.manage"), async (req, res, next) => {
  try {
    const payload = createWarehouseSchema.parse(req.body);
    const warehouse = await prisma.warehouse.create({
      data: {
        ...payload,
        code: payload.code.toUpperCase()
      }
    });

    res.status(201).json({ warehouse });
  } catch (error) {
    next(error);
  }
});

export { router as warehousesRouter };
