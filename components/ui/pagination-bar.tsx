"use client";

import type { PaginatedMeta } from "@/lib/admin-api";

type PaginationBarProps = {
  page: number;
  meta: PaginatedMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
};

export function PaginationBar({
  page,
  meta,
  onPageChange,
  isLoading = false
}: PaginationBarProps) {
  const limit = meta.limit ?? 25;
  const total = meta.total;
  const totalPages =
    meta.totalPages ??
    (total != null ? Math.max(1, Math.ceil(total / limit)) : undefined);

  const canPrev = page > 1;
  const canNext = totalPages != null ? page < totalPages : false;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
      <span>
        Page <strong>{page}</strong>
        {totalPages != null ? (
          <>
            {" "}
            of <strong>{totalPages}</strong>
          </>
        ) : null}
        {total != null ? (
          <span className="text-slate-500"> · {total} total</span>
        ) : null}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canPrev || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={!canNext || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
