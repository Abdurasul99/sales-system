import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseTaskGraph, validateFeatureIntake, validateTaskGraph } from "../lib/release/gates";

async function readText(filePath: string) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Required file missing: ${filePath}. ${reason}`);
  }
}

async function main() {
  const featureIntakePath = path.resolve(".meta/feature-intake.md");
  const taskGraphPath = path.resolve(".meta/task-graph.md");

  const [featureIntake, taskGraph] = await Promise.all([
    readText(featureIntakePath),
    readText(taskGraphPath),
  ]);

  const errors = [
    ...validateFeatureIntake(featureIntake),
    ...validateTaskGraph(parseTaskGraph(taskGraph)),
  ];

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`plan-check: ${error}`);
    }
    process.exit(1);
  }

  console.log("plan-check passed");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`plan-check: ${message}`);
  process.exit(1);
});
