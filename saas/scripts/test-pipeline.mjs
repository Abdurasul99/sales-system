import { runStep } from "./pipeline-lib.mjs";

async function main() {
  await runStep("test:unit", "./scripts/run-local-js.mjs", [
    "./node_modules/vitest/vitest.mjs",
    "run",
    "--config",
    "vitest.unit.config.ts",
  ]);

  await runStep("test:integration", "./scripts/run-local-js.mjs", [
    "./node_modules/vitest/vitest.mjs",
    "run",
    "--config",
    "vitest.integration.config.ts",
  ]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
