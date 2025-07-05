import axios from "axios";
import { catchReqError } from "./utils";
import { APPLICATION_LINK } from "../constants";

export const testApi = async () => {
  try {
    const { data } = await axios.get<unknown>(
      `https://antares-theta.vercel.app/api/desktop`,
      {
        timeout: 10000, // 10 seconds
      }
    );
    console.log({ data });
    return data;
  } catch (error: unknown) {
    catchReqError(error);
  }
};
