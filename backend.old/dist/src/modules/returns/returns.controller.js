"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnsController = void 0;
const returns_schemas_1 = require("./returns.schemas");
const returns_service_1 = require("./returns.service");
class ReturnsController {
    service;
    constructor(prisma) {
        this.service = new returns_service_1.ReturnsService(prisma);
    }
    list = async (req, res) => {
        const orders = await this.service.listReturnOrders(req.auth.organizationId);
        res.json({ orders });
    };
    create = async (req, res) => {
        const payload = returns_schemas_1.createReturnOrderSchema.parse(req.body);
        const order = await this.service.createReturnOrder({
            organizationId: req.auth.organizationId,
            companyId: payload.companyId,
            branchId: payload.branchId,
            warehouseId: payload.warehouseId,
            salesOrderId: payload.salesOrderId,
            createdById: req.auth.userId,
            currencyCode: payload.currencyCode,
            type: payload.type,
            reason: payload.reason,
            lines: payload.lines
        });
        res.status(201).json({ order });
    };
}
exports.ReturnsController = ReturnsController;
