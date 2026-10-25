"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Copy,
  Check,
  Filter,
  Eye,
  UserCheck,
  ChevronLeft
} from "lucide-react";
import { useWorkEligibilityList } from "@/hooks/useWorkEligibilityList";
import type { WorkEligibilityStatus, WorkEligibilitySubmission } from "@/types/work-eligibility";
import { getDocumentHref, getKrafterLabel } from "@/lib/work-eligibility-display";
import { PaginationBar } from "@/components/ui/pagination-bar";

const PAGE_SIZE = 10;

const STATUS_TABS: { value: "" | WorkEligibilityStatus; label: string }[] = [
  { value: "", label: "All Submissions" },
  { value: "PENDING", label: "Pending Review" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" }
];

export default function WorkEligibilityAdminPage() {
  const [statusFilter, setStatusFilter] = useState<"" | WorkEligibilityStatus>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Server parameters
  const listParams = useMemo(() => {
    const status = statusFilter || undefined;
    return status ? { status } : undefined;
  }, [statusFilter]);

  const { data, isLoading, isError, error, refetch, isFetching } =
    useWorkEligibilityList(listParams);

  // Client-side filtering for user search (can match UUID, krafter name, or email)
  const filteredSubmissions = useMemo(() => {
    if (!data) return [];
    if (!searchQuery.trim()) return data;

    const query = searchQuery.trim().toLowerCase();
    return data.filter((item) => {
      const label = getKrafterLabel(item).toLowerCase();
      const userId = (item.userId || "").toLowerCase();
      const itemId = (item.id || "").toLowerCase();
      const docType = (item.documentUrl || "").toLowerCase();
      return (
        label.includes(query) ||
        userId.includes(query) ||
        itemId.includes(query) ||
        docType.includes(query)
      );
    });
  }, [data, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / PAGE_SIZE));
  const paginatedSubmissions = useMemo(() => {
    return filteredSubmissions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredSubmissions, page]);

  // Compute live KPI counts
  const stats = useMemo(() => {
    if (!data) {
      return { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    let pending = 0;
    let approved = 0;
    let rejected = 0;

    data.forEach((item) => {
      if (item.status === "PENDING") pending++;
      else if (item.status === "APPROVED") approved++;
      else if (item.status === "REJECTED") rejected++;
    });

    return {
      total: data.length,
      pending,
      approved,
      rejected
    };
  }, [data]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
           <Link
            href="/admin/krafters"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline"
          >
            <ChevronLeft className="h-4 w-4 border border-[#FF6600] rounded-md" /> Back
          </Link>
          </div>
          <h1 className="text-2xl font-garet font-[850] text-black">
            Work Eligibility Verification
          </h1>
          <p className="text-xs text-[#00000099]">
            Review, verify, and approve or reject identity and right-to-work documents submitted by Krafters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-200 transition-colors disabled:opacity-50"
            title="Refresh submissions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[#FF6600]" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Headline Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Submissions */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Submissions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200/80 text-slate-700">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mabry font-extrabold text-[22px] text-black">
              {isLoading ? "—" : stats.total.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">records</span>
          </div>
        </div>

        {/* Pending Review */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Pending Review</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mabry font-extrabold text-[22px] text-amber-600">
              {isLoading ? "—" : stats.pending.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-amber-700/80">requires action</span>
          </div>
        </div>

        {/* Approved */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Approved</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mabry font-extrabold text-[22px] text-emerald-600">
              {isLoading ? "—" : stats.approved.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-emerald-700/80">verified</span>
          </div>
        </div>

        {/* Rejected */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Rejected</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mabry font-extrabold text-[22px] text-rose-600">
              {isLoading ? "—" : stats.rejected.toLocaleString()}
            </span>
            <span className="text-[11px] font-medium text-rose-700/80">action needed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => {
            const isActive = statusFilter === tab.value;
            const count =
              tab.value === ""
                ? stats.total
                : tab.value === "PENDING"
                ? stats.pending
                : tab.value === "APPROVED"
                ? stats.approved
                : stats.rejected;

            return (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#FF6600] text-white shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-[#0000001A]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] md:w-80">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by krafter name, email, or UUID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-[#0000001A] bg-white py-2 pl-9 pr-3 text-xs text-black outline-none transition focus:border-[#FF6600]"
          />
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
          <p className="font-semibold">Failed to load work eligibility submissions</p>
          <p className="mt-1 text-[11px] text-rose-600">
            {error?.message || "An unexpected error occurred while communicating with the verification server."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-xs font-bold underline hover:text-rose-900"
          >
            Try again
          </button>
        </div>
      )}

      {/* Submissions Table */}
      <div className="overflow-hidden rounded-2xl border border-[#0000001A] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#0000001A] bg-[#F6F6F6] text-[11px] font-bold uppercase tracking-wider text-slate-700">
                <th className="px-6 py-4">Krafter</th>
                <th className="px-6 py-4">User ID</th>
                <th className="px-6 py-4">Document Type</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0000001A]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin text-[#FF6600]" />
                    Loading work eligibility submissions...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <UserCheck className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                    <p className="font-medium text-black">No submissions found</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {searchQuery
                        ? "No results matching your search query. Try clearing the search."
                        : "There are currently no submissions under this filter."}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((sub: WorkEligibilitySubmission, idx: number) => {
                  const krafterLabel = getKrafterLabel(sub);
                  const docHref = getDocumentHref(sub);
                  const rawDate = sub.createdAt ?? sub.updatedAt;
                  const formattedDate = rawDate
                    ? new Date(rawDate).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—";

                  const isRowEven = idx % 2 === 0;

                  return (
                    <tr
                      key={sub.id}
                      className={`transition-colors hover:bg-orange-50/40 ${
                        isRowEven ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]"
                      }`}
                    >
                      {/* Krafter Name & Avatar */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-xs font-extrabold text-[#FF6600]">
                            {krafterLabel.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-black text-xs">{krafterLabel}</div>
                            {sub.userId && (
                              <div className="text-[10px] text-slate-600">ID: {sub.userId.slice(0, 8)}…</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* User ID with Copy */}
                      <td className="px-6 py-3.5">
                        {sub.userId ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-700">
                              {sub.userId.slice(0, 10)}…
                            </span>
                            <button
                              onClick={() => handleCopy(sub.userId!, sub.id)}
                              className="text-slate-400 hover:text-black transition-colors"
                              title="Copy full UUID"
                            >
                              {copiedId === sub.id ? (
                                <Check className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Document Type & File Preview */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            {sub.documentUrl ? "Verification Document" : "Standard ID"}
                          </span>
                          {docHref && (
                            <a
                              href={docHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0000FF] hover:underline"
                              title="Open original document"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Submitted At */}
                      <td className="px-6 py-3.5">
                        <span className="text-slate-700 text-[11px] whitespace-nowrap">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        {sub.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {sub.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Approved
                          </span>
                        )}
                        {sub.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          href={`/admin/work-eligibility/${sub.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6600] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
                        >
                          Review Application
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          total={filteredSubmissions.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
