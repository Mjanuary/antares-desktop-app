import { ipcMain, BrowserWindow } from "electron";
import { TodoDatabase } from "./database";

const db = new TodoDatabase();

export function setupIPC() {
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
