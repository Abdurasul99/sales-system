"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyAbc = classifyAbc;
exports.calculateEOQ = calculateEOQ;
exports.calculateReorderPoint = calculateReorderPoint;
exports.buildReplenishmentRecommendation = buildReplenishmentRecommendation;
function classifyAbc(items) {
    const totalRevenue = items.reduce((sum, item) => sum + item.annualRevenue, 0);
    const ordered = [...items].sort((left, right) => right.annualRevenue - left.annualRevenue);
    let cumulative = 0;
    return ordered.map((item) => {
        const share = totalRevenue === 0 ? 0 : item.annualRevenue / totalRevenue;
        cumulative += share;
        const normalizedCumulative = Number(cumulative.toFixed(4));
        let bucket = "C";
        if (normalizedCumulative <= 0.8) {
            bucket = "A";
        }
        else if (normalizedCumulative <= 0.95) {
            bucket = "B";
        }
        return {
            ...item,
            share: Number(share.toFixed(4)),
            cumulativeShare: normalizedCumulative,
            bucket
        };
    });
}
function calculateEOQ(input) {
    const { annualDemand, orderingCost, annualHoldingCost } = input;
    if (annualDemand <= 0 || orderingCost <= 0 || annualHoldingCost <= 0) {
        return 0;
    }
    return Number(Math.sqrt((2 * annualDemand * orderingCost) / annualHoldingCost).toFixed(2));
}
function calculateReorderPoint(input) {
    const reorderPoint = input.averageDailyDemand * input.leadTimeDays + input.safetyStock;
    return Number(reorderPoint.toFixed(2));
}
function buildReplenishmentRecommendation(input) {
    const reorderPoint = calculateReorderPoint(input);
    const shortage = Math.max(0, reorderPoint - input.availableStock);
    const suggestedOrderQty = shortage > 0 ? Math.max(shortage, input.eoq) : 0;
    return {
        reorderPoint,
        suggestedOrderQty: Number(suggestedOrderQty.toFixed(2)),
        needsReorder: shortage > 0
    };
}
