import type { WorkEligibilitySubmission } from "@/types/work-eligibility";
import { getApiBaseUrl } from "@/lib/api-client";

export function getKrafterLabel(sub: WorkEligibilitySubmission): string {
  const nested = sub.krafter ?? sub.user;
  if (nested && typeof nested === "object") {
    const o = nested as Record<string, unknown>;
    const email = typeof o.email === "string" ? o.email : null;
    const full = typeof o.fullName === "string" ? o.fullName : null;
    const first = typeof o.firstName === "string" ? o.firstName : "";
    const last = typeof o.lastName === "string" ? o.lastName : "";
    const composed = `${first} ${last}`.trim();
    const name = full || composed || null;
    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
  }
  return sub.userId ?? "—";
}

export function getDocumentHref(sub: WorkEligibilitySubmission): string | null {
  const extra = sub as Record<string, unknown>;
  const file = extra.file;
  const fromFile =
    typeof file === "object" &&
    file &&
    "url" in file &&
    typeof (file as { url?: string }).url === "string"
      ? (file as { url: string }).url
      : undefined;

  const direct = sub.documentUrl ?? sub.fileUrl ?? sub.url ?? fromFile;

  if (direct && /^https?:\/\//i.test(direct)) return direct;

  const base =
    typeof process !== "undefined"
      ? getApiBaseUrl()
      : "";
  if (direct && base) {
    const path = direct.startsWith("/") ? direct : `/${direct}`;
    return `${base.replace(/\/$/, "")}${path}`;
  }
  return direct ?? null;
}
