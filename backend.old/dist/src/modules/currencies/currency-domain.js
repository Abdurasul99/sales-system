"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToBase = convertToBase;
exports.convertFromBase = convertFromBase;
exports.calculateExchangeDifference = calculateExchangeDifference;
function convertToBase(amount, rateToBase) {
    return Number((amount * rateToBase).toFixed(2));
}
function convertFromBase(baseAmount, rateToBase) {
    if (rateToBase <= 0) {
        throw new Error("Exchange rate must be positive");
    }
    return Number((baseAmount / rateToBase).toFixed(2));
}
function calculateExchangeDifference(expectedBaseAmount, actualBaseAmount) {
    return Number((actualBaseAmount - expectedBaseAmount).toFixed(2));
}
