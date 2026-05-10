"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
app.listen(env_1.env.PORT, () => {
    // Intentional startup log for local demo and cloud tunnel workflows.
    console.log(`Sales System API listening on port ${env_1.env.PORT}`);
});
