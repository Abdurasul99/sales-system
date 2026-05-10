"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRateToBase = resolveRateToBase;
exports.postLedgerEntry = postLedgerEntry;
async function resolveRateToBase(tx, organizationId, currencyCode) {
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
async function postLedgerEntry(input) {
    const rateToBase = await resolveRateToBase(input.tx, input.organizationId, input.currencyCode);
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
