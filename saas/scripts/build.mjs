import { existsSync } from "node:fs";
import path from "node:path";
import { runStep } from "./pipeline-lib.mjs";

const prismaClientPath = path.resolve("node_modules/.prisma/client/index.js");
const shouldGeneratePrisma =
  process.env.CI === "true" ||
  process.env.VERCEL === "1" ||
  process.env.FORCE_PRISMA_GENERATE === "true" ||
  !existsSync(prismaClientPath);

async function main() {
  if (shouldGeneratePrisma) {
    await runStep("db:generate", "./scripts/run-prisma.mjs", ["generate"]);
  } else {
    console.log("Skipping prisma generate for local build because Prisma client already exists.");
  }

  await runStep("build", "./scripts/run-local-js.mjs", [
    "./node_modules/next/dist/bin/next",
    "build",
  ], {
    NEXT_DIST_DIR: ".next-build",
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
