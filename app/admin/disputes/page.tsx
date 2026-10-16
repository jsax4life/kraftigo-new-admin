"use client";

import { DataTable } from "@/components/tables/data-table";
import { disputeColumns } from "@/components/tables/dispute-columns";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { useAdminDisputes } from "@/hooks/useAdminDisputes";

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
      <div className="divide-y divide-slate-900">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 px-3 py-2">
            <div className="h-3 w-28 animate-pulse rounded bg-slate-800/80" />
            <div className="h-3 w-20 animate-pulse rounded bg-slate-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DisputesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAdminDisputes();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Disputes</h1>
          <p className="text-sm text-slate-400">
            Review queue from{" "}
            <code className="text-[11px]">GET /api/admin/disputes</code> —
            newest first.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs hover:border-emerald-400"
        >
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <FraudAccessBanner />
      <FraudAccessDenied />

      {isLoading && <TableSkeleton />}
      {isError && (
        <p className="text-xs text-rose-300">
          {error?.message ?? "Failed to load disputes"}
        </p>
      )}
      {!isLoading && !isError && (
        <>
          {!data?.length ? (
            <p className="text-xs text-slate-400">No disputes in the queue.</p>
          ) : (
            <DataTable columns={disputeColumns} data={data} />
          )}
        </>
      )}
    </div>
  );
}
