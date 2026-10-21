"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
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
import { useRestrictedUsersSummary } from "@/hooks/useRestrictedUsers";
import { usersAdminService } from "@/services/users-admin.service";

type KrafterTab = "all" | "intent";

const PAGE_SIZE = 20;

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="divide-y divide-slate-100">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="flex gap-3 px-4 py-3">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
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
  const totalCount = activeQuery.data?.meta?.total;

  const {
    data: restrictedSummary,
    isLoading: isRestrictedSummaryLoading
  } = useRestrictedUsersSummary();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Krafter Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            {tab === "intent"
              ? "Krafters who started onboarding — review gaps, location, and send profile reminders."
              : "Oversee and manage all artisan accounts and verification status."}
          </p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#F6F6F6] rounded-2xl p-5 border border-[#0000001A] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Krafters</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <span className="text-[22px] font-mabry font-extrabold text-black">
            {totalCount != null ? totalCount.toLocaleString() : "…"}
          </span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-5 border border-[#0000001A] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Completion Rate</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <span className="text-[22px] font-mabry font-extrabold text-black">94%</span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-5 border border-[#0000001A] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Users</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <span className="text-[22px] font-mabry font-extrabold text-black">1,284</span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-5 border border-[#0000001A] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Probation Alerts</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <span className="text-[22px] font-mabry font-extrabold text-black">29</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
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
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            tab === "all"
              ? "bg-[#FF6600] text-white"
              : "bg-[#F6F6F6] text-slate-700 hover:bg-slate-200"
          }`}
        >
          All Krafters
        </Link>
        <Link
          href="/admin/krafters?tab=intent"
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            tab === "intent"
              ? "bg-[#FF6600] text-white"
              : "bg-[#F6F6F6] text-slate-700 hover:bg-slate-200"
          }`}
        >
          Intent Krafters
        </Link>
      </div>

      {tab === "all" ? <KrafterLocationFilter /> : null}

      {/* Content Section */}
      {activeQuery.isLoading && <TableSkeleton />}
      {activeQuery.isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
          Failed to load krafters: {activeQuery.error?.message ?? "Unknown error"}
        </div>
      )}
      {!activeQuery.isLoading && !activeQuery.isError && (
        <>
          {!activeQuery.data?.items.length ? (
            <div className="rounded-xl border border-slate-200 bg-[#F6F6F6] p-8 text-center text-xs text-slate-500">
              {tab === "all" && locationCity
                ? `No krafters found in ${locationCity}${
                    locationCountry ? `, ${locationCountry}` : ""
                  }.`
                : "No krafters found."}
            </div>
          ) : (
            <div className="space-y-4">
              {tab === "intent" ? (
                <IntentKraftersList users={activeQuery.data.items} />
              ) : (
                <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-white shadow-sm">
                  <DataTable
                    columns={adminUserColumns}
                    data={activeQuery.data.items}
                    serverPagination
                  />
                </div>
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

      {/* Work Eligibility CTA */}
      {/* <Link
        href="/admin/work-eligibility"
        className="block rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 transition-all hover:border-[#FF6600]/40"
      >
        <h2 className="text-base font-garet font-bold text-black">
          Work eligibility documents
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Review, approve, or reject work-eligibility uploads from Krafters.
        </p>
        <span className="mt-3 inline-block text-xs font-semibold text-[#FF6600]">
          Open verification queue →
        </span>
      </Link> */}


      {/* Restricted Profiles */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col sm:flex-row items-end justify-between gap-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold">Restricted Profiles</h2>
          <div>
            <p className="text-sm">View all restricted accounts</p>
            <p className="text-sm font-bold">
              {isRestrictedSummaryLoading
                ? "…"
                : `${restrictedSummary?.systemFlagged?.value ?? 0} Accounts Flagged`}
            </p>
          </div>
        </div>
        <Link href="/admin/restricted" className="rounded-lg bg-[#FF6600] px-4 py-3 text-sm font-medium text-white hover:bg-[#E65C00] transition-colors shadow-sm self-start sm:self-end text-center">
          View Restricted List
        </Link>
      </div>

    </div>
  );
}
