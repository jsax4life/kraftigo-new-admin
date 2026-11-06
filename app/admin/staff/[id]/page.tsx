"use client";

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  User,
  Loader2,
  Edit2,
  Download,
  X,
  ShieldCheck,
  Mail,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { ActionModal } from "@/components/ui/action-modal";
import {
  useStaffDetail,
  useStaffActivityLogs,
  useStaffRoles,
  useActivateStaff,
  useDeactivateStaff,
  useResetStaffPassword,
  useDeleteStaff,
  useUpdateStaff
} from "@/hooks/useStaff";
import { staffService } from "@/services/staff.service";
import { useAlertModal } from "@/components/ui/alert-modal";
import { PaginationBar } from "@/components/ui/pagination-bar";
import type { StaffRole } from "@/types/staff";

export default function StaffDetailsPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const unwrappedParams =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const staffId = unwrappedParams.id;

  const { showAlert, AlertModalComponent } = useAlertModal();
  const [activeModal, setActiveModal] = useState<
    "reset" | "delete" | "edit" | "activate" | "deactivate" | null
  >(null);
  const [logPage, setLogPage] = useState(1);
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  // Queries
  const { data: staff, isLoading: isStaffLoading, isError, error } = useStaffDetail(staffId);
  const {
    data: activityLogsResult,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching
  } = useStaffActivityLogs(staffId, { page: logPage, limit: 10 });
  const { data: rolesList } = useStaffRoles();

  // Mutations
  const activateMutation = useActivateStaff();
  const deactivateMutation = useDeactivateStaff();
  const resetPasswordMutation = useResetStaffPassword();
  const deleteMutation = useDeleteStaff();
  const updateMutation = useUpdateStaff();

  // Edit form state
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<StaffRole>("ADMIN");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");

  const staffEmail =
    staff?.email ||
    (staff as any)?.cards?.email ||
    (staff as any)?.emailAddress ||
    (staff as any)?.contactEmail ||
    (staff as any)?.user?.email ||
    (staff as any)?.user?.emailAddress ||
    (staff as any)?.account?.email ||
    (staff as any)?.account?.emailAddress ||
    (staff as any)?.staff?.email ||
    (staff as any)?.staff?.user?.email ||
    "";

  useEffect(() => {
    if (staff) {
      const fullName =
        (staff as any)?.header?.name ||
        staff?.name ||
        (staff as any)?.user?.name ||
        "";
      const nameParts = fullName.trim().split(/\s+/);
      const fallbackFirstName = nameParts[0] || "";
      const fallbackLastName = nameParts.slice(1).join(" ") || "";

      setEditFirstName(staff.firstName || (staff as any)?.user?.firstName || fallbackFirstName);
      setEditLastName(staff.lastName || (staff as any)?.user?.lastName || fallbackLastName);
      setEditEmail(staffEmail);
      setEditRole(
        (staff.staffRole ||
          (staff as any)?.cards?.staffRole ||
          staff.role ||
          (staff as any)?.user?.role ||
          "ADMIN") as StaffRole
      );
      setEditPhotoUrl(
        staff.profilePhotoUrl ||
          (staff as any)?.header?.profilePhotoUrl ||
          (staff as any)?.user?.profilePhotoUrl ||
          ""
      );
    }
  }, [staff, staffEmail]);

  const isInactive =
    ((staff as any)?.accountStatus || staff?.status || "").toLowerCase() ===
    "inactive";
  const activityLogs = activityLogsResult?.items ?? [];
  const totalLogs = activityLogsResult?.meta?.total ?? activityLogs.length;
  const totalLogPages =
    activityLogsResult?.meta?.totalPages ?? Math.max(1, Math.ceil(totalLogs / 10));

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
        message: `Password reset instructions have been emailed to ${staffEmail || "the staff member"}.`,
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

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: staffId,
        data: {
          firstName: editFirstName.trim() || undefined,
          lastName: editLastName.trim() || undefined,
          email: editEmail.trim() || undefined,
          staffRole: editRole,
          profilePhotoUrl: editPhotoUrl.trim() || undefined
        }
      });
      setActiveModal(null);
      showAlert({
        title: "Profile Updated",
        message: "Staff member information was updated successfully.",
        type: "success"
      });
    } catch (err: any) {
      showAlert({
        title: "Update Failed",
        message: err?.message ?? "Failed to update staff member.",
        type: "error"
      });
    }
  };

  const handleExportLogs = async () => {
    try {
      setIsExportingLogs(true);
      await staffService.exportActivityLogs(staffId);
    } catch (err: any) {
      showAlert({
        title: "Export Failed",
        message: err?.message ?? "Failed to export staff activity logs CSV.",
        type: "error"
      });
    } finally {
      setIsExportingLogs(false);
    }
  };

  const displayName =
    (staff as any)?.header?.name ||
    staff?.name ||
    (staff as any)?.user?.name ||
    (staff?.firstName && staff?.lastName
      ? `${staff.firstName} ${staff.lastName}`
      : staff?.firstName ||
        staff?.lastName ||
        (staff as any)?.user?.firstName ||
        (staff as any)?.user?.lastName ||
        (staffEmail ? staffEmail : "Staff Details"));

  const profilePhoto =
    staff?.profilePhotoUrl ||
    (staff as any)?.header?.profilePhotoUrl ||
    (staff as any)?.user?.profilePhotoUrl ||
    null;

  const displayId =
    (staff as any)?.displayStaffId ||
    staff?.displayStaffId ||
    staff?.id ||
    staffId;

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
            {profilePhoto ? (
              <Image
                src={profilePhoto}
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
            <div className="text-[13px] font-bold text-black mt-0.5 font-mono">
              {displayId}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActiveModal("edit")}
            className="flex items-center gap-1.5 rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-2.5 text-xs font-bold text-black hover:bg-slate-200 transition-colors shadow-xs"
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit Profile
          </button>
          <button
            onClick={() => setActiveModal(isInactive ? "activate" : "deactivate")}
            disabled={activateMutation.isPending || deactivateMutation.isPending}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-colors shadow-xs ${
              isInactive
                ? "bg-[#16A34A] hover:bg-emerald-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
          >
            {isInactive ? "Activate User" : "Deactivate User"}
          </button>
          <button
            onClick={() => setActiveModal("reset")}
            className="rounded-xl px-4 py-2.5 text-xs font-bold text-white bg-[#0000FF] hover:bg-blue-700 transition-colors shadow-xs"
          >
            Reset Password
          </button>
          <button
            onClick={() => setActiveModal("delete")}
            className="rounded-xl bg-[#FF3B3B1A] px-4 py-2.5 text-xs font-bold text-[#FF3B3B] hover:bg-[#FFD6D6] transition-colors shadow-xs"
          >
            Delete Staff
          </button>
        </div>

        {/* Action Modals */}
        <ActionModal
          isOpen={activeModal === "activate"}
          onClose={() => setActiveModal(null)}
          title="Activate Staff Member?"
          titleClasses="text-[#16A34A]"
          description="Are you sure you want to reactivate this staff member? Their portal access will be restored."
          primaryButtonText="Activate Staff"
          primaryButtonClasses="bg-[#16A34A] text-white hover:bg-emerald-700"
          primaryButtonAction={async () => {
            setActiveModal(null);
            await handleToggleActive();
          }}
        />

        <ActionModal
          isOpen={activeModal === "deactivate"}
          onClose={() => setActiveModal(null)}
          title="Deactivate Staff Member?"
          titleClasses="text-amber-600"
          description="Are you sure you want to deactivate this staff account? They will temporarily lose access to the admin portal."
          primaryButtonText="Deactivate Staff"
          primaryButtonClasses="bg-amber-600 text-white hover:bg-amber-700"
          primaryButtonAction={async () => {
            setActiveModal(null);
            await handleToggleActive();
          }}
        />

        <ActionModal
          isOpen={activeModal === "reset"}
          onClose={() => setActiveModal(null)}
          title="Initiate Password Reset?"
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

        {/* Edit Staff Modal (PATCH /api/admin/staff/{id}) */}
        {activeModal === "edit" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#0000001A]">
              <div className="flex items-center justify-between border-b border-[#0000001A] pb-3 mb-4">
                <h3 className="text-lg font-bold font-garet text-black">
                  Edit Staff Profile
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="p-1 text-slate-400 hover:text-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStaff} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-black mb-1 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                      className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-3.5 py-2.5 text-xs outline-none focus:border-[#FF6600]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-black mb-1 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                      className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-3.5 py-2.5 text-xs outline-none focus:border-[#FF6600]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-black mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-3.5 py-2.5 text-xs outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-black mb-1 block">
                    Staff Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as StaffRole)}
                    className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-3.5 py-2.5 text-xs outline-none cursor-pointer focus:border-[#FF6600]"
                  >
                    {rolesList && rolesList.length > 0 ? (
                      rolesList.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="OPERATIONS">OPERATIONS</option>
                        <option value="SUPPORT">SUPPORT</option>
                        <option value="ACCOUNTING">ACCOUNTING</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-black mb-1 block">
                    Profile Photo URL <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={editPhotoUrl}
                    onChange={(e) => setEditPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-3.5 py-2.5 text-xs outline-none focus:border-[#FF6600]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0000001A]">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="rounded-xl border border-[#0000001A] bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-1.5 rounded-xl bg-[#FF6600] px-5 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {updateMutation.isPending && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-xs">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Email Address
          </div>
          <div className="text-[13px] font-bold text-black truncate" title={staffEmail || undefined}>
            {isStaffLoading ? "…" : staffEmail || "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-xs">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Role
          </div>
          <div className="text-[13px] font-bold text-black uppercase">
            {isStaffLoading
              ? "…"
              : (
                  (staff as any)?.cards?.staffRole ||
                  staff?.staffRole ||
                  staff?.role ||
                  (staff as any)?.user?.role ||
                  "ADMIN"
                ).replace(/_/g, " ")}
          </div>
        </div>
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 shadow-xs">
          <div className="text-[13px] font-medium text-[#00000099] mb-1">
            Status
          </div>
          <div className="text-[13px] font-bold text-black capitalize">
            {isStaffLoading
              ? "…"
              : (staff as any)?.accountStatus ||
                staff?.status ||
                (staff as any)?.user?.status ||
                "Active"}
          </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden shadow-xs">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#0000001A]">
          <div>
            <h2 className="text-xl font-garet font-[850] text-black">
              Activity Logs
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              History of administrative actions performed by this account
            </p>
          </div>
          <button
            onClick={handleExportLogs}
            disabled={isExportingLogs}
            className="flex items-center gap-1.5 rounded-xl border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            {isExportingLogs ? "Exporting…" : "Export Logs (CSV)"}
          </button>
        </div>

        <div className="p-6">
          {isLogsLoading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-[#FF6600]" />
              Loading activity logs…
            </div>
          ) : activityLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-slate-500">
              <Image src="/empty.svg" alt="Empty logs" width={120} height={160} />
              <p className="mt-4 font-semibold text-slate-700">No activity logs recorded yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Actions performed by this staff member will be logged automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {activityLogs.map((log: any, idx: number) => (
                <div
                  key={log.id || idx}
                  className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#0000000D] py-3.5 last:border-0 hover:bg-slate-200/40 rounded-lg transition-colors -mx-3 px-3"
                >
                  <div>
                    <div className="text-[13px] font-bold text-black mb-1">
                      {log.action || "Staff Action"}
                    </div>
                    <div className="text-xs font-medium text-[#45464D]">
                      {log.description || "Details recorded"}
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-500 whitespace-nowrap mt-2 sm:mt-0 pt-0.5">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recent"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Unified PaginationBar for Activity Logs */}
        <PaginationBar
          page={logPage}
          totalPages={totalLogPages}
          total={totalLogs}
          pageSize={10}
          onPageChange={setLogPage}
          isLoading={isLogsFetching}
        />
      </div>

      <AlertModalComponent />
    </div>
  );
}
