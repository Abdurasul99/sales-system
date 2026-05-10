import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "sales-system-backend",
    timestamp: new Date().toISOString()
  });
});

export { router as healthRouter };
