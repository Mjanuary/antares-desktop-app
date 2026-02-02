import { DeviceConnection } from "../types/auth.types";
import { create } from "zustand";
import { BranchType_Zod } from "../main/sync/sync-validation";

type BranchType_Json = BranchType_Zod & {
  rate_in: { RWF: number; CDF: number } | null;
  rate_out: { RWF: number; CDF: number } | null;
};

interface UserAuthType {
  account: DeviceConnection | null;
  setAccount: (account: DeviceConnection | null) => void;

  branch: BranchType_Json | null;
  setBranch: (branch: BranchType_Json | null) => void;

  // used during app connection approval
  connection: DeviceConnection | null;
  setConnection: (connection: DeviceConnection | null) => void;
}

export const authStore = create<UserAuthType>((set) => ({
  account: null,
  setAccount: (user) =>
    set((state) => ({
      account: user
        ? {
            ...user,
            user_id: user.user_info.user.id,
            branch_id: user.user_info.branch.branch.id,
          }
        : null,
    })),
  branch: null,
  setBranch: (branch) => set(() => ({ branch })),
  // used during app connection approval
  connection: null,
  setConnection: (user) => set((state) => ({ connection: user })),
}));
