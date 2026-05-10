"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationQuery = parsePaginationQuery;
exports.buildPageMeta = buildPageMeta;
function parsePaginationQuery(input) {
    const page = Math.max(1, Number(input.page ?? 1) || 1);
    const limit = Math.min(100, Math.max(1, Number(input.limit ?? 20) || 20));
    const rawSearch = Array.isArray(input.q) ? input.q[0] : input.q;
    return {
        page,
        limit,
        skip: (page - 1) * limit,
        search: rawSearch?.trim() || undefined
    };
}
function buildPageMeta(input) {
    return {
        page: input.page,
        limit: input.limit,
        total: input.total,
        totalPages: Math.max(1, Math.ceil(input.total / input.limit))
    };
}
