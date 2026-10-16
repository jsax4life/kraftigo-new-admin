"use client";

import { useWaitlist } from "@/hooks/useWaitlist";
import { DataTable } from "@/components/tables/data-table";
import { waitlistColumns } from "@/components/tables/waitlist-columns";
import { CsvExportButton } from "@/components/ui/csv-export-button";
import { useTableFilters } from "@/hooks/useTableFilters";
import { waitlistService } from "@/services/waitlist.service";
import type { WaitlistEntry } from "@/types/waitlist";

export default function WaitlistPage() {
  const { data, isLoading, isError, error } = useWaitlist();
  const { search, setSearch, roleFilter, setRoleFilter, contactFilter, setContactFilter, applyFilters } =
    useTableFilters();

  const filtered: WaitlistEntry[] = applyFilters(data ?? []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-garet font-bold">Waitlist</h1>
          <p className="text-sm mt-1 text-slate-600">
            Live view of users who joined the Kraftigo waitlist.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {data && (
            <span className="rounded-full bg-[#F6F6F6] border border-[#0000001A] px-4 py-1.5 text-xs text-slate-700 font-medium shadow-sm">
              Total signups: <span className="font-bold text-slate-900">{data.length}</span>
            </span>
          )}
          <CsvExportButton
            label="Export waitlist CSV"
            onExport={() => waitlistService.exportCsv()}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs shadow-sm">
        <input
          className="h-9 w-full sm:w-64 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-[#FF6600] transition-colors"
          placeholder="Search name, email, city, interest…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#FF6600] transition-colors"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
        >
          <option value="ALL">All roles</option>
          <option value="ARTISAN">Krafters</option>
          <option value="CUSTOMER">Customers</option>
          <option value="BOTH">Both</option>
        </select>
        <select
          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs outline-none focus:border-[#FF6600] transition-colors"
          value={contactFilter}
          onChange={(e) =>
            setContactFilter(e.target.value as typeof contactFilter)
          }
        >
          <option value="ALL">Contact preference</option>
          <option value="YES">Can contact</option>
          <option value="NO">Do not contact</option>
        </select>
      </div>

      {isLoading && (
        <div className="overflow-hidden rounded-2xl border border-[#0000001A] bg-[#F6F6F6] shadow-sm">
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 px-6 py-4 text-xs"
              >
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      )}
      {isError && (
        <p className="text-xs text-red-500 font-medium">
          Failed to load waitlist: {error?.message || "Unknown error"}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {!data?.length ? (
            <p className="text-sm text-slate-500">
              No one is currently on the waitlist. Once users sign up, they
              will appear here for review.
            </p>
          ) : (
            <DataTable columns={waitlistColumns} data={filtered} />
          )}
        </>
      )}
    </div>
  );
}

