import { axiosInstance } from "./axios-instance";
import { catchReqError } from "./utils";
import { DeviceConnection } from "@/types/auth.types";

export const connectToApp = async (data: { email: string; code: string }) => {
  try {
    const userContent = await axiosInstance.post<DeviceConnection>(
      `/connect`,
      data,
    );
    return userContent;
  } catch (error: unknown) {
    catchReqError(error);
  }
};
