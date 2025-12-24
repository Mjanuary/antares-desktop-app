import { ipcMain, BrowserWindow } from "electron";
import { startSync } from "../sync/sync-manager";

/**
 * Register IPC handlers related to sync
 * This file ONLY triggers sync — it does not manage workers or DB
 */
export function registerSyncIPC(mainWindow: BrowserWindow) {
  console.log("registerSyncIPC()");
  /**
   * Manual sync trigger from renderer (button click)
   */
  ipcMain.handle("sync:start", async () => {
    console.log("ipcMain.handle('sync:start'.......................");
    await startSync(mainWindow);
    return { ok: true };
  });

  /**
   * Optional: cancel sync (if you later support cancellation)
   */
  ipcMain.handle("sync:cancel", () => {
    // For now, cancellation is handled inside startSync / worker lifecycle
    // This is kept for future extension
    return { ok: true };
  });
}
