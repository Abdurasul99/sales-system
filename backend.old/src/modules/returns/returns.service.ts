import { Prisma, PrismaClient } from "@prisma/client";

import { postInventoryMovement } from "../../common/services/inventory-posting.service";
import { postLedgerEntry } from "../../common/services/ledger-posting.service";
import { buildDocumentNumber } from "../../common/utils/number-series";

type CreateReturnOrderInput = {
  organizationId: string;
  companyId: string;
  branchId: string;
  warehouseId: string;
  salesOrderId?: string;
  createdById: string;
  currencyCode: string;
  type: string;
  reason?: string;
  lines: Array<{
    productId: string;
    quantity: number;
    unitAmount: number;
    lotCode?: string;
    expiryDate?: string;
  }>;
};

export class ReturnsService {
  constructor(private readonly prisma: PrismaClient) {}

  listReturnOrders(organizationId: string) {
    return this.prisma.returnOrder.findMany({
      where: { organizationId },
      include: {
        salesOrder: true,
        lines: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  async createReturnOrder(input: CreateReturnOrderInput) {
    const total = Number(
      input.lines
        .reduce((sum, line) => sum + line.quantity * line.unitAmount, 0)
        .toFixed(2)
    );

    return this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (input.salesOrderId) {
        const sale = await tx.salesOrder.findFirstOrThrow({
          where: {
            id: input.salesOrderId,
            organizationId: input.organizationId
          },
          include: {
            lines: true,
            returns: {
              where: {
                status: {
                  in: ["RECEIVED", "APPROVED"]
                }
              },
              include: {
                lines: true
              }
            }
          }
        });

        for (const line of input.lines) {
          const sourceLine = sale.lines.find(
            (saleLine) => saleLine.productId === line.productId
          );

          if (!sourceLine) {
            throw new Error(`Product ${line.productId} was not sold in source order`);
          }

          const alreadyReturned = sale.returns
            .flatMap((returnOrder) => returnOrder.lines)
            .filter((returnLine) => returnLine.productId === line.productId)
            .reduce((sum, returnLine) => sum + Number(returnLine.quantity), 0);

          if (alreadyReturned + line.quantity > Number(sourceLine.quantity)) {
            throw new Error(
              `Return quantity exceeds sold quantity for product ${line.productId}`
            );
          }
        }
      }

      const number = buildDocumentNumber("RTN");
      const returnOrder = await tx.returnOrder.create({
        data: {
          organizationId: input.organizationId,
          companyId: input.companyId,
          branchId: input.branchId,
          warehouseId: input.warehouseId,
          salesOrderId: input.salesOrderId,
          createdById: input.createdById,
          number,
          type: input.type,
          status: "APPROVED",
          currencyCode: input.currencyCode,
          total,
          reason: input.reason,
          lines: {
            create: input.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitAmount: line.unitAmount,
              total: Number((line.quantity * line.unitAmount).toFixed(2))
            }))
          }
        },
        include: {
          lines: true
        }
      });

      for (const line of input.lines) {
        await postInventoryMovement({
          tx,
          organizationId: input.organizationId,
          warehouseId: input.warehouseId,
          productId: line.productId,
          quantity: line.quantity,
          eventType: "RETURN_IN",
          createdById: input.createdById,
          referenceType: "return_order",
          referenceId: returnOrder.id,
          note: returnOrder.number,
          lotCode: line.lotCode,
          expiryDate: line.expiryDate ? new Date(line.expiryDate) : undefined
        });
      }

      await postLedgerEntry({
        tx,
        organizationId: input.organizationId,
        companyId: input.companyId,
        branchId: input.branchId,
        returnOrderId: returnOrder.id,
        createdById: input.createdById,
        direction: "EXPENSE",
        category: "SALES_RETURN",
        currencyCode: input.currencyCode,
        amount: total,
        note: returnOrder.number
      });

      return returnOrder;
    });
  }
}
