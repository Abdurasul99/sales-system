import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().optional()
});

export const createUnitSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(2),
  precision: z.coerce.number().min(0).max(4).default(0)
});

export const createCustomerSegmentSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  description: z.string().optional()
});

export const createCurrencySchema = z.object({
  code: z.string().min(3).max(3),
  name: z.string().min(2),
  symbol: z.string().min(1),
  isBase: z.boolean().default(false)
});

export const createExchangeRateSchema = z.object({
  currencyCode: z.string().min(3).max(3),
  date: z.string().datetime(),
  rateToBase: z.coerce.number().positive(),
  source: z.string().default("MANUAL")
});

export const createStorageLocationSchema = z.object({
  warehouseId: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(2),
  zone: z.string().optional()
});

export const createAttributeDefinitionSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  dataType: z.enum(["TEXT", "NUMBER", "DATE", "BOOLEAN"]),
  isRequired: z.boolean().default(false)
});
