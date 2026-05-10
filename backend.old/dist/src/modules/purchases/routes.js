"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchasesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const inventory_posting_service_1 = require("../../common/services/inventory-posting.service");
const ledger_posting_service_1 = require("../../common/services/ledger-posting.service");
const number_series_1 = require("../../common/utils/number-series");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const createPurchaseOrderSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1),
    warehouseId: zod_1.z.string().min(1),
    supplierId: zod_1.z.string().min(1),
    currencyCode: zod_1.z.string().default("UZS"),
    additionalCost: zod_1.z.coerce.number().min(0).default(0),
    expectedAt: zod_1.z.string().datetime().optional(),
    note: zod_1.z.string().optional(),
    receiveNow: zod_1.z.boolean().default(true),
    lines: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        quantity: zod_1.z.coerce.number().positive(),
        unitCost: zod_1.z.coerce.number().min(0),
        lotCode: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().datetime().optional()
    }))
        .min(1)
});
const router = (0, express_1.Router)();
exports.purchasesRouter = router;
router.use(auth_1.requireAuth);
router.get("/orders", (0, auth_1.requirePermission)("purchase.read"), async (req, res) => {
    const orders = await prisma_1.prisma.purchaseOrder.findMany({
        where: { organizationId: req.auth.organizationId },
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
router.post("/orders", (0, auth_1.requirePermission)("purchase.write"), async (req, res, next) => {
    try {
        const payload = createPurchaseOrderSchema.parse(req.body);
        const subtotal = payload.lines.reduce((sum, line) => sum + line.quantity * line.unitCost, 0);
        const total = Number((subtotal + payload.additionalCost).toFixed(2));
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            const number = (0, number_series_1.buildDocumentNumber)("PO");
            const createdOrder = await tx.purchaseOrder.create({
                data: {
                    organizationId: req.auth.organizationId,
                    companyId: payload.companyId,
                    branchId: payload.branchId,
                    warehouseId: payload.warehouseId,
                    supplierId: payload.supplierId,
                    createdById: req.auth.userId,
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
                    await (0, inventory_posting_service_1.postInventoryMovement)({
                        tx,
                        organizationId: req.auth.organizationId,
                        warehouseId: payload.warehouseId,
                        productId: line.productId,
                        quantity: line.quantity,
                        eventType: "PURCHASE_RECEIPT",
                        createdById: req.auth.userId,
                        referenceType: "purchase_order",
                        referenceId: createdOrder.id,
                        note: createdOrder.number,
                        lotCode: line.lotCode,
                        expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined
                    });
                }
            }
            await (0, ledger_posting_service_1.postLedgerEntry)({
                tx,
                organizationId: req.auth.organizationId,
                companyId: payload.companyId,
                branchId: payload.branchId,
                purchaseOrderId: createdOrder.id,
                createdById: req.auth.userId,
                direction: "EXPENSE",
                category: "PURCHASE",
                currencyCode: payload.currencyCode,
                amount: total,
                note: createdOrder.number
            });
            return createdOrder;
        });
        res.status(201).json({ order });
    }
    catch (error) {
        next(error);
    }
});
