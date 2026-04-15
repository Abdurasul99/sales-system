import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: [
        "__tests__/inventory-intelligence.test.ts",
        "__tests__/release-gates.test.ts",
        "__tests__/sales-calculations.test.ts",
        "__tests__/utils.test.ts",
      ],
    },
  }),
);
