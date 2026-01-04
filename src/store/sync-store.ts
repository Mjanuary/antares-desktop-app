import { create } from "zustand";

type SyncState = {
  running: boolean;
  progress: number;
  table?: string;
  error?: string;
  setStatus: (s: any) => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  running: false,
  progress: 0,
  table: undefined,
  error: undefined,

  setStatus: (status) => {
    switch (status.type) {
      case "start":
        set({ running: true, progress: 0, error: undefined, table: undefined });
        break;
      case "push:table":
      case "pull:table":
        set({ table: status.table });
        break;
      case "progress":
        set({ progress: status.percent });
        break;
      case "error":
        set({ error: status.message, running: false });
        break;
      case "done":
        set({ running: false, progress: 100, table: undefined });
        break;
    }
  },
}));
