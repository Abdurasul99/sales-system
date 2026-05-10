import { z } from "zod";

export const bootstrapSchema = z.object({
  organizationName: z.string().min(3),
  organizationSlug: z.string().min(3).optional(),
  companyName: z.string().min(3),
  companyCode: z.string().min(2),
  branchName: z.string().min(2),
  branchCode: z.string().min(2),
  warehouseName: z.string().min(2),
  warehouseCode: z.string().min(2),
  adminFullName: z.string().min(2),
  adminLogin: z.string().min(3),
  adminPassword: z.string().min(8),
  adminEmail: z.string().email().optional(),
  adminPhone: z.string().min(5).optional(),
  baseCurrency: z.string().default("UZS")
});

export const loginSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(8)
});
