import { Router } from "express";
import { z } from "zod";

import { hashPassword } from "../../lib/password";
import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { writeAuditLog } from "../audit/audit.service";

const createUserSchema = z.object({
  fullName: z.string().min(2),
  login: z.string().min(3),
  email: z.string().email().optional(),
  phone: z.string().min(5).optional(),
  password: z.string().min(8),
  roleId: z.string().min(1),
  companyId: z.string().optional(),
  branchId: z.string().optional()
});

const router = Router();

router.use(requireAuth);

router.get("/roles", requirePermission("user.manage"), async (req, res) => {
  const roles = await prisma.role.findMany({
    where: { organizationId: req.auth!.organizationId },
    orderBy: { name: "asc" }
  });

  res.json({ roles });
});

router.get("/", requirePermission("user.manage"), async (req, res) => {
  const users = await prisma.user.findMany({
    where: { organizationId: req.auth!.organizationId },
    include: {
      role: true
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ users });
});

router.post("/", requirePermission("user.manage"), async (req, res, next) => {
  try {
    const payload = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        organizationId: req.auth!.organizationId,
        companyId: payload.companyId ?? req.auth!.companyId ?? undefined,
        branchId: payload.branchId ?? req.auth!.branchId ?? undefined,
        roleId: payload.roleId,
        fullName: payload.fullName,
        login: payload.login,
        email: payload.email,
        phone: payload.phone,
        passwordHash
      },
      include: {
        role: true
      }
    });

    await writeAuditLog({
      prisma,
      organizationId: req.auth!.organizationId,
      userId: req.auth!.userId,
      action: "create",
      entity: "user",
      entityId: user.id,
      payload: { login: user.login, roleId: user.roleId }
    });

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

export { router as usersRouter };
