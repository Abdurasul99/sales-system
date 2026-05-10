export type InventorySnapshot = {
  onHand: number;
  reserved: number;
};

export class InventoryError extends Error {}

export function calculateAvailability(snapshot: InventorySnapshot): number {
  return Number((snapshot.onHand - snapshot.reserved).toFixed(3));
}

export function reserveInventory(snapshot: InventorySnapshot, quantity: number): InventorySnapshot {
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

export function receiveInventory(snapshot: InventorySnapshot, quantity: number): InventorySnapshot {
  if (quantity <= 0) {
    throw new InventoryError("Receipt quantity must be positive");
  }

  return {
    onHand: Number((snapshot.onHand + quantity).toFixed(3)),
    reserved: snapshot.reserved
  };
}

export function issueInventory(snapshot: InventorySnapshot, quantity: number): InventorySnapshot {
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
