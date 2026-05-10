"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSalesTotals = calculateSalesTotals;
function calculateSalesTotals(lines, discountAmount = 0, taxAmount = 0) {
    const normalizedLines = lines.map((line) => {
        const lineSubtotal = Number((line.quantity * line.unitPrice).toFixed(2));
        const discount = Number((line.discount ?? 0).toFixed(2));
        const total = Number((lineSubtotal - discount).toFixed(2));
        const margin = Number((total - line.quantity * line.costPrice).toFixed(2));
        return {
            ...line,
            discount,
            total,
            margin
        };
    });
    const subtotal = Number(normalizedLines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0).toFixed(2));
    const total = Number((subtotal - discountAmount + taxAmount).toFixed(2));
    const marginAmount = Number(normalizedLines.reduce((sum, line) => sum + line.margin, 0).toFixed(2));
    return {
        lines: normalizedLines,
        subtotal,
        total,
        marginAmount
    };
}
