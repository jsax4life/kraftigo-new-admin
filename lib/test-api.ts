import { apiClient, getApiBaseUrl } from "@/lib/api-client";

export type TestApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  params?: Record<string, unknown>;
  data?: unknown;
};

export type TestApiResponse<T = unknown> = {
  success: boolean;
  status?: number;
  url: string;
  durationMs: number;
  data?: T;
  error?: unknown;
};

/**
 * Utility to test any backend API endpoint.
 * - Automatically attaches authentication from localStorage
 * - Uses the active base URL (test or prod)
 * - Logs timing, full URL, and formatted response
 *
 * Example usage:
 *   const res = await testApi("/api/admin/overview/bookings/live", { params: { limit: 5 } });
 */
export async function testApi<T = unknown>(
  endpoint: string,
  options: TestApiOptions = {}
): Promise<TestApiResponse<T>> {
  const method = options.method ?? "GET";
  const baseUrl = getApiBaseUrl();
  const fullUrl = `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;

  console.group(`🧪 [testApi] ${method} ${endpoint}`);
  console.log("Base URL:", baseUrl);
  console.log("Full URL:", fullUrl);
  if (options.params) console.log("Query Params:", options.params);
  if (options.data) console.log("Request Body:", options.data);

  const start = performance.now();

  try {
    const res = await apiClient.request<T>({
      url: endpoint,
      method,
      params: options.params,
      data: options.data
    });

    const durationMs = Math.round(performance.now() - start);

    console.log(`✅ Status: ${res.status} (${durationMs}ms)`);
    console.log("Response Data:", res.data);
    console.groupEnd();

    return {
      success: true,
      status: res.status,
      url: fullUrl,
      durationMs,
      data: res.data
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - start);
    const status = err?.status ?? err?.response?.status;
    const message = err?.message ?? "Request failed";
    const details = err?.details ?? err?.response?.data;

    console.error(`❌ Failed: Status ${status ?? "N/A"} (${durationMs}ms)`);
    console.error("Message:", message);
    if (details) console.error("Error Details:", details);
    console.groupEnd();

    return {
      success: false,
      status,
      url: fullUrl,
      durationMs,
      error: { message, status, details }
    };
  }
}

// Automatically expose on window in development so you can test endpoints directly from the browser console!
if (typeof window !== "undefined") {
  (window as unknown as { testApi: typeof testApi }).testApi = testApi;
}
