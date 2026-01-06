import { useEffect, useState } from "react";

interface ImageSyncStatus {
  status: "idle" | "running";
}

interface ImageSyncProgress {
  processed: number;
  total: number;
}

interface ImageSyncLog {
  message: string;
  level: "info" | "error";
  timestamp: string;
}

export function useImageSync() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ImageSyncProgress | null>(null);
  const [logs, setLogs] = useState<ImageSyncLog[]>([]);

  useEffect(() => {
    // @ts-ignore
    const removeStatusListener = window.imageSyncAPI?.onStatus(
      (status: ImageSyncStatus) => {
        setIsRunning(status.status === "running");
        if (status.status === "idle") {
          setProgress(null);
        }
      },
    );

    // @ts-ignore
    const removeProgressListener = window.imageSyncAPI?.onProgress(
      (data: ImageSyncProgress) => {
        setProgress(data);
      },
    );

    // @ts-ignore
    const removeLogListener = window.imageSyncAPI?.onLog(
      (log: { message: string; level: "info" | "error" }) => {
        setLogs((prev) => [
          ...prev,
          { ...log, timestamp: new Date().toLocaleTimeString() },
        ]);
      },
    );

    return () => {
      removeStatusListener?.();
      removeProgressListener?.();
      removeLogListener?.();
    };
  }, []);

  const startSync = async () => {
    setLogs([]); // Clear logs on start
    // @ts-ignore
    const result = await window.imageSyncAPI?.start();
    return result;
  };

  return { isRunning, progress, logs, startSync };
}
