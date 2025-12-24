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

  setStatus: (status) => {
    if (status.type === "start") set({ running: true, progress: 0 });
    if (status.type === "progress") set({ progress: status.percent });
    if (status.type === "push:table") set({ table: status.table });
    if (status.type === "done") set({ running: false, progress: 100 });
  },
}));
