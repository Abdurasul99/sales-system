"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDocumentNumber = buildDocumentNumber;
function buildDocumentNumber(prefix) {
    const now = new Date();
    const datePart = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
    const timePart = `${String(now.getUTCHours()).padStart(2, "0")}${String(now.getUTCMinutes()).padStart(2, "0")}${String(now.getUTCSeconds()).padStart(2, "0")}`;
    return `${prefix}-${datePart}-${timePart}-${Math.floor(Math.random() * 900 + 100)}`;
}
