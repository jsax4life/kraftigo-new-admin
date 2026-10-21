"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import { useStaffList } from "@/hooks/useStaff";
import { staffService } from "@/services/staff.service";
import { useAlertModal } from "@/components/ui/alert-modal";
import type { StaffPeriod, StaffStatus, StaffMemberRow } from "@/types/staff";

const getRoleStyle = (role?: string | null) => {
  const normalized = (role ?? "").toUpperCase().replace(/\s+/g, "_");
  switch (normalized) {
    case "SUPER_ADMIN":
      return "bg-[#FF6600] text-white";
    case "OPERATIONS":
      return "bg-[#FFD600] text-black";
    case "SUPPORT":
      return "bg-[#0000FF] text-white";
    case "ADMIN":
      return "bg-[#9747FF] text-white";
    case "ACCOUNTING":
      return "bg-[#16A34A] text-white";
    default:
      return "bg-slate-200 text-slate-800";
  }
};

export default function StaffPage() {
  const { showAlert, AlertModalComponent } = useAlertModal();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<StaffPeriod>("this_month");
  const [status, setStatus] = useState<StaffStatus>("all");
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: staffDataResult,
    isLoading,
    isError,
    error
  } = useStaffList({
    page,
    limit: 10,
    search: search.trim() || undefined,
    period: period === "all_time" ? undefined : period,
    status: status === "all" ? undefined : status
  });

  const staffItems: StaffMemberRow[] = staffDataResult?.items ?? [];
  const total = staffDataResult?.meta?.total ?? 0;
  const totalPages =
    staffDataResult?.meta?.totalPages ?? Math.max(1, Math.ceil(total / 10));

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await staffService.exportCsv({
        search: search.trim() || undefined,
        period: period === "all_time" ? undefined : period,
        status: status === "all" ? undefined : status
      });
    } catch (err: any) {
      showAlert({
        title: "Export Failed",
        message: err?.message ?? "Failed to export staff list CSV.",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">
            Staff Management
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Oversee and manage all platform participants and staff members.
          </p>
        </div>
        <Link
          href="/admin/staff/new"
          className="rounded-lg bg-[#FF6600] px-6 py-3 text-sm font-bold text-white hover:bg-[#e65c00] transition-colors text-center"
        >
          Add new Staff
        </Link>
      </div>

      {isError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 flex items-start gap-3">
          <div className="flex-1">
            <strong className="font-bold">Staff Directory Notice:</strong>{" "}
            The staff directory service is currently returning an internal error ({error?.message || "Status 500"}). Backend developers are actively resolving this database query.
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-[850] text-black">
            Staff Directory
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-lg bg-[#F6F6F6] px-4 py-2 text-[11px] font-medium hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Exporting…" : "Export List"}
              <Image src="/export.svg" alt="Export" width={16} height={16} />
            </button>

            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as StaffPeriod);
                setPage(1);
              }}
              className="rounded-lg bg-[#F6F6F6] px-3 py-2 text-[11px] font-medium border-none outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="all_time">All Time</option>
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StaffStatus);
                setPage(1);
              }}
              className="rounded-lg bg-[#F6F6F6] px-3 py-2 text-[11px] font-medium border-none outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="active_recently">Active Recently</option>
            </select>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-48 rounded-lg border border-[#0000001A] bg-white py-2 pl-9 pr-8 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00000033]">
                /
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F6F6F6] text-[11px] text-[#00000066]">
                <tr>
                  <th className="px-6 py-5 font-medium">Staff Name</th>
                  <th className="px-6 py-5 font-medium">Email</th>
                  <th className="px-6 py-5 font-medium text-center">Role</th>
                  <th className="px-6 py-5 font-medium">Status</th>
                  <th className="px-6 py-5 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0000000D]">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                      Loading staff directory…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                      Unable to display staff directory while backend server error is being resolved.
                    </td>
                  </tr>
                ) : staffItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                      No staff members found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  staffItems.map((staff, index) => {
                    const displayName =
                      staff.name ||
                      (staff.firstName && staff.lastName
                        ? `${staff.firstName} ${staff.lastName}`
                        : staff.firstName || staff.lastName || "Staff Member");
                    const roleLabel =
                      staff.staffRole || staff.role || "ADMIN";
                    const statusLabel = staff.status || "Active";

                    return (
                      <tr
                        key={staff.id}
                        className={`hover:bg-slate-50 transition-colors ${
                          index % 2 === 0 ? "bg-[#DFDFDF]/40" : "bg-[#F6F6F6]"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center">
                              {staff.profilePhotoUrl ? (
                                <Image
                                  src={staff.profilePhotoUrl}
                                  alt={displayName}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <User className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="font-bold text-black text-[13px]">
                              {displayName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-black text-[13px]">
                          {staff.email}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${getRoleStyle(
                              roleLabel
                            )}`}
                          >
                            {roleLabel.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-black text-[13px]">
                          {statusLabel}
                        </td>
                        <td className="px-8 py-4 text-right">
                          <Link
                            href={`/admin/staff/${staff.id}`}
                            className="text-[13px] font-extrabold text-[#FF6600] hover:underline"
                          >
                            View
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
          <div className="flex items-center justify-between border-t border-[#0000001A] px-6 py-3 text-[11px]">
            <div className="font-bold text-black text-[12px]">
              Showing {staffItems.length === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}
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

      <AlertModalComponent />
    </div>
  );
}