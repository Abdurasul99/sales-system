import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "__tests__/ai-copilot-route.test.ts",
        "__tests__/ai-health-route.test.ts",
        "__tests__/auth-security.test.ts",
        "__tests__/purchase-receiving.test.ts",
        "__tests__/sales-api.test.ts",
        "__tests__/telegram-connect-route.test.ts",
        "__tests__/warehouse-intelligence-route.test.ts",
      ],
    },
  }),
);
