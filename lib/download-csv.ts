import { ApiError, apiClient } from "@/lib/api-client";

export function filenameFromContentDisposition(
  header: string | undefined,
  fallback: string
): string {
  if (!header) return fallback;

  const match =
    /filename\*=UTF-8''([^;\s]+)|filename="([^"]+)"|filename=([^;\s]+)/i.exec(
      header
    );
  const raw = match?.[1] ?? match?.[2] ?? match?.[3];
  if (!raw) return fallback;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function parseBlobError(blob: Blob, status?: number): Promise<never> {
  const text = await blob.text();
  try {
    const json = JSON.parse(text) as { message?: string };
    throw new ApiError({
      message: json.message ?? "CSV export failed",
      status
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError({
      message: text.trim() || "CSV export failed",
      status
    });
  }
}

export async function fetchCsvExport(
  path: string,
  fallbackFilename: string
): Promise<void> {
  const res = await apiClient.get(path, { responseType: "blob" });
  const blob = res.data as Blob;

  if (blob.type.includes("json") || blob.type.includes("text/html")) {
    await parseBlobError(blob, res.status);
  }

  if (blob.size === 0) {
    throw new ApiError({
      message: "CSV export returned an empty file",
      status: res.status
    });
  }

  const filename = filenameFromContentDisposition(
    res.headers["content-disposition"] as string | undefined,
    fallbackFilename
  );
  triggerBrowserDownload(blob, filename);
}
