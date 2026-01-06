export interface ImageSyncTask {
  productId: string;
  url: string;
  existingFilename: string | null;
}

export interface WorkerConfig {
  storagePath: string;
  tasks: ImageSyncTask[];
}

export type ImageSyncMessageFromMain =
  | { type: "START_SYNC"; config: WorkerConfig }
  | { type: "STOP_SYNC" };

export type ImageSyncMessageFromWorker =
  | { type: "SYNC_SUCCESS"; productId: string; filename: string }
  | { type: "SYNC_ERROR"; productId: string; error: string }
  | { type: "SYNC_PROGRESS"; processed: number; total: number }
  | { type: "LOG"; message: string; level: "info" | "error" }
  | { type: "SYNC_COMPLETED" };
