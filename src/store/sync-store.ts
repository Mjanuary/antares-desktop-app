import { create } from "zustand";

type SyncState = {
  running: boolean;
  phase: "push" | "pull" | "idle";
  progress: number;
  table?: string;
  error?: string;
  lastSyncTime: Date | null;
  setStatus: (s: any) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  running: false,
  phase: "idle",
  progress: 0,
  table: undefined,
  error: undefined,
  lastSyncTime: null,

  setStatus: (status) => {
    switch (status.type) {
      case "start":
        set({
          running: true,
          phase: "idle",
          progress: 0,
          error: undefined,
          table: undefined,
        });
        break;
      case "push:table":
        set({ table: status.table, phase: "push" });
        break;
      case "pull:table":
        set({ table: status.table, phase: "pull" });
        break;
      case "progress":
        set({ progress: status.percent });
        break;
      case "error":
        set({ error: status.message, running: false, phase: "idle" });
        break;
      case "done":
        set({
          running: false,
          progress: 100,
          table: undefined,
          phase: "idle",
          lastSyncTime: new Date(),
        });
        break;
    }
  },
}));
