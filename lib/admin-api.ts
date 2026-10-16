import type { z } from "zod";

export type PaginatedMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginatedMeta;
};

export function unwrapListPayload(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.items)) return o.items;
    if (Array.isArray(o.results)) return o.results;
    if (Array.isArray(o.locations)) return o.locations;
  }
  return [];
}

export function unwrapEntityPayload(data: unknown): unknown {
  if (data && typeof data === "object" && "data" in data) {
    const inner = (data as { data: unknown }).data;
    if (inner !== undefined && inner !== null) return inner;
  }
  return data;
}

function extractMeta(raw: unknown, rowCount: number): PaginatedMeta {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { total: rowCount };
  }

  const o = raw as Record<string, unknown>;
  const nested =
    o.meta && typeof o.meta === "object"
      ? (o.meta as Record<string, unknown>)
      : o;

  const meta: PaginatedMeta = {};

  if (nested.page != null) meta.page = Number(nested.page);
  if (nested.limit != null) meta.limit = Number(nested.limit);
  if (nested.total != null) meta.total = Number(nested.total);
  if (nested.totalPages != null) meta.totalPages = Number(nested.totalPages);

  if (meta.total == null && rowCount > 0) meta.total = rowCount;

  if (
    meta.totalPages == null &&
    meta.total != null &&
    meta.limit != null &&
    meta.limit > 0
  ) {
    meta.totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));
  }

  return meta;
}

export function parsePaginatedResponse<T>(
  itemSchema: z.ZodType<T>,
  data: unknown,
  label: string
): PaginatedResult<T> {
  const rows = unwrapListPayload(data);
  const meta = extractMeta(data, rows.length);

  const items: T[] = [];
  rows.forEach((row, index) => {
    const parsed = itemSchema.safeParse(row);
    if (!parsed.success) {
      console.error(`${label} row ${index} validation error`, parsed.error);
      throw new Error(`Unexpected ${label} list response shape`);
    }
    items.push(parsed.data);
  });

  return { items, meta };
}

export function parseEntityResponse<T>(
  itemSchema: z.ZodType<T>,
  data: unknown,
  label: string
): T {
  const raw = unwrapEntityPayload(data);
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) {
    console.error(`${label} validation error`, parsed.error);
    throw new Error(`Unexpected ${label} response shape`);
  }
  return parsed.data;
}
