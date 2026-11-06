"use client";

import React, { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import {
  Search,
  Info,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Calendar,
  MapPin,
  User,
  Briefcase
} from "lucide-react";
import { useAdminBookings, useAdminOpenBookings } from "@/hooks/useAdminBookings";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { canTriggerBookingExpireOverdueSweep } from "@/lib/permissions";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useAuth } from "@/hooks/useAuth";
import { bookingsAdminService } from "@/services/bookings-admin.service";
import { entityLabel } from "@/lib/merge-profiles";
import type { AdminBooking } from "@/types/admin-bookings";
import type { ExpireOverdueSweepResult } from "@/types/bookings-admin";

const PAGE_SIZE = 15;

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Open", value: "OPEN" },
  { label: "Requested", value: "REQUESTED" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completion Submitted", value: "COMPLETION_SUBMITTED" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Disputed", value: "DISPUTED" },
  { label: "Expired", value: "EXPIRED" }
];

function getStatusBadge(status?: string | null) {
  if (!status) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
        Unknown
      </span>
    );
  }

  const s = status.toUpperCase();
  if (s === "COMPLETED" || s === "CONFIRMED" || s === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
        {status}
      </span>
    );
  }
  if (s === "OPEN" || s === "REQUESTED" || s === "KRAFTER_SELECTED" || s === "OPEN_FOR_APPLICATIONS") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-semibold text-sky-800">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-600" />
        {status}
      </span>
    );
  }
  if (s === "IN_PROGRESS" || s === "COMPLETION_SUBMITTED" || s === "PAYMENT_PENDING") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        {status}
      </span>
    );
  }
  if (s === "CANCELLED" || s === "EXPIRED" || s === "DISPUTED" || s === "DECLINED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
        {status}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
      {status}
    </span>
  );
}

function getCategoryName(booking: AdminBooking): string {
  const cat = (booking.category ?? booking.serviceCategory) as Record<string, unknown> | null;
  if (!cat) return "General Service";
  if (typeof cat.name === "string") return cat.name;
  if (typeof cat.label === "string") return cat.label;
  return entityLabel(cat);
}

export default function BookingsPage() {
  const { user } = useAuth();
  const canRunSweep = canTriggerBookingExpireOverdueSweep(user);

  // View Mode: 'all' or 'open'
  const [activeTab, setActiveTab] = useState<"all" | "open">("all");

  // Filters
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [artisanId, setArtisanId] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selected booking for detail modal
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);

  // Sweep result
  const [lastResult, setLastResult] = useState<ExpireOverdueSweepResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Headline KPI Data
  const { data: dashboardStats, isLoading: isStatsLoading } = useDashboardStats();

  const listParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      status: statusFilter.trim() || undefined,
      customerId: customerId.trim() || undefined,
      artisanId: artisanId.trim() || undefined
    }),
    [page, statusFilter, customerId, artisanId]
  );

  const openBookingsQuery = useAdminOpenBookings({ page, limit: PAGE_SIZE });
  const allBookingsQuery = useAdminBookings(listParams);

  const currentQuery = activeTab === "open" ? openBookingsQuery : allBookingsQuery;
  const bookingsList = currentQuery.data?.items ?? [];
  const totalCount = currentQuery.data?.meta?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Client-side search filtering if search is active
  const filteredBookings = useMemo(() => {
    if (!debouncedSearch.trim()) return bookingsList;
    const q = debouncedSearch.toLowerCase();
    return bookingsList.filter((b) => {
      const idMatch = b.id.toLowerCase().includes(q);
      const titleMatch = b.jobTitle?.toLowerCase().includes(q) ?? false;
      const descMatch = b.jobDescription?.toLowerCase().includes(q) ?? false;
      const customerMatch = entityLabel(b.customer).toLowerCase().includes(q);
      const krafterMatch = entityLabel(b.artisan ?? b.krafter).toLowerCase().includes(q);
      return idMatch || titleMatch || descMatch || customerMatch || krafterMatch;
    });
  }, [bookingsList, debouncedSearch]);

  const expireMutation = useMutation({
    mutationFn: () => bookingsAdminService.runExpireOverdueSweep(),
    onSuccess: (data) => {
      setLastResult(data);
      allBookingsQuery.refetch();
      openBookingsQuery.refetch();
    }
  });

  const handleExportCsv = () => {
    try {
      setIsExporting(true);
      const headers = [
        "Booking ID",
        "Status",
        "Job Title",
        "Customer",
        "Krafter",
        "Category",
        "Preferred Date",
        "Address",
        "Created At"
      ];
      const rows = filteredBookings.map((b) => [
        b.id,
        b.status ?? "",
        b.jobTitle ?? "",
        entityLabel(b.customer),
        entityLabel(b.artisan ?? b.krafter),
        getCategoryName(b),
        b.preferredDate ?? "",
        b.address ?? "",
        b.createdAt ?? ""
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
      a.download = `bookings-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export bookings:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black mt-4">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Booking Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            Monitor active marketplace reservations, open customer requests, and booking lifecycles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canRunSweep && (
            <button
              onClick={() => expireMutation.mutate()}
              disabled={expireMutation.isPending}
              className="rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {expireMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Running Sweep…</span>
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5" />
                  <span>Run Expiry Sweep</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Headline KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bookings */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Bookings</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isStatsLoading
              ? "…"
              : (dashboardStats?.totalBookings ?? allBookingsQuery.data?.meta?.total ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            All marketplace booking records
          </div>
        </div>

        {/* Open Queue */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Open Queue</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isStatsLoading
              ? "…"
              : (openBookingsQuery.data?.meta?.total ?? dashboardStats?.openBookings ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Awaiting Krafter response or application
          </div>
        </div>

        {/* Active Krafters Available */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Krafters</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isStatsLoading
              ? "…"
              : (dashboardStats?.activeKrafters ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Artisans available for marketplace orders
          </div>
        </div>

        {/* Expiry Sweep Status */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Sweep Maintenance</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {lastResult ? `${lastResult.expired} Expired` : "Active"}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate">
            {lastResult
              ? `${lastResult.scanned} scanned (${lastResult.graceHours}h grace)`
              : "Overdue scheduler running normally"}
          </div>
        </div>
      </div>

      {/* Main Bookings Table Card */}
      <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
        {/* Table Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-garet font-[850] text-black">Bookings</h2>
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
                All Bookings ({allBookingsQuery.data?.meta?.total ?? 0})
              </button>
              <button
                onClick={() => {
                  setActiveTab("open");
                  setPage(1);
                }}
                className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  activeTab === "open"
                    ? "bg-white text-black shadow-sm"
                    : "text-slate-600 hover:text-black"
                }`}
              >
                Open Queue ({openBookingsQuery.data?.meta?.total ?? 0})
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* CSV Export */}
            <button
              onClick={handleExportCsv}
              disabled={isExporting || filteredBookings.length === 0}
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

            {/* Status Filter (available on All Bookings tab) */}
            {activeTab === "all" && (
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
            )}

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by job, ID, or user"
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

            {/* Toggle Advanced Filters */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                showAdvancedFilters || customerId || artisanId
                  ? "border-[#FF6600] text-[#FF6600] bg-[#FF66000F]"
                  : "border-slate-200 bg-[#F9F9F9] text-black hover:bg-slate-100"
              }`}
            >
              <Filter className="h-3 w-3" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvancedFilters && (
          <div className="bg-[#EFEFEF] px-6 py-3 border-b border-slate-200/60 flex flex-wrap items-center gap-4 text-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Customer ID:</span>
              <input
                type="text"
                value={customerId}
                onChange={(e) => {
                  setCustomerId(e.target.value);
                  setPage(1);
                }}
                placeholder="Paste customer UUID"
                className="h-7 w-48 rounded-md border border-slate-300 bg-white px-2 text-[11px] outline-none font-mono focus:border-[#FF6600]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600">Krafter ID:</span>
              <input
                type="text"
                value={artisanId}
                onChange={(e) => {
                  setArtisanId(e.target.value);
                  setPage(1);
                }}
                placeholder="Paste artisan UUID"
                className="h-7 w-48 rounded-md border border-slate-300 bg-white px-2 text-[11px] outline-none font-mono focus:border-[#FF6600]"
              />
            </div>

            {(customerId || artisanId || statusFilter) && (
              <button
                onClick={() => {
                  setCustomerId("");
                  setArtisanId("");
                  setStatusFilter("");
                  setPage(1);
                }}
                className="text-[11px] font-semibold text-rose-600 hover:underline ml-auto"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Bookings Table */}
        {currentQuery.isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6600]" />
            Loading {activeTab === "open" ? "open queue" : "bookings"}…
          </div>
        ) : currentQuery.isError ? (
          <div className="p-8 text-center text-xs text-rose-500">
            Failed to load bookings: {currentQuery.error?.message ?? "Unknown error"}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No bookings found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Booking ID</th>
                  <th className="px-6 py-4 font-medium">Job Title & Category</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Krafter</th>
                  <th className="px-6 py-4 font-medium">Schedule / Location</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking, index) => {
                  const customerLabel = entityLabel(booking.customer);
                  const krafterLabel = entityLabel(booking.artisan ?? booking.krafter);
                  const categoryName = getCategoryName(booking);

                  const createdDate = booking.createdAt
                    ? new Date(booking.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })
                    : "—";

                  const preferredDisplay =
                    booking.preferredDate || booking.preferredTime
                      ? `${booking.preferredDate ?? ""} ${booking.preferredTime ?? ""}`.trim()
                      : booking.address ?? "—";

                  return (
                    <tr
                      key={booking.id}
                      className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                    >
                      {/* Booking ID */}
                      <td className="px-6 py-4 font-medium text-black">
                        <span
                          className="font-mono text-[11px] font-semibold text-slate-800"
                          title={booking.id}
                        >
                          #{booking.id.slice(0, 8)}…
                        </span>
                      </td>

                      {/* Job Title & Category */}
                      <td className="px-6 py-4 text-black">
                        <div className="max-w-[220px]">
                          <span className="font-semibold block truncate">
                            {booking.jobTitle || "Untitled Job"}
                          </span>
                          <span className="text-[10px] text-slate-500 block truncate">
                            {categoryName}
                          </span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 text-black">
                        <div className="max-w-[180px]">
                          <span className="font-medium block truncate">{customerLabel}</span>
                          {booking.customerId && (
                            <span
                              className="font-mono text-[9px] text-slate-500 block truncate"
                              title={booking.customerId}
                            >
                              {booking.customerId.slice(0, 8)}…
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Krafter */}
                      <td className="px-6 py-4 text-black">
                        <div className="max-w-[180px]">
                          {krafterLabel !== "—" ? (
                            <>
                              <span className="font-medium block truncate">{krafterLabel}</span>
                              {booking.artisanId && (
                                <span
                                  className="font-mono text-[9px] text-slate-500 block truncate"
                                  title={booking.artisanId}
                                >
                                  {booking.artisanId.slice(0, 8)}…
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex rounded bg-slate-200/80 px-2 py-0.5 text-[9px] font-medium text-slate-600">
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Schedule / Address */}
                      <td className="px-6 py-4 text-black">
                        <div className="max-w-[190px]">
                          <span className="block truncate font-medium text-[11px]">
                            {preferredDisplay}
                          </span>
                          {booking.address && booking.preferredDate && (
                            <span className="block truncate text-[10px] text-slate-500">
                              {booking.address}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-black">
                        {getStatusBadge(booking.status)}
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4 text-slate-600">{createdDate}</td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="font-bold text-[12px] text-[#FF6600] hover:underline"
                        >
                          View Details
                        </button>
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
          isLoading={currentQuery.isLoading}
        />
      </div>

      {/* Expiry Sweep Maintenance Bottom Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Overdue Bookings Maintenance
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium">
            Runs automated sweep logic to immediately cancel or expire bookings that have exceeded the
            grace cutoff period without action.
          </p>

          {lastResult && (
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {lastResult.scanned} Scanned
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2.5 py-1 font-semibold text-rose-800">
                {lastResult.expired} Expired
              </span>
              <span className="text-slate-500 font-medium">
                Cutoff: {new Date(lastResult.cutoffIso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Grace: {lastResult.graceHours}h
              </span>
            </div>
          )}

          {expireMutation.isError && (
            <p className="text-xs text-rose-600 font-medium mt-1">
              Sweep execution error: {expireMutation.error?.message ?? "Request failed"}
            </p>
          )}
        </div>

        {canRunSweep ? (
          <button
            onClick={() => expireMutation.mutate()}
            disabled={expireMutation.isPending}
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {expireMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Running Sweep…</span>
              </>
            ) : (
              <span>Run Expiry Sweep Now</span>
            )}
          </button>
        ) : (
          <p className="text-xs text-slate-500 italic">
            Requires Admin or Super Admin role to run overdue sweeps.
          </p>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-black">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-black font-garet">
                    {selectedBooking.jobTitle || "Booking Details"}
                  </h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  ID: {selectedBooking.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 py-4 text-xs">
              {/* Job Description */}
              {selectedBooking.jobDescription && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    Job Description
                  </span>
                  <p className="bg-[#F9F9F9] p-3 rounded-lg text-slate-800 text-[12px] leading-relaxed">
                    {selectedBooking.jobDescription}
                  </p>
                </div>
              )}

              {/* Parties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F6F6F6] p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                    <User className="h-3.5 w-3.5 text-slate-700" />
                    <span>Customer</span>
                  </div>
                  <div className="font-semibold text-black text-[12px]">
                    {entityLabel(selectedBooking.customer)}
                  </div>
                  {selectedBooking.customerId && (
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                      {selectedBooking.customerId}
                    </div>
                  )}
                </div>

                <div className="bg-[#F6F6F6] p-3 rounded-xl">
                  <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                    <Briefcase className="h-3.5 w-3.5 text-slate-700" />
                    <span>Assigned Krafter</span>
                  </div>
                  <div className="font-semibold text-black text-[12px]">
                    {entityLabel(selectedBooking.artisan ?? selectedBooking.krafter)}
                  </div>
                  {selectedBooking.artisanId && (
                    <div className="font-mono text-[10px] text-slate-400 mt-0.5 truncate">
                      {selectedBooking.artisanId}
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule & Location */}
              <div className="bg-[#F6F6F6] p-3 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-[#FF6600]" />
                  <span className="font-medium text-slate-800">
                    {selectedBooking.preferredDate || selectedBooking.preferredTime
                      ? `${selectedBooking.preferredDate ?? ""} ${selectedBooking.preferredTime ?? ""}`.trim()
                      : "Schedule not specified"}
                  </span>
                </div>
                {selectedBooking.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-[#FF6600] shrink-0 mt-0.5" />
                    <span className="text-slate-700">{selectedBooking.address}</span>
                  </div>
                )}
              </div>

              {/* Metadata Timestamps */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                <div>
                  Created:{" "}
                  <span className="text-slate-800 font-medium">
                    {selectedBooking.createdAt
                      ? new Date(selectedBooking.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
                <div>
                  Updated:{" "}
                  <span className="text-slate-800 font-medium">
                    {selectedBooking.updatedAt
                      ? new Date(selectedBooking.updatedAt).toLocaleString()
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
