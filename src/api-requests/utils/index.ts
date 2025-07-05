import { getErrorMessage } from "../../renderer/utils/error";
import axios from "axios";

export const catchReqError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    // resetAuth();

    // TODO: Lock the user out of the application
    return "Not authorized";
  } else {
    throw error;
    // return getErrorMessage(error);
  }
};
