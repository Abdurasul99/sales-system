"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.bootstrapSchema = void 0;
const zod_1 = require("zod");
exports.bootstrapSchema = zod_1.z.object({
    organizationName: zod_1.z.string().min(3),
    organizationSlug: zod_1.z.string().min(3).optional(),
    companyName: zod_1.z.string().min(3),
    companyCode: zod_1.z.string().min(2),
    branchName: zod_1.z.string().min(2),
    branchCode: zod_1.z.string().min(2),
    warehouseName: zod_1.z.string().min(2),
    warehouseCode: zod_1.z.string().min(2),
    adminFullName: zod_1.z.string().min(2),
    adminLogin: zod_1.z.string().min(3),
    adminPassword: zod_1.z.string().min(8),
    adminEmail: zod_1.z.string().email().optional(),
    adminPhone: zod_1.z.string().min(5).optional(),
    baseCurrency: zod_1.z.string().default("UZS")
});
exports.loginSchema = zod_1.z.object({
    login: zod_1.z.string().min(3),
    password: zod_1.z.string().min(8)
});
