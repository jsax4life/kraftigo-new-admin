import type { NoShowEvent } from "@/types/disputes-admin";

export function getNoShowEventId(event: NoShowEvent): string | null {
  const raw = event as Record<string, unknown>;
  if (typeof raw.id === "string") return raw.id;
  if (typeof raw.eventId === "string") return raw.eventId;
  return null;
}

export function recordStatus(record: unknown): string {
  if (!record || typeof record !== "object") return "";
  const status = (record as Record<string, unknown>).status;
  return typeof status === "string" ? status.toUpperCase() : "";
}

export function recordId(record: unknown): string | null {
  if (!record || typeof record !== "object") return null;
  const id = (record as Record<string, unknown>).id;
  return typeof id === "string" ? id : null;
}
