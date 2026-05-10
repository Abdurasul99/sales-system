import { Prisma, PrismaClient } from "@prisma/client";

type LedgerReferenceIds = {
  salesOrderId?: string;
  purchaseOrderId?: string;
  returnOrderId?: string;
};

type PostLedgerEntryInput = LedgerReferenceIds & {
  tx: Prisma.TransactionClient;
  organizationId: string;
  companyId: string;
  branchId?: string;
  createdById?: string;
  direction: "INCOME" | "EXPENSE";
  category: string;
  currencyCode: string;
  amount: number;
  note?: string;
};

export async function resolveRateToBase(
  tx: Prisma.TransactionClient | PrismaClient,
  organizationId: string,
  currencyCode: string
): Promise<number> {
  const organization = await tx.organization.findUniqueOrThrow({
    where: { id: organizationId }
  });

  if (currencyCode === organization.baseCurrency) {
    return 1;
  }

  const exchangeRate = await tx.exchangeRate.findFirst({
    where: {
      organizationId,
      currency: {
        code: currencyCode
      }
    },
    orderBy: {
      date: "desc"
    }
  });

  return Number(exchangeRate?.rateToBase ?? 1);
}

export async function postLedgerEntry(input: PostLedgerEntryInput) {
  const rateToBase = await resolveRateToBase(
    input.tx,
    input.organizationId,
    input.currencyCode
  );

  return input.tx.ledgerEntry.create({
    data: {
      organizationId: input.organizationId,
      companyId: input.companyId,
      branchId: input.branchId,
      salesOrderId: input.salesOrderId,
      purchaseOrderId: input.purchaseOrderId,
      returnOrderId: input.returnOrderId,
      createdById: input.createdById,
      direction: input.direction,
      category: input.category,
      currencyCode: input.currencyCode,
      amount: input.amount,
      baseAmount: Number((input.amount * rateToBase).toFixed(2)),
      note: input.note
    }
  });
}
