"use client";

import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Search, ChevronDown, User, Loader2 } from "lucide-react";
import { ActionModal } from "@/components/ui/action-modal";
import {
  useStaffDetail,
  useStaffActivityLogs,
  useActivateStaff,
  useDeactivateStaff,
  useResetStaffPassword,
  useDeleteStaff
} from "@/hooks/useStaff";
import { useAlertModal } from "@/components/ui/alert-modal";

export default function StaffDetailsPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const unwrappedParams = typeof (params as any)?.then === "function" ? use(params as Promise<{ id: string }>) : (params as { id: string });
  const staffId = unwrappedParams.id;

  const { showAlert, AlertModalComponent } = useAlertModal();
  const [activeModal, setActiveModal] = React.useState<"reset" | "delete" | null>(null);

  const { data: staff, isLoading: isStaffLoading, isError, error } = useStaffDetail(staffId);
  const { data: activityLogsResult, isLoading: isLogsLoading } = useStaffActivityLogs(staffId);

  const activateMutation = useActivateStaff();
  const deactivateMutation = useDeactivateStaff();
  const resetPasswordMutation = useResetStaffPassword();
  const deleteMutation = useDeleteStaff();

  const isInactive = staff?.status?.toLowerCase() === "inactive";
  const activityLogs = activityLogsResult?.items ?? [];

  const handleToggleActive = async () => {
    try {
      if (isInactive) {
        await activateMutation.mutateAsync(staffId);
        showAlert({
          title: "Staff Activated",
          message: "Staff member has been successfully activated.",
          type: "success"
        });
      } else {
        await deactivateMutation.mutateAsync(staffId);
        showAlert({
          title: "Staff Deactivated",
          message: "Staff member has been marked as inactive.",
          type: "success"
        });
      }
    } catch (err: any) {
      showAlert({
        title: "Action Failed",
        message: err?.message ?? "Failed to update staff status.",
        type: "error"
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPasswordMutation.mutateAsync(staffId);
      setActiveModal(null);
      showAlert({
        title: "Password Reset Sent",
        message: `Password reset instructions have been emailed to ${staff?.email || "the staff member"}.`,
        type: "success"
      });
    } catch (err: any) {
      showAlert({
        title: "Reset Failed",
        message: err?.message ?? "Failed to initiate password reset.",
        type: "error"
      });
    }
  };

  const handleDeleteStaff = async () => {
    try {
      await deleteMutation.mutateAsync(staffId);
      setActiveModal(null);
      showAlert({
        title: "Staff Deleted",
        message: "Staff member account has been removed.",
        type: "success"
      });
      setTimeout(() => {
        router.push("/admin/staff");
      }, 1200);
    } catch (err: any) {
      showAlert({
        title: "Delete Failed",
        message: err?.message ?? "Failed to delete staff member.",
        type: "error"
      });
    }
  };

  const displayName =
    staff?.name ||
    (staff?.firstName && staff?.lastName
      ? `${staff.firstName} ${staff.lastName}`
      : staff?.firstName || staff?.lastName || "Staff Details");

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 font-sans bg-white text-black mt-4">
      {/* Breadcrumb & Back */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#0B0B0B66]">
          <Link href="/admin/staff" className="hover:text-slate-800">
            Staff
          </Link>
          <span>/</span>
          <span className="text-black">Staff Details</span>
        </div>
        <div className="flex items-center justify-between">
          <Link
            href="/admin/staff"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline"
          >
            <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
          </Link>
        </div>
      </div>

      {isError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
          Failed to load staff details: {error?.message ?? "Unknown error"}
        </div>
      )}

      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 py-4 relative">
        <div className="flex items-center gap-5">
          <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[#F6F6F6] overflow-hidden">
            {staff?.profilePhotoUrl ? (
              <Image
                src={staff.profilePhotoUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-[#00000066]" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-garet font-[850] text-black">
                {isStaffLoading ? "Loading…" : displayName}
              </h1>
            </div>
            <div className="mt-1 text-[13px] font-medium text-[#00000099]">
              Staff ID
            </div>
            <div className="text-[13px] font-bold text-black mt-0.5">
              {staff?.id || staffId}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            disabled={activateMutation.isPending || deactivateMutation.isPending}
            className={`rounded-xl px-5 py-3 text-xs font-bold text-white transition-colors ${
              isInactive
                ? "bg-[#16A34A] hover:bg-emerald-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isInactive ? "Activate User" : "Deactivate User"}
          </button>
          <button
            onClick={() => setActiveModal("reset")}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white bg-[#0000FF] hover:bg-blue-700 transition-colors"
          >
            Reset Password
          </button>
          <button
            onClick={() => setActiveModal("delete")}
            className="rounded-xl bg-[#FF3B3B1A] px-5 py-3 text-xs font-bold text-[#FF3B3B] hover:bg-[#FFD6D6] transition-colors"
          >
            Delete Staff
          </button>
        </div>

        {/* Modals */}
        <ActionModal
          isOpen={activeModal === "reset"}
          onClose={() => setActiveModal(null)}
          title="Initiate Send Password reset?"
          description="This will send an email prompting the staff member to configure a new password."
          primaryButtonText="Reset Password"
          primaryButtonAction={handleResetPassword}
        />

        <ActionModal
          isOpen={activeModal === "delete"}
          onClose={() => setActiveModal(null)}
          title="Delete Staff?"
          titleClasses="text-[#FF3B3B]"
          description="This will deactivate and remove this staff account. This action cannot be undone."
          primaryButtonText="Delete Staff"
          primaryButtonAction={handleDeleteStaff}
          primaryButtonClasses="bg-[#FF3B3B1A] text-[#FF3B3B] hover:bg-[#FFD6D6]"
          countdownSeconds={5}
        />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Email Address
          </div>
          <div className="text-[13px] font-bold text-black truncate">
            {isStaffLoading ? "…" : staff?.email || "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Role
          </div>
          <div className="text-[13px] font-bold text-black uppercase">
            {isStaffLoading
              ? "…"
              : (staff?.staffRole || staff?.role || "ADMIN").replace(/_/g, " ")}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Status
          </div>
          <div className="text-[13px] font-bold text-black">
            {isStaffLoading ? "…" : staff?.status || "Active"}
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-garet font-[850] text-black">
            Activity Logs
          </h2>
        </div>

        {isLogsLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Loading activity logs…
          </div>
        ) : activityLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500">
            <Image src="/empty.svg" alt="Empty logs" width={120} height={160} />
            <p className="mt-4">No recent activity logs recorded for this staff member.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {activityLogs.map((log: any, idx: number) => (
              <div
                key={log.id || idx}
                className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#0000000D] py-3 last:border-0 hover:bg-[#00000005] rounded-lg transition-colors -mx-3 px-3"
              >
                <div>
                  <div className="text-[14px] font-bold text-black mb-1">
                    {log.action || "Staff Action"}
                  </div>
                  <div className="text-[13px] font-medium text-[#45464D]">
                    {log.description || "Details recorded"}
                  </div>
                </div>
                <div className="text-[11px] font-medium text-[#00000080] whitespace-nowrap mt-2 sm:mt-0 pt-0.5">
                  {log.createdAt || "Recent"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertModalComponent />
    </div>
  );
}
