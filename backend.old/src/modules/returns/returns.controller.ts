import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { createReturnOrderSchema } from "./returns.schemas";
import { ReturnsService } from "./returns.service";

export class ReturnsController {
  private readonly service: ReturnsService;

  constructor(prisma: PrismaClient) {
    this.service = new ReturnsService(prisma);
  }

  list = async (req: Request, res: Response) => {
    const orders = await this.service.listReturnOrders(req.auth!.organizationId);
    res.json({ orders });
  };

  create = async (req: Request, res: Response) => {
    const payload = createReturnOrderSchema.parse(req.body);
    const order = await this.service.createReturnOrder({
      organizationId: req.auth!.organizationId,
      companyId: payload.companyId,
      branchId: payload.branchId,
      warehouseId: payload.warehouseId,
      salesOrderId: payload.salesOrderId,
      createdById: req.auth!.userId,
      currencyCode: payload.currencyCode,
      type: payload.type,
      reason: payload.reason,
      lines: payload.lines
    });

    res.status(201).json({ order });
  };
}
