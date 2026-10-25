"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginatedMeta } from "@/lib/admin-api";

export type PaginationBarProps = {
  page: number;
  totalPages?: number;
  total?: number;
  pageSize?: number;
  meta?: PaginatedMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  itemLabel?: string;
  className?: string;
  showItemCount?: boolean;
};

export function PaginationBar({
  page,
  totalPages: propTotalPages,
  total: propTotal,
  pageSize: propPageSize,
  meta,
  onPageChange,
  isLoading = false,
  itemLabel = "",
  className = "",
  showItemCount = true
}: PaginationBarProps) {
  const limit = propPageSize ?? meta?.limit ?? 10;
  const total = propTotal ?? meta?.total ?? 0;
  const totalPages = Math.max(
    1,
    propTotalPages ??
      meta?.totalPages ??
      (total > 0 ? Math.ceil(total / limit) : 1)
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = total === 0 ? 0 : Math.min(page * limit, total);

  // Generate page numbers with smart ellipsis windowing
  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (page >= totalPages - 3) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  }, [page, totalPages]);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-[#0000001A] bg-[#F8F9FA] px-6 py-3.5 text-xs select-none ${className}`}
    >
      {showItemCount && (
        <div className="font-semibold text-black text-[12px]">
          Showing {from}–{to} of {total.toLocaleString()}{" "}
          {itemLabel ? itemLabel : ""}
        </div>
      )}

      <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev || isLoading}
          className="flex h-7 w-8 sm:w-9 items-center justify-center rounded-lg border border-[#0000001A] bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
          aria-label="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {pageItems.map((item, idx) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-1 text-slate-400 font-bold select-none text-[12px]"
              >
                …
              </span>
            );
          }

          const pageNum = Number(item);
          const isActive = page === pageNum;

          return (
            <button
              key={pageNum}
              type="button"
              onClick={() => onPageChange(pageNum)}
              disabled={isLoading}
              className={`flex h-7 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-semibold transition-colors shadow-xs ${
                isActive
                  ? "bg-[#FF6600] text-white border border-[#FF6600]"
                  : "border border-[#0000001A] bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext || isLoading}
          className="flex h-7 w-8 sm:w-9 items-center justify-center rounded-lg border border-[#0000001A] bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-xs"
          aria-label="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export const AppPagination = PaginationBar;
