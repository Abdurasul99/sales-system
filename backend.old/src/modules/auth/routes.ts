import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth } from "../../middlewares/auth";
import { bootstrapSchema, loginSchema } from "./auth.schemas";
import { bootstrapOrganization, login } from "./auth.service";

const router = Router();

router.post("/bootstrap", async (req, res, next) => {
  try {
    const payload = bootstrapSchema.parse(req.body);
    const result = await bootstrapOrganization(prisma, payload);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await login(prisma, payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.auth });
});

export { router as authRouter };
