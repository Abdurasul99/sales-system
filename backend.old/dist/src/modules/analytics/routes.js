"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const replenishment_domain_1 = require("./replenishment-domain");
const router = (0, express_1.Router)();
exports.analyticsRouter = router;
router.use(auth_1.requireAuth, (0, auth_1.requirePermission)("analytics.read"));
router.get("/dashboard", async (req, res) => {
    const organizationId = req.auth.organizationId;
    const [salesAgg, purchaseAgg, customersCount, openLeads, wonDeals, closedDeals, inventory] = await Promise.all([
        prisma_1.prisma.salesOrder.aggregate({
            where: { organizationId },
            _sum: { total: true }
        }),
        prisma_1.prisma.purchaseOrder.aggregate({
            where: { organizationId },
            _sum: { total: true }
        }),
        prisma_1.prisma.customer.count({
            where: { organizationId, isActive: true }
        }),
        prisma_1.prisma.lead.count({
            where: {
                organizationId,
                status: {
                    in: ["NEW", "QUALIFIED", "NEGOTIATION"]
                }
            }
        }),
        prisma_1.prisma.deal.count({
            where: { organizationId, stage: "WON" }
        }),
        prisma_1.prisma.deal.count({
            where: { organizationId, stage: { in: ["WON", "LOST"] } }
        }),
        prisma_1.prisma.inventoryBalance.findMany({
            where: { organizationId },
            include: { product: true }
        })
    ]);
    const salesTotal = Number(salesAgg._sum.total ?? 0);
    const purchaseTotal = Number(purchaseAgg._sum.total ?? 0);
    const grossSpread = Number((salesTotal - purchaseTotal).toFixed(2));
    const winRate = closedDeals ? Number(((wonDeals / closedDeals) * 100).toFixed(2)) : 0;
    const lowStockCount = inventory.filter((item) => Number(item.available) <= Number(item.product.reorderPoint)).length;
    res.json({
        kpis: {
            salesTotal,
            purchaseTotal,
            grossSpread,
            activeCustomers: customersCount,
            openLeads,
            winRate,
            lowStockCount
        }
    });
});
router.get("/abc", async (req, res) => {
    const salesByProduct = (await prisma_1.prisma.salesOrderLine.groupBy({
        by: ["productId"],
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } }
    }));
    const products = (await prisma_1.prisma.product.findMany({
        where: {
            organizationId: req.auth.organizationId,
            id: { in: salesByProduct.map((item) => item.productId) }
        }
    }));
    const result = (0, replenishment_domain_1.classifyAbc)(salesByProduct.map((item) => ({
        productCode: products.find((product) => product.id === item.productId)?.article ??
            item.productId,
        annualRevenue: Number(item._sum.total ?? 0)
    })));
    res.json({ items: result });
});
router.get("/replenishment", async (req, res) => {
    const balances = (await prisma_1.prisma.inventoryBalance.findMany({
        where: { organizationId: req.auth.organizationId },
        include: {
            product: true,
            warehouse: true
        }
    }));
    const lastThirtyDays = new Date();
    lastThirtyDays.setDate(lastThirtyDays.getDate() - 30);
    const salesByProduct = (await prisma_1.prisma.salesOrderLine.groupBy({
        by: ["productId"],
        where: {
            salesOrder: {
                organizationId: req.auth.organizationId,
                createdAt: {
                    gte: lastThirtyDays
                }
            }
        },
        _sum: {
            quantity: true
        }
    }));
    const suggestions = balances
        .map((balance) => {
        const soldQty = Number(salesByProduct.find((item) => item.productId === balance.productId)
            ?._sum.quantity ?? 0);
        const averageDailyDemand = Number((soldQty / 30).toFixed(2));
        const recommendation = (0, replenishment_domain_1.buildReplenishmentRecommendation)({
            availableStock: Number(balance.available),
            averageDailyDemand,
            leadTimeDays: balance.product.leadTimeDays,
            safetyStock: Number(balance.product.safetyStock),
            eoq: Math.max(Number(balance.product.reorderPoint), 1)
        });
        return {
            productId: balance.productId,
            article: balance.product.article,
            productName: balance.product.name,
            warehouseName: balance.warehouse.name,
            available: Number(balance.available),
            averageDailyDemand,
            ...recommendation
        };
    })
        .filter((item) => item.needsReorder)
        .sort((left, right) => right.suggestedOrderQty - left.suggestedOrderQty);
    res.json({ suggestions });
});
