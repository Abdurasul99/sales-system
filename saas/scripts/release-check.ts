import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import {
  parseTaskGraph,
  validateFeatureIntake,
  validateReleaseReview,
  validateTaskGraph,
  type ReleaseReview,
} from "../lib/release/gates";

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
  const releaseReviewPath = path.resolve(".release/review.json");

  const [featureIntake, taskGraph, releaseReviewRaw] = await Promise.all([
    readText(featureIntakePath),
    readText(taskGraphPath),
    readText(releaseReviewPath),
  ]);

  const featureIntakeErrors = validateFeatureIntake(featureIntake);
  const taskGraphErrors = validateTaskGraph(parseTaskGraph(taskGraph));
  const releaseReview = JSON.parse(releaseReviewRaw) as ReleaseReview;
  const reviewErrors = validateReleaseReview(releaseReview);
  const errors = [...featureIntakeErrors, ...taskGraphErrors, ...reviewErrors];

  if (releaseReview.schemaChanged || releaseReview.migrationPresent) {
    const migrationsDir = path.resolve("prisma/migrations");
    const entries = await readdir(migrationsDir, { withFileTypes: true });
    const migrationCount = entries.filter((entry) => entry.isDirectory()).length;

    if (migrationCount === 0) {
      errors.push("No Prisma migration directories were found under prisma/migrations.");
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`release-check: ${error}`);
    }
    process.exit(1);
  }

  console.log("release-check passed");
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`release-check: ${message}`);
  process.exit(1);
});
