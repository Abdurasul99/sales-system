"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postInventoryMovement = postInventoryMovement;
const inventory_domain_1 = require("../../modules/inventory/inventory-domain");
function resolveNextSnapshot(input) {
    if (input.eventType === "PURCHASE_RECEIPT" ||
        input.eventType === "RETURN_IN" ||
        input.eventType === "TRANSFER_IN") {
        return (0, inventory_domain_1.receiveInventory)(input.current, input.quantity);
    }
    if (input.eventType === "RESERVATION") {
        return (0, inventory_domain_1.reserveInventory)(input.current, input.quantity);
    }
    return (0, inventory_domain_1.issueInventory)(input.current, input.quantity);
}
async function postInventoryMovement(input) {
    const balance = await input.tx.inventoryBalance.upsert({
        where: {
            warehouseId_productId: {
                warehouseId: input.warehouseId,
                productId: input.productId
            }
        },
        update: {},
        create: {
            organizationId: input.organizationId,
            warehouseId: input.warehouseId,
            productId: input.productId,
            onHand: 0,
            reserved: 0,
            available: 0
        }
    });
    const current = {
        onHand: Number(balance.onHand),
        reserved: Number(balance.reserved)
    };
    const nextSnapshot = resolveNextSnapshot({
        current,
        quantity: input.quantity,
        eventType: input.eventType
    });
    let lotId = input.lotId;
    if (input.lotId && !input.lotCode) {
        await input.tx.inventoryLot.update({
            where: { id: input.lotId },
            data: {
                quantity: input.eventType === "PURCHASE_RECEIPT" ||
                    input.eventType === "RETURN_IN" ||
                    input.eventType === "TRANSFER_IN"
                    ? { increment: input.quantity }
                    : { decrement: input.quantity }
            }
        });
    }
    else if (input.lotCode) {
        const lot = await input.tx.inventoryLot.upsert({
            where: {
                warehouseId_productId_code: {
                    warehouseId: input.warehouseId,
                    productId: input.productId,
                    code: input.lotCode
                }
            },
            update: {
                serialNumber: input.serialNumber,
                expiryDate: input.expiryDate,
                quantity: input.eventType === "PURCHASE_RECEIPT" ||
                    input.eventType === "RETURN_IN" ||
                    input.eventType === "TRANSFER_IN"
                    ? { increment: input.quantity }
                    : { decrement: input.quantity }
            },
            create: {
                organizationId: input.organizationId,
                warehouseId: input.warehouseId,
                productId: input.productId,
                code: input.lotCode,
                serialNumber: input.serialNumber,
                expiryDate: input.expiryDate,
                quantity: input.eventType === "PURCHASE_RECEIPT" ||
                    input.eventType === "RETURN_IN" ||
                    input.eventType === "TRANSFER_IN"
                    ? input.quantity
                    : 0
            }
        });
        lotId = lot.id;
    }
    const updatedBalance = await input.tx.inventoryBalance.update({
        where: { id: balance.id },
        data: {
            onHand: nextSnapshot.onHand,
            reserved: nextSnapshot.reserved,
            available: (0, inventory_domain_1.calculateAvailability)(nextSnapshot)
        }
    });
    const movement = await input.tx.inventoryMovement.create({
        data: {
            organizationId: input.organizationId,
            inventoryBalanceId: balance.id,
            lotId,
            createdById: input.createdById,
            eventType: input.eventType,
            quantity: input.quantity,
            beforeOnHand: current.onHand,
            afterOnHand: nextSnapshot.onHand,
            referenceType: input.referenceType,
            referenceId: input.referenceId,
            note: input.note
        }
    });
    return {
        balance: updatedBalance,
        movement,
        lotId
    };
}
