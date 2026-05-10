import { PrismaClient } from "@prisma/client";

export async function writeAuditLog(input: {
  prisma: PrismaClient;
  organizationId: string;
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await input.prisma.auditLog.create({
    data: {
      organizationId: input.organizationId,
      userId: input.userId ?? undefined,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? undefined,
      payload: input.payload as object | undefined
    }
  });
}
