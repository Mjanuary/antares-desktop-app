import { BrowserWindow } from "electron";
import { Worker } from "worker_threads";
import { networkMonitor } from "../network/networkMonitor";
import { resolveSyncWorkerPath } from "./worker-utils";
import { appTableList } from "../constants";
// import { invoke } from "../ipc-typed";
import { db } from "../ipc";

let worker: Worker | null = null;
let syncing = false;

/**
 * Start a sync worker if one is not already running
 */
export async function startSync(mainWindow: BrowserWindow) {
  console.log("startSync() called");
  if (syncing) return;
  if (!networkMonitor.isOnline()) return;

  // ✅ Check active device via IPC
  // const deviceContext = await invoke("db:getActiveDeviceContext");
  const deviceContext = await db.getActiveDeviceContext();
  console.log({ deviceContext });

  if (!deviceContext) {
    mainWindow.webContents.send("sync:status", {
      type: "error",
      message: "Device not connected. Sync aborted.",
    });
    return;
  }

  console.log("[]Starting sync...");

  worker = new Worker(resolveSyncWorkerPath(), {
    workerData: {
      tables: appTableList,
      deviceId: deviceContext.deviceId,
      branchId: deviceContext.branchId,
      baseUrl: deviceContext.baseUrl,
    },
  });

  syncing = true;

  // Listen for status messages from worker
  worker.on("message", async (msg) => {
    // 1️⃣ Handle DB Requests from Worker
    if (msg.type === "db:request") {
      const { reqId, action, args } = msg;
      try {
        // @ts-expect-error safe dynamic access
        const result = await db[action.replace("db:", "")](...args);
        worker?.postMessage({
          type: "db:response",
          reqId,
          result,
        });
      } catch (err: any) {
        worker?.postMessage({
          type: "db:response",
          reqId,
          error: err.message,
        });
      }
      return;
    }

    // 2️⃣ Handle Status/Logs
    console.log("[SYNC WORKER] message:", msg);
    mainWindow.webContents.send("sync:status", msg);

    if (msg.type === "done" || msg.type === "error") {
      syncing = false;
      worker?.terminate();
      worker = null;
    }
  });

  worker.on("error", (err) => {
    console.error("[SYNC WORKER] error:", err);
    syncing = false;
    mainWindow.webContents.send("sync:status", {
      type: "error",
      message: err.message,
    });
    worker?.terminate();
    worker = null;
  });

  worker.on("exit", (code) => {
    console.log("[SYNC WORKER] exit", code);
    syncing = false;
    worker = null;
  });

  // Start the worker
  worker.postMessage("start");
}

/**
 * Auto-sync whenever network comes online
 */
export function registerAutoSync(mainWindow: BrowserWindow) {
  networkMonitor.on("online", async () => {
    console.log("[]Auto sync triggered...");
    await startSync(mainWindow);
  });
}
