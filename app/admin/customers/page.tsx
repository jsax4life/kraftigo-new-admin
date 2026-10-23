"use client";

import React, { useEffect, useState } from "react";
import { Info, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useCustomerSummary,
  useCustomersList,
  useHighValueCustomers,
  useCustomerRestrictedSummary
} from "@/hooks/useCustomers";
import { customersService } from "@/services/customers.service";
import type { CustomerPeriod, HighValueCustomer } from "@/types/customers";

const PAGE_SIZE = 10;

const PERIOD_OPTIONS: { label: string; value: CustomerPeriod }[] = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "All Time", value: "all_time" }
];

const fallbackHighValue: HighValueCustomer[] = [
  { id: "1", name: "Natalie Gates", location: "Lagos Nigeria", value: "£34,345.00", image: "/images/login.jpg" },
  { id: "2", name: "Natalie Gates", location: "Lagos Nigeria", value: "£34,345.00", image: "/images/login.jpg" },
  { id: "3", name: "Natalie Gates", location: "Lagos Nigeria", value: "£34,345.00", image: "/images/login.jpg" },
];

export default function CustomersPage() {
  const [period, setPeriod] = useState<CustomerPeriod>("this_month");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Debounce search input for snappy backend queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Summary Metrics Query
  const {
    data: summaryData,
    isLoading: isSummaryLoading
  } = useCustomerSummary(period);

  // Dedicated Restricted Profiles Summary Query
  const {
    data: restrictedSummary
  } = useCustomerRestrictedSummary();

  // High Value Customers Query (with graceful empty fallback if DB has 0 captured payments)
  const {
    data: highValueData,
    isLoading: isHighValueLoading
  } = useHighValueCustomers(3);

  // Paginated Customers List Query
  const {
    data: listData,
    isLoading: isListLoading,
    isError,
    error,
    isFetching
  } = useCustomersList({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    period
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await customersService.exportCustomers({
        period,
        search: debouncedSearch
      });
    } catch (err) {
      console.error("Failed to export customers CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const customers = listData?.data ?? [];
  const totalCount = listData?.total ?? 0;
  const totalPages = listData?.totalPages ?? Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const metrics = summaryData?.metrics;


  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 pb-12 font-sans bg-white text-black mt-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">Customer Management</h1>
          <p className="mt-2 text-[14px] text-slate-800 font-medium">
            Oversee and manage all platform participants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isExporting ? (
              <>
                Exporting <Loader2 className="h-4 w-4 animate-spin text-black" />
              </>
            ) : (
              <>
                Export <Image src="/export.svg" alt="Export" width={16} height={16} />
              </>
            )}
          </button>
          <button className="rounded-lg bg-[#FF6600] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors">
            Add new user
          </button>
        </div>
      </div>

      {/* Metrics Row (Connected to /api/admin/customers/summary) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Users</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.totalUsers?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {summaryData?.range?.label ?? "Selected window"}
          </div>
        </div>

        {/* New Signups */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>New Signups</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.newSignups?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {metrics?.newSignups?.changePercent != null
              ? `+${metrics.newSignups.changePercent}% vs last period`
              : "Registered in selected window"}
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Users</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading ? "…" : (metrics?.activeUsers?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium truncate" title={metrics?.activeUsers?.definition ?? "Active customers"}>
            {metrics?.activeUsers?.definition ?? "Users with active booking"}
          </div>
        </div>

        {/* AVG Lifetime Value */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>AVG Lifetime Value</span>
            <Info className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-black">
            {isSummaryLoading
              ? "…"
              : `${metrics?.avgLifetimeValue?.currency === "USD" ? "$" : "£"}${(metrics?.avgLifetimeValue?.value ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {metrics?.avgLifetimeValue?.definition ?? "Average spend per customer"}
          </div>
        </div>
      </div>

      {/* High Value Customers (Connected to GET /api/admin/customers/high-value) */}
      <div>
        <h2 className="mb-4 text-xl font-garet font-[850] text-black">High Value Customers</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isHighValueLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-[#0000FF33] p-5 animate-pulse">
                <div className="rounded-full w-14 h-14 bg-slate-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-slate-300 rounded" />
                  <div className="h-2.5 w-16 bg-slate-200 rounded" />
                  <div className="h-3.5 w-20 bg-slate-300 rounded" />
                </div>
              </div>
            ))
          ) : (
            (highValueData && highValueData.length > 0 ? highValueData : fallbackHighValue).map((customer, idx) => {
              const displayValue =
                typeof customer.totalSpend === "object" && customer.totalSpend !== null
                  ? customer.totalSpend.formatted || `£${(customer.totalSpend.value ?? 0).toLocaleString()}`
                  : typeof customer.value === "string"
                  ? customer.value
                  : typeof customer.totalSpend === "number"
                  ? `£${customer.totalSpend.toLocaleString()}`
                  : "£0.00";

              const locationText = customer.location || customer.country || "—";
              const targetUrl = customer.viewPath || (customer.id ? `/admin/customers/${customer.id}` : null);

              const CardContent = (
                <div className="flex items-center gap-4 rounded-xl bg-[#0000FF33] p-5 hover:bg-[#0000FF40] transition-colors">
                  <Image
                    src={customer.avatarUrl || customer.image || "/images/login.jpg"}
                    alt={customer.name}
                    height={100}
                    width={100}
                    className="rounded-full w-14 h-14 object-cover"
                  />
                  <div>
                    <div className="text-[12px] font-semibold text-[#000000CC]">{customer.name}</div>
                    <div className="text-[11px] font-medium text-[#000000CC] mb-1">{locationText}</div>
                    <div className="text-[12px] font-extrabold text-black">{displayValue}</div>
                  </div>
                </div>
              );

              return targetUrl ? (
                <Link key={customer.id ?? idx} href={targetUrl}>
                  {CardContent}
                </Link>
              ) : (
                <div key={customer.id ?? idx}>{CardContent}</div>
              );
            })
          )}
        </div>
      </div>

      {/* Customers Table (Connected to GET /api/admin/customers) */}
      <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <h2 className="text-xl font-garet font-[850] text-black">Customers</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleExport}
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
                setPeriod(e.target.value as CustomerPeriod);
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
                placeholder="Search by name, email, phone, or user ID"
                className="w-80 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {isListLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading customers…</div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500">
            Failed to load customers: {error?.message ?? "Unknown error"}
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] whitespace-nowrap">
              <thead className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Country</th>
                  <th className="px-6 py-4 font-medium">Bookings</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Last Active</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => {
                  const country = customer.country || "—";
                  const lastActive = customer.lastActive
                    ? new Date(customer.lastActive).toLocaleDateString()
                    : "—";

                  return (
                    <tr
                      key={customer.id}
                      className={index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"}
                    >
                      <td className="px-6 py-4 font-medium text-black">
                        <div>
                          <span className="font-semibold">{customer.name}</span>
                          {customer.displayUserId && (
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">
                              {customer.displayUserId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black">{country}</td>
                      <td className="px-6 py-4 text-black font-semibold">
                        {customer.totalBookings ?? 0}
                      </td>
                      <td className="px-6 py-4 text-black">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                            customer.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {customer.status ?? "ACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-black">{lastActive}</td>
                      <td className="px-6 py-4 text-black">{customer.email ?? "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={customer.viewPath || `/admin/customers/${customer.id}`}
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
            Showing {customers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
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

      {/* Restricted Profiles CTA (Connected to GET /api/admin/customers/restricted/summary) */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-garet font-[850] text-black">Restricted Profiles</h2>
          <div>
            <p className="text-[13px] text-slate-700 font-medium">
              {restrictedSummary?.definition || summaryData?.restrictedProfiles?.definition || "View all restricted accounts"}
            </p>
            <div className="text-[14px] font-extrabold text-black">
              {isSummaryLoading
                ? "…"
                : `${restrictedSummary?.flaggedCount ?? summaryData?.restrictedProfiles?.flaggedCount ?? 0} Accounts Flagged`}
            </div>
          </div>
        </div>
        <Link
          href={restrictedSummary?.listPath || summaryData?.restrictedProfiles?.listPath || "/admin/restricted-users"}
          className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e65c00] transition-colors"
        >
          View Restricted List
        </Link>
      </div>
    </div>
  );
}
