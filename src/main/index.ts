import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import isDev from "electron-is-dev";
import { setupIPC } from "./ipc";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { SyncEngine } from "./sync/sync-engine";
import { registerAutoSync, startSync } from "./sync/sync-manager";
import { registerSyncIPC } from "./ipc/sync.ipc";
import { db } from "./ipc";

// Configure logging
log.transports.file.level = "info";
autoUpdater.logger = log;

// Configure auto-updater
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;
let syncEngine: SyncEngine | null = null;

export function resolveDbPath() {
  return path.join(app.getPath("userData"), "database.sqlite");
}

function createSplashWindow() {
  log.info("Creating splash window...");

  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Get the correct path for the splash screen
  let splashPath: string;
  if (isDev) {
    splashPath = path.join(__dirname, "../../src/splash.html");
  } else {
    // In production, try multiple possible locations
    const possiblePaths = [
      path.join(process.resourcesPath, "splash.html"),
      path.join(__dirname, "../splash.html"),
      path.join(__dirname, "splash.html"),
      path.join(app.getAppPath(), "splash.html"),
    ];

    log.info("Checking possible splash screen paths:");
    possiblePaths.forEach((p) =>
      log.info(`- ${p} (exists: ${fs.existsSync(p)})`),
    );

    // Use the first path that exists
    splashPath =
      possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];
  }

  log.info("Loading splash screen from:", splashPath);
  log.info("Splash screen exists:", fs.existsSync(splashPath));

  splashWindow.loadFile(splashPath).catch((error) => {
    log.error("Failed to load splash screen:", error);
  });
}

function createWindow() {
  log.info("Creating main window...");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Don't show the main window until it's ready
    title: "Antares App",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "../preload/index.js"),
      webSecurity: true,
      devTools: true, // Enable dev tools
    },
  });

  if (isDev) {
    // Development: load localhost
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // Production: load built files
    const indexPath = path.join(__dirname, "../renderer/index.html");
    log.info("Loading main window from:", indexPath);
    log.info("index.html exists:", fs.existsSync(indexPath));

    mainWindow.loadFile(indexPath).catch((error) => {
      log.error("Failed to load production index.html:", error);
    });
  }

  // Optionally open DevTools automatically
  mainWindow.webContents.openDevTools();

  // Show main window when it's ready
  mainWindow.webContents.on("did-finish-load", () => {
    log.info("Main window loaded, waiting 3 seconds before showing...");
    // Wait for 3 seconds before showing the main window
    setTimeout(() => {
      if (mainWindow) {
        log.info("Showing main window and destroying splash screen");
        mainWindow.show();
        if (splashWindow) {
          splashWindow.destroy();
          splashWindow = null;
        }
      }
    }, 3000);
  });

  // ------------------------
  // Add periodic sync here
  setInterval(
    () => {
      if (mainWindow) {
        log.info("[Main] Triggering periodic sync...");
        startSync(mainWindow);
      }
    },
    5 * 60 * 1000,
  );

  // Listen for failures
  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      log.error("Failed to load main window:", errorCode, errorDescription);
    },
  );
}

// Auto-updater events
function setupAutoUpdater() {
  if (isDev) return;

  log.info("Setting up auto-updater...");
  log.info("Current version:", app.getVersion());
  log.info("Update server URL:", autoUpdater.getFeedURL());

  autoUpdater.on("checking-for-update", () => {
    log.info("Checking for updates...");
    mainWindow?.webContents.send("update-status", "checking");
  });

  autoUpdater.on("update-available", (info) => {
    log.info("Update available:", info);
    mainWindow?.webContents.send("update-status", "available", info);
  });

  autoUpdater.on("update-not-available", (info) => {
    log.info("Update not available:", info);
    mainWindow?.webContents.send("update-status", "not-available");
  });

  autoUpdater.on("download-progress", (progressObj) => {
    log.info("Download progress:", progressObj);
    mainWindow?.webContents.send("update-status", "downloading", progressObj);
  });

  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded:", info);
    mainWindow?.webContents.send("update-status", "downloaded", info);
  });

  // IPC handlers for update actions
  ipcMain.handle("check-for-updates", async () => {
    if (!isDev) {
      try {
        log.info("Checking for updates...");
        await autoUpdater.checkForUpdates();
      } catch (error) {
        log.error("Error checking for updates:", error);
        mainWindow?.webContents.send(
          "update-status",
          "error",
          "Failed to check for updates",
        );
      }
    }
  });

  ipcMain.handle("download-update", async () => {
    if (!isDev) {
      try {
        log.info("Downloading update...");
        await autoUpdater.downloadUpdate();
      } catch (error) {
        log.error("Error downloading update:", error);
        mainWindow?.webContents.send(
          "update-status",
          "error",
          "Failed to download update",
        );
      }
    }
  });

  ipcMain.handle("install-update", () => {
    if (!isDev) {
      try {
        log.info("Installing update...");
        autoUpdater.quitAndInstall();
      } catch (error) {
        log.error("Error installing update:", error);
        mainWindow?.webContents.send(
          "update-status",
          "error",
          "Failed to install update",
        );
      }
    }
  });
}

app.whenReady().then(async () => {
  // 1. Show Splash Immediately
  createSplashWindow();

  // 2. LIFECYCLE BARRIER: Initialize Database
  // Nothing else (IPC, Sync, Main Window) can happen until this finishes.
  try {
    log.info("Initializing database...");
    await db.init();
    log.info("Database initialized successfully.");
  } catch (err) {
    log.error("CRITICAL: Database initialization failed", err);
    // In a real app, you might show a dialog here and quit.
    // For now, we log and potentially let it crash or hang on splash.
    return;
  }

  // 3. Create Main Window (Hidden until loaded)
  createWindow();

  // 4. Register Legacy IPC (safe now that DB is ready)
  setupIPC();

  // 5. Setup Updater
  setupAutoUpdater();

  /**
   * Enable auto-sync when internet reconnects
   * Register IPC handlers ONCE
   */
  if (mainWindow) {
    mainWindow.webContents.on("did-finish-load", () => {
      // 6. Register Sync IPC & Auto-Sync (Worker startup)
      registerSyncIPC(mainWindow!);
      registerAutoSync(mainWindow!);
    });
  }

  // Check for updates on startup (only in production)
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow(); // sets mainWindow internally
    mainWindow?.webContents.on("did-finish-load", () => {
      registerSyncIPC(mainWindow!);
      registerAutoSync(mainWindow!);
    });
  }
});
