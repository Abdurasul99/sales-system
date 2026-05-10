"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const password_1 = require("../../lib/password");
const prisma_1 = require("../../lib/prisma");
const auth_1 = require("../../middlewares/auth");
const audit_service_1 = require("../audit/audit.service");
const createUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    login: zod_1.z.string().min(3),
    email: zod_1.z.string().email().optional(),
    phone: zod_1.z.string().min(5).optional(),
    password: zod_1.z.string().min(8),
    roleId: zod_1.z.string().min(1),
    companyId: zod_1.z.string().optional(),
    branchId: zod_1.z.string().optional()
});
const router = (0, express_1.Router)();
exports.usersRouter = router;
router.use(auth_1.requireAuth);
router.get("/roles", (0, auth_1.requirePermission)("user.manage"), async (req, res) => {
    const roles = await prisma_1.prisma.role.findMany({
        where: { organizationId: req.auth.organizationId },
        orderBy: { name: "asc" }
    });
    res.json({ roles });
});
router.get("/", (0, auth_1.requirePermission)("user.manage"), async (req, res) => {
    const users = await prisma_1.prisma.user.findMany({
        where: { organizationId: req.auth.organizationId },
        include: {
            role: true
        },
        orderBy: { createdAt: "desc" }
    });
    res.json({ users });
});
router.post("/", (0, auth_1.requirePermission)("user.manage"), async (req, res, next) => {
    try {
        const payload = createUserSchema.parse(req.body);
        const passwordHash = await (0, password_1.hashPassword)(payload.password);
        const user = await prisma_1.prisma.user.create({
            data: {
                organizationId: req.auth.organizationId,
                companyId: payload.companyId ?? req.auth.companyId ?? undefined,
                branchId: payload.branchId ?? req.auth.branchId ?? undefined,
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
        await (0, audit_service_1.writeAuditLog)({
            prisma: prisma_1.prisma,
            organizationId: req.auth.organizationId,
            userId: req.auth.userId,
            action: "create",
            entity: "user",
            entityId: user.id,
            payload: { login: user.login, roleId: user.roleId }
        });
        res.status(201).json({ user });
    }
    catch (error) {
        next(error);
    }
});
