import { Router } from "express";

import { prisma } from "../../lib/prisma";
import { requireAuth, requirePermission } from "../../middlewares/auth";
import { MasterDataController } from "./master-data.controller";

const router = Router();
const controller = new MasterDataController(prisma);

router.use(requireAuth);

router.get("/bootstrap", controller.bootstrap);
router.post("/categories", requirePermission("catalog.manage"), controller.createCategory);
router.post("/units", requirePermission("catalog.manage"), controller.createUnit);
router.post(
  "/customer-segments",
  requirePermission("customer.manage"),
  controller.createCustomerSegment
);
router.post("/currencies", requirePermission("finance.write"), controller.createCurrency);
router.post(
  "/exchange-rates",
  requirePermission("finance.write"),
  controller.createExchangeRate
);
router.post(
  "/storage-locations",
  requirePermission("warehouse.manage"),
  controller.createStorageLocation
);
router.post(
  "/product-attributes",
  requirePermission("catalog.manage"),
  controller.createAttributeDefinition
);

export { router as masterDataRouter };
