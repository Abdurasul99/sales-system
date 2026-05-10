import { PrismaClient } from "@prisma/client";

export class IamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  listRoles(organizationId: string) {
    return this.prisma.role.findMany({
      where: { organizationId },
      orderBy: { name: "asc" }
    });
  }

  createRole(input: {
    organizationId: string;
    name: string;
    code: string;
    permissions: string[];
  }) {
    return this.prisma.role.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        code: input.code.toUpperCase(),
        permissions: input.permissions
      }
    });
  }
}
