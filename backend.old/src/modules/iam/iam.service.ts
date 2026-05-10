import { PrismaClient } from "@prisma/client";

import { PERMISSIONS } from "../auth/rbac";
import { IamRepository } from "./iam.repository";

export class IamService {
  private readonly repository: IamRepository;

  constructor(prisma: PrismaClient) {
    this.repository = new IamRepository(prisma);
  }

  listRoles(organizationId: string) {
    return this.repository.listRoles(organizationId);
  }

  createRole(input: {
    organizationId: string;
    name: string;
    code: string;
    permissions: string[];
  }) {
    const unknownPermissions = input.permissions.filter(
      (permission) => !PERMISSIONS.includes(permission as (typeof PERMISSIONS)[number])
    );

    if (unknownPermissions.length) {
      throw new Error(`Unknown permissions: ${unknownPermissions.join(", ")}`);
    }

    return this.repository.createRole(input);
  }
}
