import { DeviceConnection } from "../types/auth.types";
import { create } from "zustand";

interface UserAuthType {
  account: DeviceConnection | null;
  setAccount: (account: DeviceConnection | null) => void;

  // used during app connection approval
  connection: DeviceConnection | null;
  setConnection: (connection: DeviceConnection | null) => void;
}

export const authStore = create<UserAuthType>((set) => ({
  account: null,
  setAccount: (user) => set((state) => ({ account: user })),
  // used during app connection approval
  connection: null,
  setConnection: (user) => set((state) => ({ connection: user })),
}));
