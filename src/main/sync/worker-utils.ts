// src/main/worker-utils.ts
import fs from "fs";
import path from "path";

/**
 * Resolves sync worker path safely (DEV + PROD)
 * Throws if missing to avoid silent failure
 */
export function resolveSyncWorkerPath(): string {
  const workerPath = path.join(__dirname, "sync.worker.js");

  if (!fs.existsSync(workerPath)) {
    console.error(`Sync worker file not found: ${workerPath}`);
    throw new Error(`Sync worker file not found: ${workerPath}`);
  }

  return workerPath;
}
