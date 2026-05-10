"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReturnOrderSchema = void 0;
const zod_1 = require("zod");
exports.createReturnOrderSchema = zod_1.z.object({
    companyId: zod_1.z.string().min(1),
    branchId: zod_1.z.string().min(1),
    warehouseId: zod_1.z.string().min(1),
    salesOrderId: zod_1.z.string().optional(),
    currencyCode: zod_1.z.string().default("UZS"),
    type: zod_1.z.string().default("CUSTOMER_RETURN"),
    reason: zod_1.z.string().optional(),
    lines: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().min(1),
        quantity: zod_1.z.coerce.number().positive(),
        unitAmount: zod_1.z.coerce.number().min(0),
        lotCode: zod_1.z.string().optional(),
        expiryDate: zod_1.z.string().datetime().optional()
    }))
        .min(1)
});
