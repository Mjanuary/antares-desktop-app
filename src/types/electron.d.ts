import { Todo } from "./Todo";
import { DeviceConnection } from "./auth.types";
import { UpdateInfo, DownloadProgress, UpdateStatus } from "./updates";

declare global {
  interface Window {
    electronAPI: {
      // Todo operations
      createTodo: (
        todo: Omit<Todo, "id" | "createdAt" | "updatedAt">,
      ) => Promise<Todo>;
      getTodos: () => Promise<Todo[]>;
      updateTodo: (id: number, todo: Partial<Todo>) => Promise<void>;
      deleteTodo: (id: number) => Promise<void>;

      // Auth operation
      createAppConnection: (
        data: DeviceConnection,
      ) => Promise<DeviceConnection>;
      getConnection: () => Promise<DeviceConnection>;
      removeConnection: () => Promise<void>;

      // Clients
      createClient: (client: any) => Promise<any>;
      getClients: (
        page?: number,
        pageSize?: number,
        search?: string,
        filters?: any,
      ) => Promise<{
        data: any[];
        total: number;
        page: number;
        pageSize: number;
      }>;

      // Window operations
      minimize: () => void;
      maximize: () => void;
      close: () => void;

      // Update operations
      checkForUpdates: () => Promise<void>;
      downloadUpdate: () => Promise<void>;
      installUpdate: () => Promise<void>;
      onUpdateStatus: (
        callback: (
          status: UpdateStatus,
          data?: UpdateInfo | DownloadProgress | string,
        ) => void,
      ) => void;
    };

    // Sync
    syncAPI: {
      start(): Promise<{ ok: boolean }>;
      cancel(): Promise<{ ok: boolean }>;
      onStatus(cb: (status: any) => void): () => void;
    };

    electron: {
      on: (channel: string, callback: (data: any) => void) => void;
      off?: (channel: string, callback: (data: any) => void) => void;
      send?: (channel: string, data?: any) => void;
    };
  }
}
