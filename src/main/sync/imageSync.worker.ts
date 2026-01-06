import { parentPort } from "worker_threads";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import {
  ImageSyncMessageFromMain,
  ImageSyncMessageFromWorker,
  WorkerConfig,
} from "../types/imageSync.types";

if (!parentPort) {
  throw new Error("This file must be run as a worker thread.");
}

const port = parentPort;

function postMessage(msg: ImageSyncMessageFromWorker) {
  port.postMessage(msg);
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function downloadImage(url: string, destPath: string): Promise<void> {
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
    timeout: 30000,
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function getFilenameFromUrl(url: string, productId: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const ext = path.extname(pathname) || ".jpg";
    // Sanitize filename to be safe
    const basename = path.basename(pathname, ext);
    // Use productId to ensure uniqueness if multiple products share same image URL or name
    return `${basename}_${productId}${ext}`;
  } catch (e) {
    // Fallback
    return `product_${productId}.jpg`;
  }
}

async function runSync(config: WorkerConfig) {
  const { storagePath, tasks } = config;
  ensureDir(storagePath);

  let processedCount = 0;
  const total = tasks.length;

  for (const task of tasks) {
    try {
      const { productId, url, existingFilename } = task;

      // Check if we already have a synced filename in DB
      let targetFilename = existingFilename;
      let fileExists = false;

      if (targetFilename) {
        // If DB has a filename, check if it actually exists on disk
        const fullPath = path.join(storagePath, targetFilename);
        if (fs.existsSync(fullPath)) {
          fileExists = true;
        }
      }

      if (fileExists) {
        // Already synced and exists
        postMessage({
          type: "LOG",
          level: "info",
          message: `Product ${productId} image already exists.`,
        });
        // We might want to send a success message just to confirm?
        // Or strictly only when new download happens.
        // Prompt says "check if local_image_filename exist... and download it if it does not exist."
        // If DB says it exists but file is missing, we re-download.
      } else {
        // Need to download
        // If we didn't have a filename, or the file was missing, generate a new filename
        // If we had a filename but file was missing, we can reuse that filename OR generate new.
        // Let's generate a consistent one.
        const newFilename = getFilenameFromUrl(url, productId);
        const destPath = path.join(storagePath, newFilename);

        postMessage({
          type: "LOG",
          level: "info",
          message: `Downloading for ${productId}: ${url} -> ${newFilename}`,
        });

        await downloadImage(url, destPath);

        // Notify success
        postMessage({
          type: "SYNC_SUCCESS",
          productId,
          filename: newFilename,
        });
      }
    } catch (err: any) {
      postMessage({
        type: "SYNC_ERROR",
        productId: task.productId,
        error: err.message || String(err),
      });
      postMessage({
        type: "LOG",
        level: "error",
        message: `Failed to download for ${task.productId}: ${err}`,
      });
    } finally {
      processedCount++;
      postMessage({
        type: "SYNC_PROGRESS",
        processed: processedCount,
        total,
      });
    }
  }

  postMessage({ type: "SYNC_COMPLETED" });
}

port.on("message", async (msg: ImageSyncMessageFromMain) => {
  if (msg.type === "START_SYNC") {
    await runSync(msg.config);
  } else if (msg.type === "STOP_SYNC") {
    process.exit(0);
  }
});
