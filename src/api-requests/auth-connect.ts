import axios from "axios";
import { catchReqError } from "./utils";
import { API_URL } from "./constants";
import { DeviceConnection } from "@/types/auth.types";

export const connectToApp = async (data: { email: string; code: string }) => {
  try {
    const userContent = await axios.post<DeviceConnection>(
      API_URL + `/connect`,
      data
    );
    return userContent;
  } catch (error: unknown) {
    catchReqError(error);
  }
};
