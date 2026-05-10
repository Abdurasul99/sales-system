export type StockStatus =
  | "OUT_OF_STOCK"
  | "CRITICAL"
  | "REORDER"
  | "HEALTHY"
  | "OVERSTOCK";

export interface StockPolicyInput {
  quantity: number;
  reservedQty?: number;
  minStockLevel?: number;
  safetyStockLevel?: number;
  reorderPoint?: number;
  targetStockLevel?: number;
  leadTimeDays?: number;
  avgDailySales?: number;
}

export interface StockHealthResult {
  availableQty: number;
  thresholdQty: number;
  dynamicReorderPoint: number;
  suggestedTargetQty: number;
  suggestedReorderQty: number;
  leadTimeDemand: number;
  coverageDays: number | null;
  daysUntilStockout: number | null;
  stockStatus: StockStatus;
}

function normalizeNumber(value: number | null | undefined): number {
  const parsed = Number(value ?? 0);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function calculateAverageDailySales(quantitySold: number, days: number): number {
  const safeDays = Math.max(1, Math.floor(days));
  const safeQuantity = normalizeNumber(quantitySold);

  return roundToOneDecimal(safeQuantity / safeDays);
}

export function calculateStockHealth(input: StockPolicyInput): StockHealthResult {
  const quantity = normalizeNumber(input.quantity);
  const reservedQty = normalizeNumber(input.reservedQty);
  const minStockLevel = normalizeNumber(input.minStockLevel);
  const safetyStockLevel = normalizeNumber(input.safetyStockLevel);
  const reorderPoint = normalizeNumber(input.reorderPoint);
  const targetStockLevel = normalizeNumber(input.targetStockLevel);
  const leadTimeDays = normalizeNumber(input.leadTimeDays);
  const avgDailySales = normalizeNumber(input.avgDailySales);

  const availableQty = Math.max(0, quantity - reservedQty);
  const leadTimeDemand = roundToOneDecimal(avgDailySales * leadTimeDays);
  const dynamicReorderPoint = Math.max(
    reorderPoint,
    Math.ceil(leadTimeDemand + safetyStockLevel)
  );
  const thresholdQty = Math.max(minStockLevel, safetyStockLevel, dynamicReorderPoint);
  const suggestedTargetQty = Math.max(
    targetStockLevel,
    thresholdQty,
    Math.ceil(leadTimeDemand + safetyStockLevel + Math.max(avgDailySales * 7, minStockLevel))
  );
  const suggestedReorderQty = Math.max(0, Math.ceil(suggestedTargetQty - availableQty));
  const coverageDays = avgDailySales > 0 ? roundToOneDecimal(availableQty / avgDailySales) : null;
  const daysUntilStockout = coverageDays;

  let stockStatus: StockStatus = "HEALTHY";

  if (availableQty <= 0) {
    stockStatus = "OUT_OF_STOCK";
  } else if (availableQty <= Math.max(safetyStockLevel, minStockLevel)) {
    stockStatus = "CRITICAL";
  } else if (availableQty <= dynamicReorderPoint) {
    stockStatus = "REORDER";
  } else if (suggestedTargetQty > 0 && availableQty >= Math.ceil(suggestedTargetQty * 1.5)) {
    stockStatus = "OVERSTOCK";
  }

  return {
    availableQty,
    thresholdQty,
    dynamicReorderPoint,
    suggestedTargetQty,
    suggestedReorderQty,
    leadTimeDemand,
    coverageDays,
    daysUntilStockout,
    stockStatus,
  };
}
