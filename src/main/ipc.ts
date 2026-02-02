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

  // Products operations ----------------------------------------------
  ipcMain.handle("get-products", async (_, page, pageSize, search, filters) => {
    return await db.getProducts(page, pageSize, search, filters);
  });

  ipcMain.handle("get-product-details", async (_, productId) => {
    return await db.getProductDetails(productId);
  });

  // Sales operations ----------------------------------------------
  ipcMain.handle("get-sales", async (_, page, pageSize, search, filters) => {
    return await db.getSales(page, pageSize, search, filters);
  });

  ipcMain.handle("get-sale-details", async (_, saleId) => {
    return await db.getSaleDetails(saleId);
  });

  ipcMain.handle("get-categories", async () => {
    return await db.getCategories();
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

  // Balances opertations ----------------------------------------------

  ipcMain.handle("get-balances", async (_, page, pageSize, search, filters) => {
    return await db.getBalances(page, pageSize, search, filters);
  });

  // Spendings operations ----------------------------------------------
  ipcMain.handle(
    "get-spendings",
    async (_, page, pageSize, search, filters) => {
      return await db.getSpendings(page, pageSize, search, filters);
    },
  );

  ipcMain.handle("get-deposits", async (_, page, pageSize, search, filters) => {
    return await db.getDeposits(page, pageSize, search, filters);
  });

  ipcMain.handle("get-spending-categories", async () => {
    return await db.getSpendingCategories();
  });

  ipcMain.handle("create-expense", async (_, expense) => {
    return await db.createExpense(expense);
  });

  ipcMain.handle("delete-expense", async (_, id, deleteInfo) => {
    return await db.deleteExpense(id, deleteInfo);
  });

  ipcMain.handle("get-branch-details", async () => {
    return await db.getBranchDetails();
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
