import { create } from "zustand";

type NetworkState = {
  online: boolean;
  setOnline: (v: boolean) => void;
};

export const useNetworkStore = create<NetworkState>((set) => ({
  online: navigator.onLine,
  setOnline: (online) => set({ online }),
}));
