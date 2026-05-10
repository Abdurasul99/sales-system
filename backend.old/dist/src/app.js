"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const error_handler_1 = require("./middlewares/error-handler");
const routes_1 = require("./modules/analytics/routes");
const routes_2 = require("./modules/auth/routes");
const routes_3 = require("./modules/customers/routes");
const routes_4 = require("./modules/health/routes");
const iam_routes_1 = require("./modules/iam/iam.routes");
const routes_5 = require("./modules/inventory/routes");
const master_data_routes_1 = require("./modules/master-data/master-data.routes");
const routes_6 = require("./modules/products/routes");
const routes_7 = require("./modules/purchases/routes");
const returns_routes_1 = require("./modules/returns/returns.routes");
const routes_8 = require("./modules/sales/routes");
const routes_9 = require("./modules/suppliers/routes");
const routes_10 = require("./modules/users/routes");
const routes_11 = require("./modules/warehouses/routes");
function createApp() {
    const app = (0, express_1.default)();
    const webBuildDir = node_path_1.default.resolve(process.cwd(), "../flutter_app/build/web");
    const hasWebBuild = node_fs_1.default.existsSync(node_path_1.default.join(webBuildDir, "index.html"));
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("dev"));
    app.get("/", (_req, res) => {
        if (hasWebBuild) {
            res.sendFile(node_path_1.default.join(webBuildDir, "index.html"));
            return;
        }
        res.json({
            name: "Sales System API",
            version: "0.1.0",
            docs: "/api/health"
        });
    });
    app.use("/api/health", routes_4.healthRouter);
    app.use("/api/auth", routes_2.authRouter);
    app.use("/api/iam", iam_routes_1.iamRouter);
    app.use("/api/master-data", master_data_routes_1.masterDataRouter);
    app.use("/api/users", routes_10.usersRouter);
    app.use("/api/products", routes_6.productsRouter);
    app.use("/api/customers", routes_3.customersRouter);
    app.use("/api/suppliers", routes_9.suppliersRouter);
    app.use("/api/warehouses", routes_11.warehousesRouter);
    app.use("/api/inventory", routes_5.inventoryRouter);
    app.use("/api/sales", routes_8.salesRouter);
    app.use("/api/sales-orders", routes_8.salesRouter);
    app.use("/api/purchases", routes_7.purchasesRouter);
    app.use("/api/purchase-orders", routes_7.purchasesRouter);
    app.use("/api/returns", returns_routes_1.returnsRouter);
    app.use("/api/return-orders", returns_routes_1.returnsRouter);
    app.use("/api/analytics", routes_1.analyticsRouter);
    if (hasWebBuild) {
        app.use(express_1.default.static(webBuildDir));
        app.get(/^(?!\/api).*/, (_req, res) => {
            res.sendFile(node_path_1.default.join(webBuildDir, "index.html"));
        });
    }
    app.use(error_handler_1.errorHandler);
    return app;
}
