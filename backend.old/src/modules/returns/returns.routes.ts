import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { ReturnsController } from "./returns.controller";

const router = Router();
const controller = new ReturnsController(prisma);

router.use(requireAuth);

router.get("/orders", requirePermission("sales.read"), controller.list);
router.post("/orders", requirePermission("sales.write"), controller.create);

export { router as returnsRouter };
