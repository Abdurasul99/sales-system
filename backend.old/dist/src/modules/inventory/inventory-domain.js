"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryError = void 0;
exports.calculateAvailability = calculateAvailability;
exports.reserveInventory = reserveInventory;
exports.receiveInventory = receiveInventory;
exports.issueInventory = issueInventory;
class InventoryError extends Error {
}
exports.InventoryError = InventoryError;
function calculateAvailability(snapshot) {
    return Number((snapshot.onHand - snapshot.reserved).toFixed(3));
}
function reserveInventory(snapshot, quantity) {
    if (quantity <= 0) {
        throw new InventoryError("Reservation quantity must be positive");
    }
    const available = calculateAvailability(snapshot);
    if (available < quantity) {
        throw new InventoryError("Insufficient available stock");
    }
    return {
        onHand: snapshot.onHand,
        reserved: Number((snapshot.reserved + quantity).toFixed(3))
    };
}
function receiveInventory(snapshot, quantity) {
    if (quantity <= 0) {
        throw new InventoryError("Receipt quantity must be positive");
    }
    return {
        onHand: Number((snapshot.onHand + quantity).toFixed(3)),
        reserved: snapshot.reserved
    };
}
function issueInventory(snapshot, quantity) {
    if (quantity <= 0) {
        throw new InventoryError("Issue quantity must be positive");
    }
    if (snapshot.onHand < quantity) {
        throw new InventoryError("Insufficient stock on hand");
    }
    const releasedReservation = Math.min(snapshot.reserved, quantity);
    return {
        onHand: Number((snapshot.onHand - quantity).toFixed(3)),
        reserved: Number((snapshot.reserved - releasedReservation).toFixed(3))
    };
}
