"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const inventory_posting_service_1 = require("../../common/services/inventory-posting.service");
const ledger_posting_service_1 = require("../../common/services/ledger-posting.service");
const number_series_1 = require("../../common/utils/number-series");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const audit_service_1 = require("../audit/audit.service");
const sales_domain_1 = require("./sales-domain");
const leadSchema = zod_1.z.object({
    customerId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(3),
    source: zod_1.z.string().optional(),
    expectedValue: zod_1.z.coerce.number().min(0).optional(),
    currencyCode: zod_1.z.string().default("UZS")
});
const dealSchema = zod_1.z.object({
    customerId: zod_1.z.string().optional(),
    leadId: zod_1.z.string().optional(),
    title: zod_1.z.string().min(3),
    expectedValue: zod_1.z.coerce.number().min(0).optional(),
    probability: zod_1.z.coerce.number().min(0).max(100).default(0),
    currencyCode: zod_1.z.string().default("UZS")
});
const createSalesOrderSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1),
    warehouseId: zod_1.z.string().min(1),
    customerId: zod_1.z.string().optional(),
    dealId: zod_1.z.string().optional(),
    currencyCode: zod_1.z.string().default("UZS"),
    discountAmount: zod_1.z.coerce.number().min(0).default(0),
    taxAmount: zod_1.z.coerce.number().min(0).default(0),
    note: zod_1.z.string().optional(),
    lines: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        lotId: zod_1.z.string().optional(),
        quantity: zod_1.z.coerce.number().positive(),
        unitPrice: zod_1.z.coerce.number().min(0),
        costPrice: zod_1.z.coerce.number().min(0),
        discount: zod_1.z.coerce.number().min(0).default(0)
    }))
        .min(1)
});
const router = (0, express_1.Router)();
exports.salesRouter = router;
router.use(auth_1.requireAuth);
router.get("/pipeline", (0, auth_1.requirePermission)("sales.read"), async (req, res) => {
    const [leads, deals] = await Promise.all([
        prisma_1.prisma.lead.findMany({
            where: { organizationId: req.auth.organizationId },
            include: { customer: true },
            orderBy: { createdAt: "desc" }
        }),
        prisma_1.prisma.deal.findMany({
            where: { organizationId: req.auth.organizationId },
            include: { customer: true, lead: true },
            orderBy: { createdAt: "desc" }
        })
    ]);
    res.json({ leads, deals });
});
router.post("/leads", (0, auth_1.requirePermission)("sales.write"), async (req, res, next) => {
    try {
        const payload = leadSchema.parse(req.body);
        const lead = await prisma_1.prisma.lead.create({
            data: {
                organizationId: req.auth.organizationId,
                customerId: payload.customerId,
                ownerId: req.auth.userId,
                title: payload.title,
                source: payload.source,
                expectedValue: payload.expectedValue,
                currencyCode: payload.currencyCode
            }
        });
        res.status(201).json({ lead });
    }
    catch (error) {
        next(error);
    }
});
router.post("/deals", (0, auth_1.requirePermission)("sales.write"), async (req, res, next) => {
    try {
        const payload = dealSchema.parse(req.body);
        const deal = await prisma_1.prisma.deal.create({
            data: {
                organizationId: req.auth.organizationId,
                customerId: payload.customerId,
                leadId: payload.leadId,
                ownerId: req.auth.userId,
                title: payload.title,
                expectedValue: payload.expectedValue,
                probability: payload.probability,
                currencyCode: payload.currencyCode
            }
        });
        res.status(201).json({ deal });
    }
    catch (error) {
        next(error);
    }
});
router.get("/orders", (0, auth_1.requirePermission)("sales.read"), async (req, res) => {
    const orders = await prisma_1.prisma.salesOrder.findMany({
        where: { organizationId: req.auth.organizationId },
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
router.post("/orders", (0, auth_1.requirePermission)("sales.write"), async (req, res, next) => {
    try {
        const payload = createSalesOrderSchema.parse(req.body);
        const totals = (0, sales_domain_1.calculateSalesTotals)(payload.lines, payload.discountAmount, payload.taxAmount);
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const number = (0, number_series_1.buildDocumentNumber)("SO");
            for (const line of payload.lines) {
                await (0, inventory_posting_service_1.postInventoryMovement)({
                    tx,
                    organizationId: req.auth.organizationId,
                    warehouseId: payload.warehouseId,
                    productId: line.productId,
                    quantity: line.quantity,
                    eventType: "SALE_ISSUE",
                    createdById: req.auth.userId,
                    referenceType: "sales_order",
                    note: number,
                    lotId: line.lotId
                });
            }
            const createdOrder = await tx.salesOrder.create({
                data: {
                    organizationId: req.auth.organizationId,
                    companyId: payload.companyId,
                    branchId: payload.branchId,
                    warehouseId: payload.warehouseId,
                    customerId: payload.customerId,
                    dealId: payload.dealId,
                    createdById: req.auth.userId,
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
                            productId: payload.lines[index].productId,
                            lotId: payload.lines[index].lotId,
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
            await (0, ledger_posting_service_1.postLedgerEntry)({
                tx,
                organizationId: req.auth.organizationId,
                companyId: payload.companyId,
                branchId: payload.branchId,
                salesOrderId: createdOrder.id,
                createdById: req.auth.userId,
                direction: "INCOME",
                category: "SALE",
                currencyCode: payload.currencyCode,
                amount: totals.total,
                note: createdOrder.number
            });
            return createdOrder;
        });
        await (0, audit_service_1.writeAuditLog)({
            prisma: prisma_1.prisma,
            organizationId: req.auth.organizationId,
            userId: req.auth.userId,
            action: "create",
            entity: "sales_order",
            entityId: order.id,
            payload: { number: order.number, total: order.total.toString() }
        });
        res.status(201).json({ order });
    }
    catch (error) {
        next(error);
    }
});
