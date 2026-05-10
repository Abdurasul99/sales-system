"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
async function writeAuditLog(input) {
    await input.prisma.auditLog.create({
        data: {
            organizationId: input.organizationId,
            userId: input.userId ?? undefined,
            action: input.action,
            entity: input.entity,
            entityId: input.entityId ?? undefined,
            payload: input.payload
        }
    });
}
