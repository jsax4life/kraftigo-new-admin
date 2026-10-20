import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse
} from "axios";

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

// Retrieve accessToken from localStorage (set by authService.login)
function getClientToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("kraftigo_access_token");
  } catch {
    return null;
  }
}

instance.interceptors.request.use((config) => {
  const token = getClientToken();
  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const code =
      (error.response?.data as { code?: string } | undefined)?.code ??
      error.code;
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      "Unexpected API error";

    const apiError = new ApiError({
      message,
      status,
      code,
      details: error.response?.data
    });

    return Promise.reject(apiError);
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

