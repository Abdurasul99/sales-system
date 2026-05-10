import cors from "cors";
import express from "express";
import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

import { errorHandler } from "./middlewares/error-handler";
import { analyticsRouter } from "./modules/analytics/routes";
import { authRouter } from "./modules/auth/routes";
import { customersRouter } from "./modules/customers/routes";
import { healthRouter } from "./modules/health/routes";
import { iamRouter } from "./modules/iam/iam.routes";
import { inventoryRouter } from "./modules/inventory/routes";
import { masterDataRouter } from "./modules/master-data/master-data.routes";
import { productsRouter } from "./modules/products/routes";
import { purchasesRouter } from "./modules/purchases/routes";
import { returnsRouter } from "./modules/returns/returns.routes";
import { salesRouter } from "./modules/sales/routes";
import { suppliersRouter } from "./modules/suppliers/routes";
import { usersRouter } from "./modules/users/routes";
import { warehousesRouter } from "./modules/warehouses/routes";

export function createApp() {
  const app = express();
  const webBuildDir = path.resolve(process.cwd(), "../flutter_app/build/web");
  const hasWebBuild = fs.existsSync(path.join(webBuildDir, "index.html"));

  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/", (_req, res) => {
    if (hasWebBuild) {
      res.sendFile(path.join(webBuildDir, "index.html"));
      return;
    }

    res.json({
      name: "Sales System API",
      version: "0.1.0",
      docs: "/api/health"
    });
  });

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/iam", iamRouter);
  app.use("/api/master-data", masterDataRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/customers", customersRouter);
  app.use("/api/suppliers", suppliersRouter);
  app.use("/api/warehouses", warehousesRouter);
  app.use("/api/inventory", inventoryRouter);
  app.use("/api/sales", salesRouter);
  app.use("/api/sales-orders", salesRouter);
  app.use("/api/purchases", purchasesRouter);
  app.use("/api/purchase-orders", purchasesRouter);
  app.use("/api/returns", returnsRouter);
  app.use("/api/return-orders", returnsRouter);
  app.use("/api/analytics", analyticsRouter);

  if (hasWebBuild) {
    app.use(express.static(webBuildDir));
    app.get(/^(?!\/api).*/, (_req, res) => {
      res.sendFile(path.join(webBuildDir, "index.html"));
    });
  }

  app.use(errorHandler);

  return app;
}
