import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptPath = path.join(__dirname, "..", "scripts", "nba_client.py");

function resolvePythonCommand() {
  if (process.env.PYTHON_COMMAND) {
    return process.env.PYTHON_COMMAND;
  }

  const workspaceRoot = path.resolve(__dirname, "..", "..");
  const venvWindows = path.join(
    workspaceRoot,
    ".venv",
    "Scripts",
    "python.exe",
  );
  const venvUnix = path.join(workspaceRoot, ".venv", "bin", "python");

  if (fs.existsSync(venvWindows)) {
    return venvWindows;
  }

  if (fs.existsSync(venvUnix)) {
    return venvUnix;
  }

  return "python";
}

export function runNbaScript(action, params = {}) {
  return new Promise((resolve, reject) => {
    const pythonCommand = resolvePythonCommand();
    const processHandle = spawn(pythonCommand, [
      scriptPath,
      action,
      JSON.stringify(params),
    ]);

    let stdout = "";
    let stderr = "";

    processHandle.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    processHandle.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    processHandle.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || "NBA script failed"));
        return;
      }

      try {
        const payload = JSON.parse(stdout.trim());
        if (!payload.success) {
          reject(
            new Error(
              payload.error || "NBA script returned unsuccessful response",
            ),
          );
          return;
        }
        resolve(payload.data);
      } catch {
        reject(new Error("Unable to parse NBA script output"));
      }
    });
  });
}
