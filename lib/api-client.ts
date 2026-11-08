import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthStorage
} from "@/lib/token-storage";
import { RefreshResponseSchema } from "@/types/auth";

export type ApiErrorShape = {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
};

export class ApiError extends Error implements ApiErrorShape {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(payload: ApiErrorShape) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export function getApiBaseUrl(): string {
  if (
    process.env.NEXT_PUBLIC_USE_TEST_API === "true" &&
    process.env.NEXT_PUBLIC_API_TEST_URL
  ) {
    return process.env.NEXT_PUBLIC_API_TEST_URL;
  }
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.xn--kraftig-g1a.com"
  );
}

const baseURL = getApiBaseUrl();

const instance: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

function formatApiError(error: any): ApiError {
  if (error instanceof ApiError) return error;
  const status = error?.response?.status ?? error?.status;
  const code =
    (error?.response?.data as { code?: string } | undefined)?.code ??
    error?.code;
  const message =
    (error?.response?.data as { message?: string } | undefined)?.message ??
    error?.message ??
    "Unexpected API error";

  return new ApiError({
    message,
    status,
    code,
    details: error?.response?.data ?? error?.details
  });
}

instance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    if (typeof (config.headers as any).set === "function") {
      (config.headers as any).set("Authorization", `Bearer ${token}`);
    } else if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    const isAuthEndpoint =
      url.includes("/api/auth/login") || url.includes("/api/auth/refresh");

    // If 401 occurs after retry, or on refresh endpoint, session is dead: clear storage and redirect
    if (
      status === 401 &&
      (originalRequest?._retry || url.includes("/api/auth/refresh"))
    ) {
      clearAuthStorage();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      return Promise.reject(formatApiError(error));
    }

    // Intercept 401 Unauthorized for retry with fresh token
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthStorage();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(formatApiError(error));
      }

      if (isRefreshing) {
        return new Promise<AxiosResponse>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                if (typeof (originalRequest.headers as any).set === "function") {
                  (originalRequest.headers as any).set(
                    "Authorization",
                    `Bearer ${token}`
                  );
                } else {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
              }
              resolve(instance(originalRequest));
            },
            reject: (err: unknown) => {
              reject(formatApiError(err));
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          `${baseURL.replace(/\/$/, "")}/api/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
          }
        );

        const parsed = RefreshResponseSchema.safeParse(refreshRes.data);
        if (!parsed.success || !parsed.data.accessToken) {
          throw new Error("Invalid response from refresh token endpoint");
        }

        const newAccessToken = parsed.data.accessToken;
        setAccessToken(newAccessToken);

        if (parsed.data.refreshToken) {
          setRefreshToken(parsed.data.refreshToken);
        }

        processQueue(null, newAccessToken);

        if (originalRequest.headers) {
          if (typeof (originalRequest.headers as any).set === "function") {
            (originalRequest.headers as any).set(
              "Authorization",
              `Bearer ${newAccessToken}`
            );
          } else {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        }
        return instance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthStorage();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(formatApiError(refreshErr));
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(formatApiError(error));
  }
);

export async function apiGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res: AxiosResponse<T> = await instance.get(url, config);
  return res.data;
}

export async function apiPost<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res: AxiosResponse<T> = await instance.post(url, body, config);
  return res.data;
}

export async function apiPut<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res: AxiosResponse<T> = await instance.put(url, body, config);
  return res.data;
}

export async function apiPatch<T = unknown, B = unknown>(
  url: string,
  body?: B,
  config?: AxiosRequestConfig
): Promise<T> {
  const res: AxiosResponse<T> = await instance.patch(url, body, config);
  return res.data;
}

export async function apiDelete<T = unknown>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res: AxiosResponse<T> = await instance.delete(url, config);
  return res.data;
}

export const apiClient = instance;

