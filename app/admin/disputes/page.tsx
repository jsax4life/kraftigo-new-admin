"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpRight,
  X
} from "lucide-react";
import { useAdminDisputes } from "@/hooks/useAdminDisputes";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { PaginationBar } from "@/components/ui/pagination-bar";
import type { AdminDispute } from "@/types/disputes-admin";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "Under Review / Resolving", value: "RESOLVING" },
  { label: "Resolved", value: "RESOLVED" }
];

function getStatusBadge(status?: string | null) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
        Unknown
      </span>
    );
  }

  const upper = status.toUpperCase();
  if (upper === "RESOLVED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        Resolved
      </span>
    );
  }
  if (upper === "RESOLVING" || upper === "UNDER_REVIEW" || upper === "IN_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        In Review
      </span>
    );
  }
  if (upper === "OPEN" || upper === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold text-sky-800">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
        Open
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
      {status}
    </span>
  );
}

export default function DisputesPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAdminDisputes();

  // Tab filter: 'all' | 'active' | 'resolved'
  const [activeTab, setActiveTab] = useState<"all" | "active" | "resolved">("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const disputes = data ?? [];

  // Metrics Calculations
  const metrics = useMemo(() => {
    const total = disputes.length;
    let openCount = 0;
    let reviewingCount = 0;
    let resolvedCount = 0;

    for (const d of disputes) {
      const s = (d.status ?? "").toUpperCase();
      if (s === "RESOLVED") {
        resolvedCount++;
      } else if (s === "RESOLVING" || s === "UNDER_REVIEW" || s === "IN_REVIEW") {
        reviewingCount++;
      } else {
        openCount++;
      }
    }

    const activeTotal = openCount + reviewingCount;

    return {
      total,
      openCount,
      reviewingCount,
      resolvedCount,
      activeTotal
    };
  }, [disputes]);

  // Filtered List
  const filteredDisputes = useMemo(() => {
    return disputes.filter((d) => {
      const statusUpper = (d.status ?? "").toUpperCase();

      // Tab filter
      if (activeTab === "active" && statusUpper === "RESOLVED") {
        return false;
      }
      if (activeTab === "resolved" && statusUpper !== "RESOLVED") {
        return false;
      }

      // Status dropdown filter
      if (statusFilter) {
        if (statusFilter === "RESOLVED" && statusUpper !== "RESOLVED") return false;
        if (statusFilter === "OPEN" && statusUpper !== "OPEN" && statusUpper !== "PENDING") return false;
        if (
          statusFilter === "RESOLVING" &&
          statusUpper !== "RESOLVING" &&
          statusUpper !== "UNDER_REVIEW" &&
          statusUpper !== "IN_REVIEW"
        ) {
          return false;
        }
      }

      // Search match
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase();
        const idMatch = d.id.toLowerCase().includes(q);
        const bookingMatch = d.bookingId?.toLowerCase().includes(q) ?? false;
        const reasonMatch = d.reason?.toLowerCase().includes(q) ?? false;
        const openedByMatch = d.openedById?.toLowerCase().includes(q) ?? false;
        return idMatch || bookingMatch || reasonMatch || openedByMatch;
      }

      return true;
    });
  }, [disputes, activeTab, statusFilter, debouncedSearch]);

  // Pagination slice
  const totalCount = filteredDisputes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paginatedDisputes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredDisputes.slice(start, start + PAGE_SIZE);
  }, [filteredDisputes, page]);

  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      const headers = [
        "Dispute ID",
        "Status",
        "Booking ID",
        "Reason",
        "Opened By",
        "Created At",
        "Updated At"
      ];
      const rows = filteredDisputes.map((d) => [
        d.id,
        d.status ?? "",
        d.bookingId ?? "",
        d.reason ?? "",
        d.openedById ?? "",
        d.createdAt ?? "",
        d.updatedAt ?? ""
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((r) =>
          r
            .map((val) => `"${String(val).replace(/"/g, '""')}"`)
            .join(",")
        )
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `disputes-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export disputes:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black mt-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Dispute Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            Review reported marketplace booking disputes, customer-artisan claims, and conflict resolutions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-lg border border-slate-200 bg-[#F9F9F9] px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[#FF6600]" : "text-slate-600"}`} />
            <span>{isFetching ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Fraud Prevention Security Guards */}
      <FraudAccessBanner />
      <FraudAccessDenied />

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Disputes */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Disputes</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : metrics.total.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Total claims filed on the platform
          </div>
        </div>

        {/* Pending Resolution */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Pending Action</span>
            <AlertCircle className="h-4 w-4 text-[#FF6600]" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : metrics.activeTotal.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Claims awaiting moderation or review
          </div>
        </div>

        {/* In Review */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Under Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : metrics.reviewingCount.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Currently undergoing active investigation
          </div>
        </div>

        {/* Resolved Cases */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Resolved Disputes</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isLoading ? "…" : metrics.resolvedCount.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Settled and finalized resolutions
          </div>
        </div>
      </div>

      {/* Main Disputes Table Card */}
      <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-garet font-[850] text-black">Disputes Queue</h2>
            {/* View Tabs */}
            <div className="flex items-center gap-1 bg-[#EBEBEB] p-1 rounded-lg">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeTab === "all"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                All ({metrics.total})
              </button>
              <button
                onClick={() => {
                  setActiveTab("active");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeTab === "active"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Active ({metrics.activeTotal})
              </button>
              <button
                onClick={() => {
                  setActiveTab("resolved");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeTab === "resolved"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Resolved ({metrics.resolvedCount})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              disabled={isExporting || filteredDisputes.length === 0}
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

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-[#F9F9F9] px-2.5 py-1.5 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, booking, or reason"
                className="w-64 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 text-slate-400 hover:text-black"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6600]" />
            Loading disputes queue…
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">
            Failed to load disputes: {error?.message ?? "Unknown error"}
          </div>
        ) : paginatedDisputes.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No disputes found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Dispute ID</th>
                  <th className="px-6 py-4 font-medium">Booking Reference</th>
                  <th className="px-6 py-4 font-medium">Reason / Claim</th>
                  <th className="px-6 py-4 font-medium">Opened By</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Opened Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDisputes.map((dispute, index) => {
                  const openedDate = dispute.createdAt
                    ? new Date(dispute.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "—";

                  return (
                    <tr
                      key={dispute.id}
                      className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                    >
                      {/* Dispute ID */}
                      <td className="px-6 py-4 font-medium text-black">
                        <span
                          className="font-mono text-[11px] font-semibold text-slate-800"
                          title={dispute.id}
                        >
                          #{dispute.id.slice(0, 8)}…
                        </span>
                      </td>

                      {/* Booking ID */}
                      <td className="px-6 py-4 text-black">
                        {dispute.bookingId ? (
                          <span
                            className="font-mono text-[11px] text-slate-700 font-medium"
                            title={dispute.bookingId}
                          >
                            #{dispute.bookingId.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Reason / Claim */}
                      <td className="px-6 py-4 text-black">
                        <div className="max-w-[260px] truncate font-medium">
                          {dispute.reason || "Disputed booking claim"}
                        </div>
                      </td>

                      {/* Opened By */}
                      <td className="px-6 py-4 text-black">
                        {dispute.openedById ? (
                          <span
                            className="font-mono text-[10px] text-slate-600 block truncate max-w-[140px]"
                            title={dispute.openedById}
                          >
                            {dispute.openedById.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-black">
                        {getStatusBadge(dispute.status)}
                      </td>

                      {/* Opened Date */}
                      <td className="px-6 py-4 text-slate-600">{openedDate}</td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/disputes/${dispute.id}`}
                          className="inline-flex items-center gap-1 font-bold text-[12px] text-[#FF6600] hover:underline"
                        >
                          <span>Review Case</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={totalCount}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
