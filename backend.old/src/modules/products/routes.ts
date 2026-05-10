import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAuditLog } from "../audit/audit.service";

const createProductSchema = z.object({
  companyId: z.string().min(1),
  categoryId: z.string().optional(),
  unitId: z.string().min(1),
  name: z.string().min(2),
  article: z.string().min(2),
  barcode: z.string().optional(),
  description: z.string().optional(),
  baseCost: z.coerce.number().min(0).default(0),
  basePrice: z.coerce.number().min(0).default(0),
  reorderPoint: z.coerce.number().min(0).default(0),
  safetyStock: z.coerce.number().min(0).default(0),
  leadTimeDays: z.coerce.number().min(0).default(0),
  trackExpiry: z.boolean().default(false),
  trackBatch: z.boolean().default(false),
  currencyCode: z.string().default("UZS")
});

const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional()
});

const createUnitSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  precision: z.coerce.number().min(0).max(4).default(0)
});

const router = Router();

router.use(requireAuth);

router.get("/meta", async (req, res) => {
  const organizationId = req.auth!.organizationId;
  const [companies, categories, units, currencies] = await Promise.all([
    prisma.company.findMany({
      where: { organization: { id: organizationId } },
      orderBy: { name: "asc" }
    }),
    prisma.productCategory.findMany({
      where: { organizationId },
      orderBy: { name: "asc" }
    }),
    prisma.unitOfMeasure.findMany({
      where: { organizationId },
      orderBy: { name: "asc" }
    }),
    prisma.currency.findMany({
      where: { organizationId },
      orderBy: { code: "asc" }
    })
  ]);

  res.json({ companies, categories, units, currencies });
});

router.get("/", async (req, res) => {
  const products = await prisma.product.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      category: true,
      unit: true,
      attributes: {
        include: {
          attribute: true
        }
      },
      inventory: {
        include: {
          warehouse: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ products });
});

router.post("/", requirePermission("catalog.manage"), async (req, res, next) => {
  try {
    const payload = createProductSchema.parse(req.body);

    const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.product.create({
        data: {
          organizationId: req.auth!.organizationId,
          companyId: payload.companyId,
          categoryId: payload.categoryId,
          unitId: payload.unitId,
          name: payload.name,
          article: payload.article.toUpperCase(),
          barcode: payload.barcode,
          description: payload.description,
          baseCost: payload.baseCost,
          basePrice: payload.basePrice,
          reorderPoint: payload.reorderPoint,
          safetyStock: payload.safetyStock,
          leadTimeDays: payload.leadTimeDays,
          trackExpiry: payload.trackExpiry,
          trackBatch: payload.trackBatch
        }
      });

      await tx.productPriceHistory.create({
        data: {
          organizationId: req.auth!.organizationId,
          productId: created.id,
          currencyCode: payload.currencyCode,
          purchasePrice: payload.baseCost,
          salePrice: payload.basePrice
        }
      });

      return created;
    });

    await writeAuditLog({
      prisma,
      organizationId: req.auth!.organizationId,
      userId: req.auth!.userId,
      action: "create",
      entity: "product",
      entityId: product.id,
      payload: { article: product.article }
    });

    res.status(201).json({ product });
  } catch (error) {
    next(error);
  }
});

router.post("/categories", requirePermission("catalog.manage"), async (req, res, next) => {
  try {
    const payload = createCategorySchema.parse(req.body);
    const category = await prisma.productCategory.create({
      data: {
        organizationId: req.auth!.organizationId,
        ...payload
      }
    });

    res.status(201).json({ category });
  } catch (error) {
    next(error);
  }
});

router.post("/units", requirePermission("catalog.manage"), async (req, res, next) => {
  try {
    const payload = createUnitSchema.parse(req.body);
    const unit = await prisma.unitOfMeasure.create({
      data: {
        organizationId: req.auth!.organizationId,
        code: payload.code.toUpperCase(),
        name: payload.name,
        precision: payload.precision
      }
    });

    res.status(201).json({ unit });
  } catch (error) {
    next(error);
  }
});

export { router as productsRouter };
