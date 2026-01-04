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
