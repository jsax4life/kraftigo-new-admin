"use client";

import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { adminBookingColumns } from "@/components/tables/admin-booking-columns";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useAdminBookings, useAdminOpenBookings } from "@/hooks/useAdminBookings";
import { canTriggerBookingExpireOverdueSweep } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { bookingsAdminService } from "@/services/bookings-admin.service";
import type { ExpireOverdueSweepResult } from "@/types/bookings-admin";

const PAGE_SIZE = 25;

function SummaryCard({ result }: { result: ExpireOverdueSweepResult }) {
  const rows: { label: string; value: string }[] = [
    { label: "Scanned", value: String(result.scanned) },
    { label: "Expired", value: String(result.expired) },
    { label: "Cutoff (ISO)", value: result.cutoffIso },
    { label: "Grace hours", value: String(result.graceHours) },
    { label: "Batch size", value: String(result.batchSize) }
  ];
  return (
    <div className="mt-4 max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Last run result
      </h3>
      <dl className="space-y-2 text-xs">
        {rows.map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between gap-4 border-b border-slate-800/80 py-1.5 last:border-0"
          >
            <dt className="text-slate-500">{label}</dt>
            <dd className="font-mono text-right text-slate-100">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
      <div className="divide-y divide-slate-900">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 px-3 py-2">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-800/80" />
            <div className="h-3 w-32 animate-pulse rounded bg-slate-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const { user } = useAuth();
  const canRunSweep = canTriggerBookingExpireOverdueSweep(user);
  const [lastResult, setLastResult] = useState<ExpireOverdueSweepResult | null>(
    null
  );

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [artisanId, setArtisanId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: statusFilter.trim() || undefined,
      customerId: customerId.trim() || undefined,
      artisanId: artisanId.trim() || undefined,
      categoryId: categoryId.trim() || undefined
    }),
    [page, statusFilter, customerId, artisanId, categoryId]
  );

  const openBookings = useAdminOpenBookings({ limit: PAGE_SIZE });
  const allBookings = useAdminBookings(listParams);

  const expireMutation = useMutation({
    mutationFn: () => bookingsAdminService.runExpireOverdueSweep(),
    onSuccess: (data) => {
      setLastResult(data);
    }
  });

  function applyFilters() {
    setPage(1);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold">Bookings</h1>
        <p className="text-sm text-slate-400">
          Open queue and full booking list from the admin API.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-100">Open bookings</h2>
        {openBookings.isLoading && <TableSkeleton />}
        {openBookings.isError && (
          <p className="text-xs text-rose-300">
            {openBookings.error?.message ?? "Failed to load open bookings"}
          </p>
        )}
        {!openBookings.isLoading && !openBookings.isError && (
          <>
            {!openBookings.data?.items.length ? (
              <p className="text-xs text-slate-400">No open bookings.</p>
            ) : (
              <DataTable
                columns={adminBookingColumns}
                data={openBookings.data.items}
              />
            )}
          </>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-slate-100">All bookings</h2>
        <div className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Status
            </span>
            <input
              className="h-8 w-36 rounded-md border border-slate-700 bg-slate-950 px-2 outline-none focus:border-emerald-400"
              placeholder="e.g. OPEN"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Customer ID
            </span>
            <input
              className="h-8 w-52 rounded-md border border-slate-700 bg-slate-950 px-2 font-mono text-[11px] outline-none focus:border-emerald-400"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Krafter ID
            </span>
            <input
              className="h-8 w-52 rounded-md border border-slate-700 bg-slate-950 px-2 font-mono text-[11px] outline-none focus:border-emerald-400"
              value={artisanId}
              onChange={(e) => setArtisanId(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">
              Category ID
            </span>
            <input
              className="h-8 w-52 rounded-md border border-slate-700 bg-slate-950 px-2 font-mono text-[11px] outline-none focus:border-emerald-400"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            />
          </label>
          <button
            type="button"
            onClick={applyFilters}
            className="h-8 rounded-md border border-slate-700 bg-slate-950 px-3 hover:border-emerald-400"
          >
            Apply
          </button>
        </div>

        {allBookings.isLoading && <TableSkeleton />}
        {allBookings.isError && (
          <p className="text-xs text-rose-300">
            {allBookings.error?.message ?? "Failed to load bookings"}
          </p>
        )}
        {!allBookings.isLoading && !allBookings.isError && (
          <>
            {!allBookings.data?.items.length ? (
              <p className="text-xs text-slate-400">No bookings match filters.</p>
            ) : (
              <>
                <DataTable
                  columns={adminBookingColumns}
                  data={allBookings.data.items}
                />
                <PaginationBar
                  page={page}
                  meta={allBookings.data.meta}
                  onPageChange={setPage}
                  isLoading={allBookings.isFetching}
                />
              </>
            )}
          </>
        )}
      </section>

      <section className="max-w-lg rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-medium text-slate-100">
          Expire overdue bookings
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Runs the same logic as the scheduled expiry sweep immediately.
        </p>

        {canRunSweep ? (
          <>
            <button
              type="button"
              onClick={() => expireMutation.mutate()}
              disabled={expireMutation.isPending}
              className="mt-4 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {expireMutation.isPending ? "Running sweep…" : "Run expiry sweep now"}
            </button>
            {expireMutation.isError && (
              <p className="mt-3 text-xs text-rose-300">
                {expireMutation.error instanceof Error
                  ? expireMutation.error.message
                  : "Request failed"}
              </p>
            )}
            {lastResult && <SummaryCard result={lastResult} />}
          </>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Only users with the Admin or Super Admin role can trigger this
            action.
          </p>
        )}
      </section>
    </div>
  );
}
