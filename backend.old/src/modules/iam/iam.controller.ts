import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

import { PERMISSIONS } from "../auth/rbac";
import { createRoleSchema } from "./iam.schemas";
import { IamService } from "./iam.service";

export class IamController {
  private readonly service: IamService;

  constructor(prisma: PrismaClient) {
    this.service = new IamService(prisma);
  }

  getPermissions = async (_req: Request, res: Response) => {
    res.json({ permissions: PERMISSIONS });
  };

  listRoles = async (req: Request, res: Response) => {
    const roles = await this.service.listRoles(req.auth!.organizationId);
    res.json({ roles });
  };

  createRole = async (req: Request, res: Response) => {
    const payload = createRoleSchema.parse(req.body);
    const role = await this.service.createRole({
      organizationId: req.auth!.organizationId,
      name: payload.name,
      code: payload.code,
      permissions: payload.permissions
    });

    res.status(201).json({ role });
  };
}
