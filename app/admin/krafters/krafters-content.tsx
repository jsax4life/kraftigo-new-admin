"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/tables/data-table";
import { adminUserColumns } from "@/components/tables/admin-user-columns";
import { IntentKraftersList } from "@/components/krafters/intent-krafters-list";
import { KrafterLocationFilter } from "@/components/krafters/krafter-location-filter";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { CsvExportButton } from "@/components/ui/csv-export-button";
import {
  useAdminIntentKrafters,
  useAdminKrafters
} from "@/hooks/useAdminKrafters";
import { usersAdminService } from "@/services/users-admin.service";

type KrafterTab = "all" | "intent";

const PAGE_SIZE = 20;

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
      <div className="divide-y divide-slate-900">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 px-3 py-2">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-800/80" />
            <div className="h-3 w-40 animate-pulse rounded bg-slate-800/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KraftersPageContent() {
  const searchParams = useSearchParams();
  const tab: KrafterTab =
    searchParams.get("tab") === "intent" ? "intent" : "all";

  const locationCity = searchParams.get("locationCity") ?? undefined;
  const locationCountry = searchParams.get("locationCountry") ?? undefined;

  const [allPage, setAllPage] = useState(1);
  const [intentPage, setIntentPage] = useState(1);

  useEffect(() => {
    setAllPage(1);
  }, [locationCity, locationCountry]);

  const page = tab === "intent" ? intentPage : allPage;
  const setPage = tab === "intent" ? setIntentPage : setAllPage;

  const listParams = {
    page,
    limit: PAGE_SIZE,
    ...(tab === "all" && locationCity
      ? {
          locationCity,
          ...(locationCountry ? { locationCountry } : {})
        }
      : {})
  };

  const krafters = useAdminKrafters(listParams, tab === "all");
  const intentKrafters = useAdminIntentKrafters(
    listParams,
    tab === "intent"
  );

  const activeQuery = tab === "intent" ? intentKrafters : krafters;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Krafters</h1>
          <p className="text-sm text-slate-400">
            {tab === "intent" ? (
              <>
                Krafters who started onboarding — review gaps, location, and send
                profile reminders.
              </>
            ) : (
              <>
                Artisan accounts from{" "}
                <code className="text-[11px]">/api/admin/users/krafters</code>{" "}
                with location and profiles from{" "}
                <code className="text-[11px]">
                  /api/admin/profiles/artisans
                </code>
                .
              </>
            )}
          </p>
        </div>
        <CsvExportButton
          label={
            tab === "intent"
              ? "Export intent krafters CSV"
              : "Export krafters CSV"
          }
          onExport={() =>
            tab === "intent"
              ? usersAdminService.exportIntentKraftersCsv()
              : usersAdminService.exportKraftersCsv()
          }
          disabled={activeQuery.isLoading}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Link
          href={
            locationCity
              ? `/admin/krafters?locationCity=${encodeURIComponent(locationCity)}${
                  locationCountry
                    ? `&locationCountry=${encodeURIComponent(locationCountry)}`
                    : ""
                }`
              : "/admin/krafters"
          }
          className={`rounded-full px-3 py-1.5 ${
            tab === "all"
              ? "bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950"
              : "border border-slate-700 text-slate-300 hover:border-emerald-400"
          }`}
        >
          All Krafters
        </Link>
        <Link
          href="/admin/krafters?tab=intent"
          className={`rounded-full px-3 py-1.5 ${
            tab === "intent"
              ? "bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950"
              : "border border-slate-700 text-slate-300 hover:border-emerald-400"
          }`}
        >
          Intent Krafters
        </Link>
      </div>

      {tab === "all" ? <KrafterLocationFilter /> : null}

      {activeQuery.isLoading && <TableSkeleton />}
      {activeQuery.isError && (
        <p className="text-xs text-rose-300">
          Failed to load krafters:{" "}
          {activeQuery.error?.message ?? "Unknown error"}
        </p>
      )}
      {!activeQuery.isLoading && !activeQuery.isError && (
        <>
          {!activeQuery.data?.items.length ? (
            <p className="text-xs text-slate-400">
              {tab === "all" && locationCity
                ? `No krafters found in ${locationCity}${
                    locationCountry ? `, ${locationCountry}` : ""
                  }.`
                : "No krafters found."}
            </p>
          ) : (
            <div className="space-y-2">
              {tab === "intent" ? (
                <IntentKraftersList users={activeQuery.data.items} />
              ) : (
                <DataTable
                  columns={adminUserColumns}
                  data={activeQuery.data.items}
                  serverPagination
                />
              )}
              <PaginationBar
                page={page}
                meta={{
                  ...activeQuery.data.meta,
                  limit: activeQuery.data.meta.limit ?? PAGE_SIZE
                }}
                onPageChange={setPage}
                isLoading={activeQuery.isFetching}
              />
            </div>
          )}
        </>
      )}

      <Link
        href="/admin/work-eligibility"
        className="block max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-emerald-500/40 hover:bg-slate-900"
      >
        <h2 className="text-sm font-medium text-slate-100">
          Work eligibility documents
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Review, approve, or reject work-eligibility uploads from Krafters.
        </p>
        <span className="mt-2 inline-block text-xs text-emerald-400">
          Open queue →
        </span>
      </Link>
    </div>
  );
}
