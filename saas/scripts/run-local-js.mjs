import { spawn } from "node:child_process";
import path from "node:path";

const [scriptPath, ...args] = process.argv.slice(2);

if (!scriptPath) {
  console.error("run-local-js: missing target script path.");
  process.exit(1);
}

const child = spawn(process.execPath, [path.resolve(scriptPath), ...args], {
  cwd: process.cwd(),
  env: process.env,
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(`run-local-js: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
