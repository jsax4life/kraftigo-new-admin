"use client";

import React, { useState } from "react";
import {
  Info,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Receipt
} from "lucide-react";
import { useFinancialsSummary, usePayouts } from "@/hooks/useFinancials";
import type { FinancialsPeriod, PayoutStatus, PayoutRow } from "@/types/financials";

const STATUS_TABS: { label: string; value: PayoutStatus | "ALL" }[] = [
  { label: "All Payouts", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed", value: "COMPLETED" },
  { label: "On Hold", value: "ON_HOLD" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Failed", value: "FAILED" }
];

function getStatusBadgeStyle(status?: string | null) {
  const norm = (status ?? "PENDING").toUpperCase();
  switch (norm) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ON_HOLD":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "CANCELLED":
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function FinancialsPage() {
  const [period, setPeriod] = useState<FinancialsPeriod>("this_month");
  const [statusFilter, setStatusFilter] = useState<PayoutStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  // Queries
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError
  } = useFinancialsSummary(period);

  const {
    data: payoutsResult,
    isLoading: isPayoutsLoading,
    isError: isPayoutsError,
    error: payoutsError
  } = usePayouts({
    status: statusFilter,
    page,
    limit: 20
  });

  const payouts: PayoutRow[] = payoutsResult?.items ?? [];
  const total = payoutsResult?.meta?.total ?? 0;
  const totalPages =
    payoutsResult?.meta?.totalPages ?? Math.max(1, Math.ceil(total / 20));

  const totalRevenue = summaryData?.metrics?.totalRevenue;
  const avgTx = summaryData?.metrics?.averageTransaction;
  const growth = summaryData?.metrics?.revenueGrowth;
  const pendingApprovals = summaryData?.metrics?.pendingApprovals?.value ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-slate-900 mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">
            Financials & Payouts
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Monitor platform revenue, transaction trends, and manage payout disbursements.
          </p>
        </div>

        {/* Period Selector */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as FinancialsPeriod)}
          className="rounded-md bg-[#F6F6F6] px-3 py-1.5 text-[12px] text-black font-semibold border-none outline-none cursor-pointer hover:bg-slate-200 transition-colors self-start sm:self-center"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="all_time">All Time</option>
        </select>
      </div>

      {isSummaryError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
          Failed to load financial metrics: {summaryError?.message ?? "Unknown error"}
        </div>
      )}

      {/* KPI Cards Row (Connected to GET /api/admin/financials/summary) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Total Revenue</span>
            <Wallet className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : totalRevenue?.formatted ||
                `£${(totalRevenue?.value ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {summaryData?.range?.label ?? "Selected time window"}
          </div>
        </div>

        {/* Average Transaction */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Average Transaction</span>
            <Receipt className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : avgTx?.formatted ||
                `£${(avgTx?.value ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {isSummaryLoading
              ? "…"
              : `${(avgTx?.transactionCount ?? 0).toLocaleString()} captured transactions`}
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Revenue Growth</span>
            <TrendingUp className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[22px] font-mabry font-extrabold text-slate-900">
              {isSummaryLoading
                ? "…"
                : growth?.value != null
                ? `${growth.value > 0 ? "+" : ""}${growth.value}%`
                : "—"}
            </span>
            {growth?.value != null && (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                vs prior period
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {growth?.label ?? "Period comparison trend"}
          </div>
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => {
            setStatusFilter("PENDING");
            setPage(1);
          }}
          className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 cursor-pointer hover:border-[#FF6600]/40 transition-colors"
        >
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading ? "…" : pendingApprovals.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#FF6600] font-semibold">
            <span>Filter pending queue</span>
            <ArrowUpRight className="h-3 w-3" />
          </div>
        </div>
      </div>

      {/* Payout Ledger Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-[850] text-black">
            Payout Ledger
          </h2>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  statusFilter === tab.value
                    ? "bg-[#FF6600] text-white shadow-sm"
                    : "bg-[#F6F6F6] text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F6F6] text-[11px] text-[#00000066]">
                <tr>
                  <th className="px-6 py-4 font-medium">Payout Reference</th>
                  <th className="px-6 py-4 font-medium">Krafter / Recipient</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Destination</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0000000D]">
                {isPayoutsLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-500">
                      Loading payout ledger…
                    </td>
                  </tr>
                ) : isPayoutsError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-rose-500">
                      Failed to load payouts: {payoutsError?.message ?? "Unknown error"}
                    </td>
                  </tr>
                ) : payouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-500">
                      No payout entries found for status{" "}
                      <span className="font-semibold text-slate-800">
                        {statusFilter}
                      </span>
                      .
                    </td>
                  </tr>
                ) : (
                  payouts.map((row, index) => {
                    const refCode =
                      row.reference || row.code || `#PO-${row.id.slice(0, 8)}`;
                    const recipient =
                      row.krafterName ||
                      row.recipientName ||
                      row.name ||
                      row.email ||
                      "Artisan Account";
                    const amountVal =
                      row.amount != null
                        ? String(row.amount).startsWith("£")
                          ? row.amount
                          : `£${Number(row.amount).toLocaleString()}`
                        : "£0";
                    const destinationLabel =
                      row.destination ||
                      row.bankName ||
                      (row.ibanLast4 ? `IBAN ending in ${row.ibanLast4}` : "Stripe Connect");
                    const dateDisplay =
                      row.createdAt || row.requestedAt || row.processedAt || "Recent";
                    const statusText = row.status || "PENDING";

                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? "bg-[#DFDFDF]/40" : "bg-[#F6F6F6]"
                        }`}
                      >
                        <td className="px-6 py-4 font-bold text-black text-[13px]">
                          {refCode}
                        </td>
                        <td className="px-6 py-4 font-medium text-black text-[13px]">
                          <div>{recipient}</div>
                          {row.email && (
                            <div className="text-[11px] text-slate-500">{row.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-black text-[13px]">
                          {amountVal}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">
                          {destinationLabel}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(
                              statusText
                            )}`}
                          >
                            {statusText}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-slate-500">
                          {dateDisplay}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-[#0000001A] px-6 py-3 text-[11px]">
            <div className="font-bold text-black text-[12px]">
              Showing {payouts.length === 0 ? 0 : (page - 1) * 20 + 1}-{Math.min(page * 20, total)} of {total}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-6 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`flex h-6 w-8 items-center justify-center rounded font-medium transition-colors ${
                      page === p
                        ? "bg-[#FF6600] text-white"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-6 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
