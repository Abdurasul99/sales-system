import { runStep } from "./pipeline-lib.mjs";

async function main() {
  await runStep("verify", "./scripts/verify.mjs");
  await runStep("test:e2e", "./scripts/run-local-js.mjs", [
    "./node_modules/tsx/dist/cli.mjs",
    "scripts/smoke.ts",
  ]);
  await runStep("release-check", "./scripts/run-local-js.mjs", [
    "./node_modules/tsx/dist/cli.mjs",
    "scripts/release-check.ts",
  ]);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
