import { ipcMain, BrowserWindow } from "electron";
import { AppDatabase } from "./database";
import { handle } from "./ipc-typed";
import fs from "fs";
import { app as electronApp } from "electron";
import path from "path";

export const db = new AppDatabase(resolveDbPath());

export function resolveDbPath(): string {
  // If running inside Electron main process
  const userDataDir = electronApp
    ? electronApp.getPath("userData")
    : process.cwd(); // fallback for workers / Node-only

  // Ensure directory exists
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  // Return full path to the database file
  const dbPath = path.join(userDataDir, "antares_app.db");
  console.log(`[resolveDbPath] DB Path: ${dbPath}`);
  return dbPath;
}

export function setupIPC() {
  // Sync operations ------------------------------------------------
  handle("db:getActiveDeviceContext", () => db.getActiveDeviceContext());
  handle("db:countUnsyncedRows", (table) => db.countUnsyncedRows(table));
  handle("db:getUnsyncedRows", (table, limit, offset) =>
    db.getUnsyncedRows(table, limit, offset),
  );
  handle("db:upsertMany", (opts) => db.upsertMany(opts));
  handle("db:markTableSynced", (table) => db.markTableAsSynced(table));

  // 🚀 BATCH HANDLER
  handle("db:batch", async (ops) => {
    const results = [];
    for (const op of ops) {
      // @ts-expect-error safe by contract
      results.push(await db[op.op](...op.args));
    }
    return results;
  });

  // other operations ------------------------------------------------

  // Clients operations ----------------------------------------------
  ipcMain.handle("create-client", async (_, client) => {
    return await db.createClient(client);
  });

  ipcMain.handle("get-clients", async (_, page, pageSize, search, filters) => {
    return await db.getClients(page, pageSize, search, filters);
  });

  // Houses operations ----------------------------------------------
  ipcMain.handle("get-houses", async (_, page, pageSize, search, filters) => {
    return await db.getHouses(page, pageSize, search, filters);
  });

  // Todo operations
  ipcMain.handle("create-todo", async (_, todo) => {
    return await db.createTodo(todo);
  });

  ipcMain.handle("get-todos", async () => {
    return await db.getTodos();
  });

  ipcMain.handle("update-todo", async (_, id, todo) => {
    return await db.updateTodo(id, todo);
  });

  ipcMain.handle("delete-todo", async (_, id) => {
    return await db.deleteTodo(id);
  });

  // Connections operations ----------------------------------------------
  ipcMain.handle("create-app-connection", async (_, data) => {
    return await db.createDeviceConnection(data);
  });

  ipcMain.handle("get-app-connection", async () => {
    return await db.getLatestDeviceConnection();
  });

  ipcMain.handle("remove-app-connection", async () => {
    return await db.deleteAllDeviceConnections();
  });

  // Window operations
  ipcMain.on("minimize-window", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
  });

  ipcMain.on("maximize-window", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window?.isMaximized()) {
      window.unmaximize();
    } else {
      window?.maximize();
    }
  });

  ipcMain.on("close-window", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
  });
}
