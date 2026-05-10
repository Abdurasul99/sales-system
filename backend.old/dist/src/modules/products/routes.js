"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const audit_service_1 = require("../audit/audit.service");
const createProductSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    categoryId: zod_1.z.string().optional(),
    unitId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    article: zod_1.z.string().min(2),
    barcode: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    baseCost: zod_1.z.coerce.number().min(0).default(0),
    basePrice: zod_1.z.coerce.number().min(0).default(0),
    reorderPoint: zod_1.z.coerce.number().min(0).default(0),
    safetyStock: zod_1.z.coerce.number().min(0).default(0),
    leadTimeDays: zod_1.z.coerce.number().min(0).default(0),
    trackExpiry: zod_1.z.boolean().default(false),
    trackBatch: zod_1.z.boolean().default(false),
    currencyCode: zod_1.z.string().default("UZS")
});
const createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    description: zod_1.z.string().optional()
});
const createUnitSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    precision: zod_1.z.coerce.number().min(0).max(4).default(0)
});
const router = (0, express_1.Router)();
exports.productsRouter = router;
router.use(auth_1.requireAuth);
router.get("/meta", async (req, res) => {
    const organizationId = req.auth.organizationId;
    const [companies, categories, units, currencies] = await Promise.all([
        prisma_1.prisma.company.findMany({
            where: { organization: { id: organizationId } },
            orderBy: { name: "asc" }
        }),
        prisma_1.prisma.productCategory.findMany({
            where: { organizationId },
            orderBy: { name: "asc" }
        }),
        prisma_1.prisma.unitOfMeasure.findMany({
            where: { organizationId },
            orderBy: { name: "asc" }
        }),
        prisma_1.prisma.currency.findMany({
            where: { organizationId },
            orderBy: { code: "asc" }
        })
    ]);
    res.json({ companies, categories, units, currencies });
});
router.get("/", async (req, res) => {
    const products = await prisma_1.prisma.product.findMany({
        where: { organizationId: req.auth.organizationId },
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
router.post("/", (0, auth_1.requirePermission)("catalog.manage"), async (req, res, next) => {
    try {
        const payload = createProductSchema.parse(req.body);
        const product = await prisma_1.prisma.$transaction(async (tx) => {
            const created = await tx.product.create({
                data: {
                    organizationId: req.auth.organizationId,
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
                    organizationId: req.auth.organizationId,
                    productId: created.id,
                    currencyCode: payload.currencyCode,
                    purchasePrice: payload.baseCost,
                    salePrice: payload.basePrice
                }
            });
            return created;
        });
        await (0, audit_service_1.writeAuditLog)({
            prisma: prisma_1.prisma,
            organizationId: req.auth.organizationId,
            userId: req.auth.userId,
            action: "create",
            entity: "product",
            entityId: product.id,
            payload: { article: product.article }
        });
        res.status(201).json({ product });
    }
    catch (error) {
        next(error);
    }
});
router.post("/categories", (0, auth_1.requirePermission)("catalog.manage"), async (req, res, next) => {
    try {
        const payload = createCategorySchema.parse(req.body);
        const category = await prisma_1.prisma.productCategory.create({
            data: {
                organizationId: req.auth.organizationId,
                ...payload
            }
        });
        res.status(201).json({ category });
    }
    catch (error) {
        next(error);
    }
});
router.post("/units", (0, auth_1.requirePermission)("catalog.manage"), async (req, res, next) => {
    try {
        const payload = createUnitSchema.parse(req.body);
        const unit = await prisma_1.prisma.unitOfMeasure.create({
            data: {
                organizationId: req.auth.organizationId,
                code: payload.code.toUpperCase(),
                name: payload.name,
                precision: payload.precision
            }
        });
        res.status(201).json({ unit });
    }
    catch (error) {
        next(error);
    }
});
