import { runStep } from "./pipeline-lib.mjs";

async function main() {
  await runStep("plan:check", "./scripts/run-local-js.mjs", [
    "./node_modules/tsx/dist/cli.mjs",
    "scripts/plan-check.ts",
  ]);
  await runStep("db:validate", "./scripts/run-prisma.mjs", ["validate"]);
  await runStep("lint", "./scripts/run-local-js.mjs", [
    "./node_modules/next/dist/bin/next",
    "lint",
  ]);
  await runStep("typecheck", "./scripts/run-local-js.mjs", [
    "./node_modules/typescript/bin/tsc",
    "--noEmit",
  ]);
  await runStep("test", "./scripts/test-pipeline.mjs");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
