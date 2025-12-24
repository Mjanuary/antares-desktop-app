import { parentPort } from "worker_threads";
import { SyncEngine } from "./sync-engine";

/**
 * Bridge to Main Process
 * Since Worker Threads cannot use IPC, we send messages to parent
 * and wait for a response.
 */
function callMain<T>(action: string, ...args: any[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const reqId = Math.random().toString(36).substring(7);

    const handler = (msg: any) => {
      if (msg.type === "db:response" && msg.reqId === reqId) {
        parentPort?.off("message", handler);
        if (msg.error) reject(new Error(msg.error));
        else resolve(msg.result);
      }
    };

    parentPort?.on("message", handler);
    parentPort?.postMessage({ type: "db:request", reqId, action, args });
  });
}

(async () => {
  try {
    const deviceContext = await callMain<{
      deviceId: string;
      branchId: string;
    }>("db:getActiveDeviceContext");

    if (!deviceContext) {
      parentPort?.postMessage({
        type: "error",
        message: "Device not connected",
      });
      return;
    }

    const engine = new SyncEngine({
      db: {
        countUnsyncedRows: (t) => callMain("db:countUnsyncedRows", t),
        getUnsyncedRows: (t, l, o) => callMain("db:getUnsyncedRows", t, l, o),
        upsertMany: (t, r) => callMain("db:upsertMany", t, r),
        markTableAsSynced: (t) => callMain("db:markTableSynced", t),
        addRetry: (t, p, e) => callMain("db:addRetry", t, p, e),
        getRetries: (t) => callMain("db:getRetries", t),
        removeRetry: (id) => callMain("db:removeRetry", id),
        incrementRetry: (id) => callMain("db:incrementRetry", id),
        upsert: (t, r) => callMain("db:upsert", t, r),
      },
      tables: ["users", "todos"], // Tables to sync
      deviceId: deviceContext.deviceId,
      branchId: deviceContext.branchId || "",
    });

    // Relay logs to main
    // engine.on("log", (msg) => console.log(msg));

    engine.run();
  } catch (err: any) {
    parentPort?.postMessage({
      type: "error",
      message: err.message,
    });
  }
})();
