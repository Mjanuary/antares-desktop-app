import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  // Todo operations
  createTodo: (todo: any) => ipcRenderer.invoke("create-todo", todo),
  getTodos: () => ipcRenderer.invoke("get-todos"),
  updateTodo: (id: number, todo: any) =>
    ipcRenderer.invoke("update-todo", id, todo),
  deleteTodo: (id: number) => ipcRenderer.invoke("delete-todo", id),

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
