import { Todo } from "./Todo";
import { DeviceConnection } from "./auth.types";
import { UpdateInfo, DownloadProgress, UpdateStatus } from "./updates";

declare global {
  interface Window {
    electronAPI: {
      // Todo operations
      createTodo: (
        todo: Omit<Todo, "id" | "createdAt" | "updatedAt">
      ) => Promise<Todo>;
      getTodos: () => Promise<Todo[]>;
      updateTodo: (id: number, todo: Partial<Todo>) => Promise<void>;
      deleteTodo: (id: number) => Promise<void>;

      // Auth operation
      createAppConnection: (
        data: DeviceConnection
      ) => Promise<DeviceConnection>;
      getConnection: () => Promise<DeviceConnection>;
      removeConnection: () => Promise<void>;

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
          data?: UpdateInfo | DownloadProgress | string
        ) => void
      ) => void;
    };
  }
}
