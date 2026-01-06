import { Worker } from "worker_threads";
import * as path from "path";
import { app, ipcMain, BrowserWindow } from "electron";
import { AppDatabase } from "../database";
import { IMAGE_STORAGE_FOLDER } from "../constants";
import {
  ImageSyncMessageFromWorker,
  WorkerConfig,
} from "../types/imageSync.types";

export class ImageSyncController {
  private worker: Worker | null = null;
  private db: AppDatabase;
  private mainWindow: BrowserWindow;
  private isRunning = false;

  constructor(db: AppDatabase, mainWindow: BrowserWindow) {
    this.db = db;
    this.mainWindow = mainWindow;
  }

  public init() {
    // Register IPC handler for manual trigger
    ipcMain.handle("image-sync:manual-trigger", async () => {
      if (this.isRunning) {
        return { success: false, message: "Sync is already running." };
      }
      this.runSync()
        .then(() => {
          console.log("[ImageSync] Sync completed.");
        })
        .catch((err) => {
          console.error("[ImageSync] Sync failed:", err);
        });
      return { success: true, message: "Sync started." };
    });

    // Auto-start logic could go here, or be called from main.ts
    // For now, we expose the runSync method to be called after DB init.
  }

  public async runSync(): Promise<void> {
    if (this.isRunning) {
      console.log("[ImageSync] Already running.");
      return;
    }

    console.log("[ImageSync] Starting sync process...");
    this.isRunning = true;
    this.notifyRenderer("image-sync:status", { status: "running" });

    try {
      // 1. Fetch products that need sync
      // We fetch ALL products with a cover_image_url.
      // The worker will decide if it needs to download based on file existence.
      const products = await this.db.getProductsForImageSync();

      if (products.length === 0) {
        console.log("[ImageSync] No products found with cover_image_url.");
        this.finishSync();
        return;
      }

      console.log(`[ImageSync] Found ${products.length} products to check.`);

      // 2. Prepare worker config
      const storagePath = path.join(
        app.getPath("userData"),
        IMAGE_STORAGE_FOLDER,
      );
      const config: WorkerConfig = {
        storagePath,
        tasks: products,
      };

      // 3. Resolve worker path
      // Since we are adding imageSync.worker to webpack entry, it will be in the same output dir.
      const workerPath = path.join(__dirname, "imageSync.worker.js");

      // 4. Spawn Worker
      this.worker = new Worker(workerPath);

      this.worker.on("message", async (msg: ImageSyncMessageFromWorker) => {
        switch (msg.type) {
          case "SYNC_SUCCESS":
            // Update DB with the local filename
            try {
              await this.db.updateProductLocalImage(
                msg.productId,
                msg.filename,
              );
              // console.log(`[ImageSync] Updated DB for product ${msg.productId}`);
            } catch (err) {
              console.error(
                `[ImageSync] Failed to update DB for product ${msg.productId}:`,
                err,
              );
            }
            break;

          case "SYNC_PROGRESS":
            this.notifyRenderer("image-sync:progress", {
              processed: msg.processed,
              total: msg.total,
            });
            break;

          case "SYNC_ERROR":
            // Logged in worker, handled here if needed
            // console.error(`[ImageSync] Error for ${msg.productId}: ${msg.error}`);
            break;

          case "LOG":
            this.notifyRenderer("image-sync:log", {
              message: msg.message,
              level: msg.level,
            });
            break;

          case "SYNC_COMPLETED":
            console.log("[ImageSync] Sync completed.");
            this.finishSync();
            break;
        }
      });

      this.worker.on("error", (err) => {
        console.error("[ImageSync] Worker encountered error:", err);
        this.finishSync();
      });

      this.worker.on("exit", (code) => {
        console.log(`[ImageSync] Worker exited with code ${code}`);
        this.finishSync();
      });

      // 5. Start the worker
      this.worker.postMessage({ type: "START_SYNC", config });
    } catch (error) {
      console.error("[ImageSync] Failed to start sync:", error);
      this.finishSync();
    }
  }

  private finishSync() {
    this.isRunning = false;
    this.notifyRenderer("image-sync:status", { status: "idle" });

    if (this.worker) {
      console.log("[ImageSync] Terminating worker...");
      this.worker.terminate().catch((err) => {
        console.error("[ImageSync] Error terminating worker:", err);
      });
      // Remove listeners to prevent further event handling (like exit)
      this.worker.removeAllListeners();
      this.worker = null;
    }
  }

  /*
   * Helper to send updates to renderer
   */
  private notifyRenderer(channel: string, payload: any) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send(channel, payload);
    }
  }
}
