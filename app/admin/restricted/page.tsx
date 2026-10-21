"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Info,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ProfileLogsModal } from "@/components/ui/profile-logs-modal";
import { RestrictAccountModal } from "@/components/ui/restrict-account-modal";
import {
  useRestrictedUsers,
  useRestrictedUsersSummary,
  useRestrictUser,
  useLiftRestriction
} from "@/hooks/useRestrictedUsers";
import { restrictedUsersService } from "@/services/restricted-users.service";
import { useAlertModal } from "@/components/ui/alert-modal";
import type {
  RestrictedDuration,
  RestrictedReason,
  RestrictedUserPeriod,
  RestrictedUserRow,
  RestrictedUserType
} from "@/types/restricted-users";

function toDurationEnum(dur: string): RestrictedDuration {
  const map: Record<string, RestrictedDuration> = {
    "24 Hours": "24_hours",
    "48 Hours": "48_hours",
    "1 week": "1_week",
    "2 weeks": "2_weeks",
    "1 Month": "1_month",
    "3 Months": "3_months",
    "Permanent Restriction": "permanent",
    "Flag Account": "flag_account"
  };
  return map[dur] ?? "1_month";
}

function toReasonEnum(reason: string): RestrictedReason {
  const map: Record<string, RestrictedReason> = {
    "Multiple Policy Violations": "multiple_policy_violations",
    "Suspicious Payment Activity": "suspicious_payment_activity",
    "Terms of Service Breach": "terms_of_service_breach",
    "Repeated Negative Feedback": "repeated_negative_feedback",
    "Other": "other",
    "Terms Violation": "terms_violation",
    "Suspicious Activity": "suspicious_activity",
    "Poor Ratings": "poor_ratings"
  };
  return map[reason] ?? "other";
}

export default function RestrictedListPage() {
  const router = useRouter();
  const { showAlert, AlertModalComponent } = useAlertModal();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [userType, setUserType] = useState<RestrictedUserType>("all");
  const [period, setPeriod] = useState<RestrictedUserPeriod>("all_time");

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RestrictedUserRow | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>("1 Month");
  const [isExporting, setIsExporting] = useState(false);

  // Queries
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError
  } = useRestrictedUsersSummary();

  const {
    data: usersData,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError
  } = useRestrictedUsers({
    page,
    limit: 10,
    search: searchQuery.trim() || undefined,
    userType: userType === "all" ? undefined : userType,
    period: period === "all_time" ? undefined : period
  });

  const restrictMutation = useRestrictUser();
  const liftMutation = useLiftRestriction();

  const users = usersData?.items ?? [];
  const total = usersData?.meta?.total ?? 0;
  const totalPages =
    usersData?.meta?.totalPages ?? Math.max(1, Math.ceil(total / 10));

  const toggleDropdown = (id: string) => {
    setActiveDropdown((prev) => (prev === id ? null : id));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await restrictedUsersService.exportCsv({
        search: searchQuery.trim() || undefined,
        userType: userType === "all" ? undefined : userType,
        period: period === "all_time" ? undefined : period
      });
    } catch (err: any) {
      showAlert({
        title: "Export Failed",
        message: err?.message ?? "Failed to export restricted list CSV.",
        type: "error"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleLift = async (user: RestrictedUserRow) => {
    const targetUserId = user.userId || user.id;
    if (!targetUserId) return;
    try {
      await liftMutation.mutateAsync({ userId: targetUserId });
      showAlert({
        title: "Restriction Lifted",
        message: `Successfully lifted restriction for ${user.name || "user"}.`,
        type: "success"
      });
    } catch (err: any) {
      showAlert({
        title: "Action Failed",
        message: err?.message ?? "Failed to lift restriction.",
        type: "error"
      });
    }
  };

  const handleConfirmRestrict = async (payload: {
    duration: string;
    reason: string;
    comments: string;
    notifyUser: boolean;
  }) => {
    const targetUserId = selectedUser?.userId || selectedUser?.id;
    if (!targetUserId) return;

    try {
      await restrictMutation.mutateAsync({
        userId: targetUserId,
        data: {
          duration: toDurationEnum(payload.duration),
          reason: toReasonEnum(payload.reason),
          adminNotes: payload.comments || undefined,
          notifyUser: payload.notifyUser
        }
      });
      showAlert({
        title: "Account Restricted",
        message: `Restriction applied to ${selectedUser?.name || "user"}.`,
        type: "success"
      });
    } catch (err: any) {
      showAlert({
        title: "Restriction Failed",
        message: err?.message ?? "Failed to apply restriction.",
        type: "error"
      });
    }
  };

  return (
    <div className="space-y-5 pb-10">
      {/* Breadcrumbs */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs text-[#0B0B0B66]">
          <span className="text-slate-500">User Management</span>
          <span>/</span>
          <span className="text-slate-800">Restricted List</span>
        </div>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline w-fit"
        >
          <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
        </button>
      </div>

      <h1 className="text-2xl font-garet font-bold">Restricted Users</h1>

      {isSummaryError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
          Failed to load summary stats: {summaryError?.message ?? "Unknown error"}
        </div>
      )}

      {/* Stats Cards (Connected to GET /api/admin/restricted-users/summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">System Flagged</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">
            {isSummaryLoading ? "…" : (summaryData?.systemFlagged?.value ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Currently Restricted</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">
            {isSummaryLoading
              ? "…"
              : (summaryData?.currentlyRestricted?.value ?? 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-[#F6F6F6] rounded-2xl p-4 flex flex-col gap-3 relative border border-[#0000001A]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Resolved Today</span>
            <Info className="h-4 w-4" />
          </div>
          <span className="text-2xl font-semibold font-mabry">
            {isSummaryLoading ? "…" : (summaryData?.resolvedToday?.value ?? 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#F6F6F6] rounded-2xl border border-[#0000001A] overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-bold">Restricted List</h2>
          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 hover:text-slate-900 font-medium disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Exporting…" : "Export List"}
              <Image src="/export.svg" alt="Download" width={14} height={14} />
            </button>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as RestrictedUserPeriod);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none cursor-pointer font-medium text-slate-700"
            >
              <option value="all_time">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
            <select
              value={userType}
              onChange={(e) => {
                setUserType(e.target.value as RestrictedUserType);
                setPage(1);
              }}
              className="bg-transparent border-none outline-none cursor-pointer font-medium text-slate-700"
            >
              <option value="all">All Users</option>
              <option value="krafter">Krafters Only</option>
              <option value="customer">Customers Only</option>
            </select>
            <div className="flex items-center gap-2 bg-white border border-[#0000001A] rounded-lg px-3 py-1.5 ml-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent outline-none w-24 sm:w-32 text-slate-700 placeholder:text-slate-400"
              />
              <span className="text-[10px] text-slate-400 font-medium">/</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] border-collapse min-w-[800px]">
            <thead className="text-[#00000066] text-[12px]">
              <tr>
                <th className="font-medium px-6 py-4 w-[15%]">User</th>
                <th className="font-medium px-6 py-4 w-[10%]">Type</th>
                <th className="font-medium px-6 py-4 w-[45%]">Flag Reason</th>
                <th className="font-medium px-6 py-4 w-[15%]">Status</th>
                <th className="font-medium px-6 py-4 w-[15%] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0000001A]">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                    Loading restricted users…
                  </td>
                </tr>
              ) : isUsersError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-rose-500">
                    Failed to load restricted users: {usersError?.message ?? "Unknown error"}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-500">
                    No restricted users found matching the selected filters.
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const userName =
                    user.name || user.krafterName || user.customerName || user.email || `User #${user.id.slice(0, 6)}`;
                  const userKind = (user.type || user.userType || "Krafter").toLowerCase() === "customer" ? "Customer" : "Krafter";
                  const reasonTitle = user.reasonTitle || user.reason || "Policy Violation";
                  const reasonsList = Array.isArray(user.reasons)
                    ? user.reasons
                    : typeof user.reasons === "string"
                    ? [user.reasons]
                    : user.reasonDetail
                    ? [user.reasonDetail]
                    : [];

                  const statusText = user.status || "Restricted";
                  const isLiftAction = user.action === "Lift Restriction" || statusText.toLowerCase().includes("ban") || statusText.toLowerCase().includes("permanent");

                  return (
                    <tr
                      key={user.id}
                      className={`cursor-pointer hover:bg-slate-100 transition-colors ${
                        index % 2 === 0 ? "bg-[#DFDFDF]/40" : "bg-[#F6F6F6]"
                      }`}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsProfileModalOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900 align-top pt-5">
                        <div>{userName}</div>
                        {user.email && <div className="text-[11px] text-slate-500">{user.email}</div>}
                      </td>
                      <td className="px-6 py-4 align-top pt-5">
                        <span
                          className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-bold text-white ${
                            userKind === "Krafter" ? "bg-[#0000FF]" : "bg-[#FF6600]"
                          }`}
                        >
                          {userKind}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top pt-5">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-[#C80A0A]">{reasonTitle}</span>
                          {reasonsList.length > 0 && (
                            <ul className="list-disc list-outside pl-4 text-slate-800 space-y-1 text-xs">
                              {reasonsList.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top pt-5">
                        <span className={user.statusColor || "font-semibold text-slate-900"}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top pt-5 text-right relative">
                        <div className="flex items-center justify-end gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                              setIsProfileModalOpen(true);
                            }}
                            title="View Profile Logs"
                            className="p-1 hover:opacity-80 transition-opacity"
                          >
                            <Image src="/glass.svg" alt="View logs" width={17} height={17} />
                          </button>
                          {isLiftAction ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLift(user);
                              }}
                              className="font-bold text-slate-900 hover:text-black hover:underline whitespace-nowrap text-xs transition-colors"
                            >
                              Lift Restriction
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(user.id);
                              }}
                              className="font-bold text-[#FF1E1E] hover:opacity-80 whitespace-nowrap text-xs transition-opacity"
                            >
                              Restrict
                            </button>
                          )}
                        </div>

                        {/* Dropdown Menu for Duration */}
                        {activeDropdown === user.id && (
                          <div className="absolute right-6 top-10 w-44 bg-[#F8F8F8] border border-[#0000001A] shadow-lg rounded-xl z-20 flex flex-col overflow-hidden text-left">
                            <div className="px-4 py-3 font-bold text-xs bg-slate-100 border-b border-[#0000000D]">
                              Select Duration
                            </div>
                            {[
                              "24 Hours",
                              "48 Hours",
                              "1 week",
                              "2 weeks",
                              "1 Month",
                              "3 Months",
                              "Permanent Restriction"
                            ].map((dur, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDuration(dur);
                                  setSelectedUser(user);
                                  setIsRestrictModalOpen(true);
                                  setActiveDropdown(null);
                                }}
                                className="px-4 py-2.5 text-xs hover:bg-slate-200 transition-colors text-left border-b border-[#0000000D] last:border-0"
                              >
                                {dur}
                              </button>
                            ))}
                          </div>
                        )}
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
            Showing {users.length === 0 ? 0 : (page - 1) * 10 + 1}-{Math.min(page * 10, total)} of {total}
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

      <ProfileLogsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
      />

      <RestrictAccountModal
        isOpen={isRestrictModalOpen}
        onClose={() => setIsRestrictModalOpen(false)}
        user={selectedUser}
        duration={selectedDuration}
        isLoading={restrictMutation.isPending}
        onConfirm={handleConfirmRestrict}
      />

      <AlertModalComponent />
    </div>
  );
}
