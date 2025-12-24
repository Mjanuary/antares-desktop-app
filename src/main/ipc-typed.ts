import { ipcMain, ipcRenderer } from "electron";
import { IpcDB } from "./ipc-contract";

/* ---------- MAIN ---------- */
export function handle<K extends keyof IpcDB>(
  channel: K,
  fn: (...args: IpcDB[K]["args"]) => Promise<IpcDB[K]["result"]>
) {
  ipcMain.handle(channel, (_, ...args) => {
    return fn(...(args as IpcDB[K]["args"]));
  });
}

/* ---------- WORKER / RENDERER ---------- */
export function invoke<K extends keyof IpcDB>(
  channel: K,
  ...args: IpcDB[K]["args"]
): Promise<IpcDB[K]["result"]> {
  return ipcRenderer.invoke(channel, ...args);
}
