// import { useSyncStore } from "@/store/sync-store";
import { useEffect } from "react";
import { useSyncStore } from "../../store/sync-store";

export function useSyncStatus() {
  const setStatus = useSyncStore((s) => s.setStatus);

  useEffect(() => {
    window.electron.on("sync:status", setStatus);
  }, []);
}
