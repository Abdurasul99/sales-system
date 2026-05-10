"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttributeDefinitionSchema = exports.createStorageLocationSchema = exports.createExchangeRateSchema = exports.createCurrencySchema = exports.createCustomerSegmentSchema = exports.createUnitSchema = exports.createCategorySchema = void 0;
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    slug: zod_1.z.string().min(2),
    description: zod_1.z.string().optional()
});
exports.createUnitSchema = zod_1.z.object({
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    precision: zod_1.z.coerce.number().min(0).max(4).default(0)
});
exports.createCustomerSegmentSchema = zod_1.z.object({
    code: zod_1.z.string().min(2),
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional()
});
exports.createCurrencySchema = zod_1.z.object({
    code: zod_1.z.string().min(3).max(3),
    name: zod_1.z.string().min(2),
    symbol: zod_1.z.string().min(1),
    isBase: zod_1.z.boolean().default(false)
});
exports.createExchangeRateSchema = zod_1.z.object({
    currencyCode: zod_1.z.string().min(3).max(3),
    date: zod_1.z.string().datetime(),
    rateToBase: zod_1.z.coerce.number().positive(),
    source: zod_1.z.string().default("MANUAL")
});
exports.createStorageLocationSchema = zod_1.z.object({
    warehouseId: zod_1.z.string().min(1),
    code: zod_1.z.string().min(1),
    name: zod_1.z.string().min(2),
    zone: zod_1.z.string().optional()
});
exports.createAttributeDefinitionSchema = zod_1.z.object({
    code: zod_1.z.string().min(2),
    name: zod_1.z.string().min(2),
    dataType: zod_1.z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN"]),
    isRequired: zod_1.z.boolean().default(false)
});
