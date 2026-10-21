"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Loader2 } from "lucide-react";
import { useStaffRoles, useCreateStaff } from "@/hooks/useStaff";
import { useAlertModal } from "@/components/ui/alert-modal";
import type { StaffRole } from "@/types/staff";

export default function CreateStaffPage() {
  const router = useRouter();
  const { showAlert, AlertModalComponent } = useAlertModal();

  const { data: roles, isLoading: isRolesLoading } = useStaffRoles();
  const createMutation = useCreateStaff();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>("ADMIN");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      showAlert({
        title: "Missing Fields",
        message: "Please fill in first name, last name, and a valid email.",
        type: "error"
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        staffRole,
        password: password.trim() || undefined
      });

      showAlert({
        title: "Staff Created",
        message: `Successfully created staff account for ${firstName} ${lastName}.`,
        type: "success"
      });

      setTimeout(() => {
        router.push("/admin/staff");
      }, 1200);
    } catch (err: any) {
      showAlert({
        title: "Failed to Create Staff",
        message:
          err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred while creating the staff member.",
        type: "error"
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Breadcrumb & Back */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#0B0B0B66]">
          <Link href="/admin/staff" className="hover:text-slate-800">
            Staff
          </Link>
          <span>/</span>
          <span className="text-black">Create new staff</span>
        </div>
        <Link
          href="/admin/staff"
          className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline"
        >
          <ChevronLeft className="h-4 w-4 border-[1px] border-[#FF6600] rounded-md" /> Back
        </Link>
      </div>

      <div className="max-w-xl">
        <h1 className="text-2xl font-garet font-[850] text-black mb-8">
          Create New User
        </h1>

        {/* Avatar Placeholder */}
        <div className="mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-dashed border-[#0000FF] bg-[#F6F6F6]">
            <User className="h-10 w-10 text-[#00000066]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-black">
                First Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter First Name"
                className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-medium text-black">
                Last Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter Last Name"
                className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-black">
              Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
            />
          </div>

          <div>
            <label className="mb-2 block text-[13px] font-medium text-black">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={staffRole}
              onChange={(e) => setStaffRole(e.target.value as StaffRole)}
              disabled={isRolesLoading}
              className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none cursor-pointer focus:border-[#FF6600]"
            >
              {isRolesLoading ? (
                <option value="ADMIN">Loading roles…</option>
              ) : roles && roles.length > 0 ? (
                roles.map((r) => (
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
            <label className="mb-2 block text-[13px] font-medium text-black">
              Initial Password <span className="text-xs text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to send password setup email automatically"
              className="w-full rounded-xl border border-[#0000001A] bg-[#F6F6F6] px-4 py-3 text-[13px] outline-none placeholder:text-[#00000066] focus:border-[#FF6600]"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              When omitted, a setup link is sent to the staff member to choose their own password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/staff")}
              className="w-full rounded-xl bg-[#0000FF] py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-[#FF6600] py-3 text-sm font-bold text-white hover:bg-[#e65c00] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {createMutation.isPending ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>

      <AlertModalComponent />
    </div>
  );
}
