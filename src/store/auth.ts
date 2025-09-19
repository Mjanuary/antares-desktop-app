import { DeviceConnection } from "../renderer/types/index";
import { create } from "zustand";

interface UserAuthType {
  account: DeviceConnection | null;
  setAccount: (account: DeviceConnection | null) => void;
}

export const authStore = create<UserAuthType>((set) => ({
  account: null,
  setAccount: (user) => set((state) => ({ account: user })),
}));
