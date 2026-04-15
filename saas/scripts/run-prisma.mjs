import { readFileSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

function parseEnvFile(filePath) {
  const entries = [];
  const raw = readFileSync(filePath, "utf8");

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const normalized = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;
    const separatorIndex = normalized.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    value = value.replace(/\\n/g, "\n");
    entries.push([key, value]);
  }

  return entries;
}

function loadMergedEnv() {
  const env = { ...process.env };
  const protectedKeys = new Set(Object.keys(process.env));

  for (const relativeFile of [".env", ".env.local"]) {
    const absoluteFile = path.resolve(relativeFile);
    if (!existsSync(absoluteFile)) {
      continue;
    }

    for (const [key, value] of parseEnvFile(absoluteFile)) {
      if (protectedKeys.has(key)) {
        continue;
      }

      env[key] = value;
    }
  }

  return env;
}

const prismaArgs = process.argv.slice(2);
if (prismaArgs.length === 0) {
  console.error("run-prisma: missing Prisma CLI arguments.");
  process.exit(1);
}

const child = spawn(
  process.execPath,
  [path.resolve("node_modules/prisma/build/index.js"), ...prismaArgs],
  {
    cwd: process.cwd(),
    env: loadMergedEnv(),
    stdio: "inherit",
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`run-prisma: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
