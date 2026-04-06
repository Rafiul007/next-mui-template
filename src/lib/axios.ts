import axios from "axios";
import { env } from "@/config/env";

export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const headers = config.headers ?? {};

  headers.Accept = headers.Accept ?? "application/json";

  return {
    ...config,
    headers,
  };
});

export const setAxiosAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axiosInstance.defaults.headers.common.Authorization;
};

export default axiosInstance;
