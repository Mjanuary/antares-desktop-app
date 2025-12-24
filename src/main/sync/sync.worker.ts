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
    const deviceContext = await callMain<{ deviceId: string; branchId: string }>(
      "db:getActiveDeviceContext"
    );

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
      tables: ["users", "todos" ], // Tables to sync
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

// old codes
// import { parentPort, workerData } from "worker_threads";
// import { SyncEngine } from "./sync-engine";
// import { AppDatabase } from "../database";

// /* ----------------------------------
//    1️⃣ Crash reporting helpers
// ----------------------------------- */
// function reportFatal(code: string, error: unknown) {
//   parentPort?.postMessage({
//     type: "fatal",
//     code,
//     message: error instanceof Error ? error.message : String(error),
//     stack: error instanceof Error ? error.stack : undefined,
//   });
// }

// /* ----------------------------------
//    2️⃣ GLOBAL crash handlers
//    (must be at top level)
// ----------------------------------- */
// process.on("unhandledRejection", (reason) => {
//   reportFatal("UNHANDLED_REJECTION", reason);
//   process.exit(1);
// });

// process.on("uncaughtException", (error) => {
//   reportFatal("UNCAUGHT_EXCEPTION", error);
//   process.exit(1);
// });

// /* ----------------------------------
//    3️⃣ Worker exit visibility
// ----------------------------------- */
// process.on("exit", (code) => {
//   parentPort?.postMessage({
//     type: "exit",
//     code,
//   });
// });

// (async () => {
//   const { dbPath } = workerData;

//   if (!dbPath) {
//     throw new Error("dbPath not provided to sync worker");
//   }

//   // const db = new AppDatabase(dbPath);
//   // await db.initializeDatabase();

//   const db = new AppDatabase({
//     role: "worker",
//     dbPath: dbPath,
//   });

//   /**
//    * Resolve device & branch context BEFORE sync.
//    * Abort early if device is not registered.
//    */
//   console.log("Calling: getActiveDeviceContext() - syn-worker", dbPath);

//   const deviceContext = await db.getActiveDeviceContext();
//   console.log(
//     "--------------------------------------------------------------------------"
//   );
//   console.log({ deviceContext });
//   if (!deviceContext) {
//     parentPort?.postMessage({
//       type: "error",
//       code: "NO_DEVICE_CONTEXT",
//       message:
//         "This device is not connected or has been blocked. Sync aborted.",
//     });

//     process.exit(0);
//     return;
//   }

//   console.log({ deviceContext, tables: ["clients", "orders", "payments"] });
//   console.log(
//     "--------------------------------------------------------------------------"
//   );

//   const engine = new SyncEngine({
//     db,
//     tables: ["clients", "orders", "payments"],
//     deviceId: deviceContext.deviceId,
//     branchId: deviceContext.branchId || "",
//   });

//   engine.on("status", (status) => {
//     console.log("[SYNC WORKER] status:", status);

//     parentPort?.postMessage(status);
//   });

//   parentPort?.on("message", (msg) => {
//     if (msg === "start") engine.run();
//     if (msg === "cancel") engine.cancel();
//   });
// })();
