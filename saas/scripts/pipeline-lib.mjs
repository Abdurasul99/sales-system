import { spawn } from "node:child_process";
import path from "node:path";

export async function runStep(label, scriptPath, args = [], envOverrides = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve(scriptPath), ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...envOverrides,
      },
      stdio: "inherit",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve(undefined);
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? 1}`));
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}
