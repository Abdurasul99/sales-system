import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { IamController } from "./iam.controller";

const router = Router();
const controller = new IamController(prisma);

router.use(requireAuth);

router.get("/permissions", requirePermission("role.manage"), controller.getPermissions);
router.get("/roles", requirePermission("user.manage"), controller.listRoles);
router.post("/roles", requirePermission("role.manage"), controller.createRole);

export { router as iamRouter };
