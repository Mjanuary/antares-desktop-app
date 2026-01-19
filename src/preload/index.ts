import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Auth operation
  createAppConnection: (data: any) =>
    ipcRenderer.invoke("create-app-connection", data),
  getConnection: () => ipcRenderer.invoke("get-app-connection"),
  removeConnection: () => ipcRenderer.invoke("remove-app-connection"),

  // Client operations
  createClient: (client: any) => ipcRenderer.invoke("create-client", client),
  getClients: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-clients", page, pageSize, search, filters),

  // House operations
  getHouses: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-houses", page, pageSize, search, filters),

  // Product operations
  getProducts: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-products", page, pageSize, search, filters),

  // Sales operations
  getSales: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-sales", page, pageSize, search, filters),

  // Balances operations
  getBalances: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-balances", page, pageSize, search, filters),

  // Spendings operations
  getSpendings: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-spendings", page, pageSize, search, filters),

  getDeposits: (
    page?: number,
    pageSize?: number,
    search?: string,
    filters?: any,
  ) => ipcRenderer.invoke("get-deposits", page, pageSize, search, filters),

  getCategories: () => ipcRenderer.invoke("get-categories"),
  getSpendingCategories: () => ipcRenderer.invoke("get-spending-categories"),

  // Window operations
  minimize: () => ipcRenderer.send("minimize-window"),
  maximize: () => ipcRenderer.send("maximize-window"),
  close: () => ipcRenderer.send("close-window"),

  // Update operations
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),
  onUpdateStatus: (callback: (status: string, data?: any) => void) => {
    ipcRenderer.on("update-status", (_, status, data) =>
      callback(status, data),
    );
  },
});

contextBridge.exposeInMainWorld("syncAPI", {
  start: () => ipcRenderer.invoke("sync:start"),
  cancel: () => ipcRenderer.invoke("sync:cancel"),

  onStatus: (cb: (status: any) => void) => {
    const handler = (_: any, status: any) => {
      cb(status);
    };
    ipcRenderer.on("sync:status", handler);
    return () => ipcRenderer.removeListener("sync:status", handler);
  },
});

contextBridge.exposeInMainWorld("imageSyncAPI", {
  start: () => ipcRenderer.invoke("image-sync:manual-trigger"),

  onStatus: (cb: (status: { status: string }) => void) => {
    const handler = (_: any, data: any) => cb(data);
    ipcRenderer.on("image-sync:status", handler);
    return () => ipcRenderer.removeListener("image-sync:status", handler);
  },

  onProgress: (cb: (data: { processed: number; total: number }) => void) => {
    const handler = (_: any, data: any) => cb(data);
    ipcRenderer.on("image-sync:progress", handler);
    return () => ipcRenderer.removeListener("image-sync:progress", handler);
  },

  onLog: (cb: (log: { message: string; level: string }) => void) => {
    const handler = (_: any, data: any) => cb(data);
    ipcRenderer.on("image-sync:log", handler);
    return () => ipcRenderer.removeListener("image-sync:log", handler);
  },
});
