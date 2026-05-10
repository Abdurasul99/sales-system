import { z } from "zod";

export const createReturnOrderSchema = z.object({
  companyId: z.string().min(1),
  branchId: z.string().min(1),
  warehouseId: z.string().min(1),
  salesOrderId: z.string().optional(),
  currencyCode: z.string().default("UZS"),
  type: z.string().default("CUSTOMER_RETURN"),
  reason: z.string().optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().positive(),
        unitAmount: z.coerce.number().min(0),
        lotCode: z.string().optional(),
        expiryDate: z.string().datetime().optional()
      })
    )
    .min(1)
});
