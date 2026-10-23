"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Info, Search, ChevronLeft, ChevronRight, Loader2, Star, ShieldCheck } from "lucide-react";
import {
  useKrafterSummary,
  useTopKrafters,
  useKrafterDirectory,
  useKrafterRestrictedSummary,
  useKrafterVerificationQueue
} from "@/hooks/useKrafters";
import { kraftersService } from "@/services/krafters.service";
import type { KrafterPeriod, TopKrafterItem } from "@/types/krafters";

const PAGE_SIZE = 10;

const PERIOD_OPTIONS: { label: string; value: KrafterPeriod }[] = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "All Time", value: "all_time" }
];

const fallbackTopKrafters: TopKrafterItem[] = [
  {
    id: "1",
    name: "Natalie Gates",
    primaryTrade: "Electrician",
    location: "Frankfurt, Germany",
    earnings: "£34,345.00",
    rating: 4.9,
    completedKrafts: 72,
    avatarUrl: "/images/login.jpg"
  },
  {
    id: "2",
    name: "Alex Morgan",
    primaryTrade: "Plumber",
    location: "Berlin, Germany",
    earnings: "£28,920.00",
    rating: 4.8,
    completedKrafts: 64,
    avatarUrl: "/images/login.jpg"
  },
  {
    id: "3",
    name: "David Adeleke",
    primaryTrade: "Cleaner",
    location: "Lagos, Nigeria",
    earnings: "£21,450.00",
    rating: 5.0,
    completedKrafts: 88,
    avatarUrl: "/images/login.jpg"
  }
];

export default function KraftersPageContent() {
  const [period, setPeriod] = useState<KrafterPeriod>("this_month");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "verified" | "restricted">("all");
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Headline KPI Summary
  const { data: summaryData, isLoading: isSummaryLoading } = useKrafterSummary(period);

  // Top Krafters Hero Row
  const { data: topKraftersData } = useTopKrafters(3);

  // Verification Queue (for pending count indicator)
  const { data: queueData } = useKrafterVerificationQueue();

  // Paginated Krafter Directory
  const {
    data: directoryData,
    isLoading: isDirectoryLoading,
    isError,
    error,
    isFetching
  } = useKrafterDirectory({
    period,
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    status: statusFilter
  });

  // Dedicated Restricted Summary
  const { data: restrictedSummary, isLoading: isRestrictedLoading } =
    useKrafterRestrictedSummary();

  const handleExportDirectory = async () => {
    try {
      setIsExporting(true);
      await kraftersService.exportDirectory({
        period,
        search: debouncedSearch,
        status: statusFilter
      });
    } catch (err) {
      console.error("Failed to export directory:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await kraftersService.exportReport(period);
    } catch (err) {
      console.error("Failed to export report:", err);
    }
  };

  const kraftersList = directoryData?.data ?? [];
  const totalCount = directoryData?.total ?? 0;
  const totalPages =
    directoryData?.totalPages ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const metrics = summaryData?.metrics;

  const topKrafters =
    topKraftersData && topKraftersData.length > 0
      ? topKraftersData
      : fallbackTopKrafters;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black mt-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Krafter Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            Oversee and manage platform artisan accounts, credentials, and performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Export Report <Image src="/export.svg" alt="Export" width={16} height={16} />
          </button>
          <Link
            href="/admin/work-eligibility"
            className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            <ShieldCheck className="h-4 w-4" />
            Verification Queue {queueData?.totalPendingLabel ? `(${queueData.totalPendingLabel})` : ""}
          </Link>
        </div>
      </div>

      {/* Headline Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Krafters */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Krafters</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.totalKrafters?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {metrics?.totalKrafters?.changePercent != null
              ? `+${metrics.totalKrafters.changePercent}% vs last period`
              : summaryData?.range?.label ?? "Selected window"}
          </div>
        </div>

        {/* Completion Rate */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Completion Rate</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : `${metrics?.completionRate?.value ?? 0}%`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate" title={metrics?.completionRate?.definition ?? "Completed jobs share"}>
            {metrics?.completionRate?.definition ?? "Share of assigned bookings completed"}
          </div>
        </div>

        {/* Active Krafters */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Krafters</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.activeKrafters?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate" title={metrics?.activeKrafters?.definition ?? "Krafters with booking activity"}>
            {metrics?.activeKrafters?.definition ?? "Krafters with booking activity in window"}
          </div>
        </div>

        {/* Probation Alerts */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Probation Alerts</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.probationAlerts?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {metrics?.probationAlerts?.definition ?? "Profiles with HIGH risk or active suspension"}
          </div>
        </div>
      </div>

      {/* Top Performing Krafters Hero Row */}
      <div>
        <h2 className="mb-4 text-xl font-garet font-[850] text-black">Top Performing Krafters</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {topKrafters.map((krafter, idx) => {
            const earningsDisplay =
              typeof krafter.totalEarnings === "object" && krafter.totalEarnings !== null
                ? krafter.totalEarnings.formatted || `£${krafter.totalEarnings.value.toLocaleString()}`
                : typeof krafter.earnings === "string"
                ? krafter.earnings
                : typeof krafter.totalEarnings === "number"
                ? `£${krafter.totalEarnings.toLocaleString()}`
                : "£0.00";

            const locationDisplay = krafter.location || krafter.city || krafter.country || "—";
            const krafterName = krafter.displayName || krafter.name;
            const targetUrl = krafter.viewPath || (krafter.id ? `/admin/krafters/${krafter.id}` : null);

            const CardContent = (
              <div className="flex items-center gap-4 rounded-xl bg-[#0000FF33] p-5 hover:bg-[#0000FF40] transition-colors cursor-pointer">
                <Image
                  src={krafter.profilePhotoUrl || krafter.avatarUrl || "/images/login.jpg"}
                  alt={krafterName}
                  height={60}
                  width={60}
                  className="rounded-full w-14 h-14 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[13px] font-bold text-black truncate">{krafterName}</div>
                    {krafter.rating != null && (
                      <span className="flex items-center text-[11px] font-bold text-[#FF6600]">
                        <Star className="h-3 w-3 fill-[#FF6600] inline mr-0.5" />
                        {krafter.rating}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#000000CC] truncate">
                    {krafter.primaryTrade || krafter.category || "General Artisan"} • {locationDisplay}
                  </div>
                  <div className="text-[13px] font-extrabold text-black mt-1">
                    {earningsDisplay}
                  </div>
                </div>
              </div>
            );

            return targetUrl ? (
              <Link key={krafter.id ?? idx} href={targetUrl}>
                {CardContent}
              </Link>
            ) : (
              <div key={krafter.id ?? idx}>{CardContent}</div>
            );
          })}
        </div>
      </div>

      {/* Krafter Directory Table */}
      <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-garet font-[850] text-black">Krafters Directory</h2>
            <div className="inline-flex rounded-lg bg-white p-1 border border-slate-200 text-xs">
              {(["all", "verified", "restricted"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors capitalize ${
                    statusFilter === st
                      ? "bg-[#FF6600] text-white"
                      : "text-slate-600 hover:text-black"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportDirectory}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-black hover:opacity-80 disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  Exporting <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                </>
              ) : (
                <>
                  Export <Image src="/export.svg" alt="Export" width={16} height={16} />
                </>
              )}
            </button>

            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as KrafterPeriod);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-[#F9F9F9] px-2.5 py-1 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <div className="relative flex items-center ml-2">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, trade, email, or UUID"
                className="w-80 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {isDirectoryLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading Krafters directory…</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">
            Failed to load Krafters: {error?.message ?? "Unknown error"}
          </div>
        ) : kraftersList.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No Krafters found matching current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Krafter</th>
                  <th className="px-6 py-4 font-medium">Trade / Skill</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Rating & Jobs</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {kraftersList.map((krafter, index) => {
                  const locationText = krafter.location || krafter.city || krafter.country || "—";
                  const lastActiveText = krafter.lastActive
                    ? new Date(krafter.lastActive).toLocaleDateString()
                    : "—";
                  const krafterName = krafter.displayName || krafter.name;

                  return (
                    <tr
                      key={krafter.id}
                      className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                    >
                      <td className="px-6 py-4 font-medium text-black">
                        <div className="flex items-center gap-3">
                          <Image
                            src={krafter.profilePhotoUrl || "/images/login.jpg"}
                            alt={krafterName}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover bg-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-semibold block">{krafterName}</span>
                            {krafter.displayUserId && (
                              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                                {krafter.displayUserId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black font-medium">
                        {krafter.primaryTrade || krafter.category || krafter.trade || "General"}
                      </td>
                      <td className="px-6 py-4 text-black">{locationText}</td>
                      <td className="px-6 py-4 text-black">
                        <span className="font-semibold">
                          {krafter.completedKrafts ?? 0} jobs
                        </span>
                        {krafter.rating != null && (
                          <span className="text-slate-600 ml-1.5">
                            • ★ {krafter.rating}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-black">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            krafter.status === "ACTIVE" || krafter.verificationStatus === "VERIFIED"
                              ? "bg-emerald-100 text-emerald-800"
                              : krafter.status === "RESTRICTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {krafter.status ?? "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-black">{lastActiveText}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={krafter.viewPath || `/admin/krafters/${krafter.id}`}
                          className="font-bold text-[12px] text-[#FF6600] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-[11px]">
          <div className="font-bold text-black">
            Showing {kraftersList.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
            {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = page === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={isFetching}
                  className={`flex h-6 w-8 sm:w-12 items-center justify-center rounded font-medium transition-colors ${
                    isActive
                      ? "bg-[#FF6600] text-white"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1 || isFetching}
              className="flex h-6 w-8 sm:w-12 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
              disabled={page >= totalPages || isFetching}
              className="flex h-6 w-8 sm:w-12 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Restricted Profiles Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-end justify-between gap-4 shadow-sm">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-garet font-[850] text-black">Restricted Profiles</h2>
          <div>
            <p className="text-[13px] text-slate-700 font-medium">
              {restrictedSummary?.definition || "View all restricted artisan accounts"}
            </p>
            <div className="text-[14px] font-extrabold text-black">
              {isRestrictedLoading
                ? "…"
                : `${restrictedSummary?.flaggedCount ?? summaryData?.restrictedProfiles?.flaggedCount ?? 0} Accounts Flagged`}
            </div>
          </div>
        </div>
        <Link
          href={
            restrictedSummary?.listPath ||
            summaryData?.restrictedProfiles?.listPath ||
            "/admin/restricted-users"
          }
          className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors"
        >
          View Restricted List
        </Link>
      </div>
    </div>
  );
}
