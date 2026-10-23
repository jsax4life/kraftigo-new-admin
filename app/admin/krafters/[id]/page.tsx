"use client";

import React, { use, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  Info,
  Search,
  MapPin,
  CreditCard,
  Edit2,
  Loader2,
  Trash2,
  KeyRound,
  ShieldAlert,
  Check
} from "lucide-react";
import { ActionModal } from "@/components/ui/action-modal";
import { RestrictAccountModal } from "@/components/ui/restrict-account-modal";
import {
  useKrafterDetail,
  usePatchKrafter,
  useSendKrafterPasswordReset,
  useRestrictKrafter,
  useLiftKrafterRestriction,
  useKrafterActivityLogs,
  useKrafterPaymentMethods
} from "@/hooks/useKrafters";
import { kraftersService } from "@/services/krafters.service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function KrafterDetailsPage(props: PageProps) {
  const resolvedParams = use(props.params);
  const krafterId = resolvedParams.id;

  // Detail Query
  const {
    data: detail,
    isLoading: isDetailLoading,
    isError,
    error
  } = useKrafterDetail(krafterId);

  // Mutations
  const patchKrafterMutation = usePatchKrafter();
  const sendPasswordResetMutation = useSendKrafterPasswordReset();
  const restrictMutation = useRestrictKrafter();
  const liftRestrictionMutation = useLiftKrafterRestriction();

  // Activity Logs state
  const [activityPage, setActivityPage] = useState(1);
  const [activitySearch, setActivitySearch] = useState("");
  const [debouncedActivitySearch, setDebouncedActivitySearch] = useState("");
  const [activityType, setActivityType] = useState("all");
  const [timeRange, setTimeRange] = useState("all_time");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedActivitySearch(activitySearch);
      setActivityPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [activitySearch]);

  const { data: activityLogsData, isLoading: isLogsLoading } =
    useKrafterActivityLogs(krafterId, {
      page: activityPage,
      limit: 10,
      activityType: activityType === "all" ? undefined : activityType,
      search: debouncedActivitySearch || undefined,
      timeRange
    });

  // Payment Methods
  const { data: paymentMethodsData } = useKrafterPaymentMethods(krafterId);

  // Modals and UI dropdowns
  const [activeModal, setActiveModal] = useState<"reset" | "delete" | "restrict" | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Editable Form Fields
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [occupationInput, setOccupationInput] = useState("");
  const [uniqueSellingPointInput, setUniqueSellingPointInput] = useState("");
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [actionErrorMsg, setActionErrorMsg] = useState<string | null>(null);
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  // Sync state from query
  useEffect(() => {
    if (detail) {
      setEmailInput(detail.account.email.value || "");
      setPhoneInput(detail.account.phone || "");
      setBioInput(detail.account.bio || "");
      setOccupationInput(detail.account.occupationDescription || "");
      setUniqueSellingPointInput(detail.account.uniqueSellingPoint || "");
    }
  }, [detail]);

  // Close menus on outside click
  useEffect(() => {
    const close = () => setActiveDropdown(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const showSuccessNotice = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const showErrorNotice = (msg: string) => {
    setActionErrorMsg(msg);
    setTimeout(() => setActionErrorMsg(null), 4000);
  };

  const handleSaveAccountInfo = async () => {
    try {
      await patchKrafterMutation.mutateAsync({
        id: krafterId,
        dto: {
          email: emailInput.trim() || undefined,
          phone: phoneInput.trim() || undefined,
          bio: bioInput.trim() || undefined
        }
      });
      setIsEditingAccount(false);
      showSuccessNotice("Account information updated successfully.");
    } catch (err) {
      console.error("Failed to update account info:", err);
    }
  };

  const handleSaveWorkInfo = async () => {
    try {
      await patchKrafterMutation.mutateAsync({
        id: krafterId,
        dto: {
          occupationDescription: occupationInput.trim() || undefined,
          uniqueSellingPoint: uniqueSellingPointInput.trim() || undefined
        }
      });
      setIsEditingWork(false);
      showSuccessNotice("Work and eligibility details updated successfully.");
    } catch (err) {
      console.error("Failed to update work info:", err);
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      await sendPasswordResetMutation.mutateAsync(krafterId);
      setActiveModal(null);
      showSuccessNotice("Password reset email sent to Krafter.");
    } catch (err) {
      console.error("Failed to send password reset:", err);
    }
  };

  const handleLiftRestriction = async () => {
    try {
      await liftRestrictionMutation.mutateAsync(krafterId);
      showSuccessNotice("Account restriction lifted.");
    } catch (err) {
      console.error("Failed to lift restriction:", err);
    }
  };

  const handleExportActivityLogs = async () => {
    try {
      setIsExportingLogs(true);
      await kraftersService.exportActivityLogs(krafterId, {
        activityType: activityType === "all" ? undefined : activityType,
        search: debouncedActivitySearch || undefined,
        timeRange
      });
    } catch (err) {
      console.error("Failed to export activity logs:", err);
    } finally {
      setIsExportingLogs(false);
    }
  };

  if (isDetailLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500 font-sans">
        <Loader2 className="h-6 w-6 animate-spin mr-3 text-[#FF6600]" />
        <span>Loading Krafter profile…</span>
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 font-sans">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          <h2 className="text-lg font-bold">Failed to load Krafter</h2>
          <p className="mt-1 text-sm">{error?.message ?? "Krafter not found."}</p>
          <Link
            href="/admin/krafters"
            className="mt-4 inline-block text-sm font-semibold text-[#FF6600] underline"
          >
            ← Back to Krafters Directory
          </Link>
        </div>
      </div>
    );
  }

  const { header, account, skillOfferings } = detail;
  const isRestricted = header.status === "RESTRICTED";
  const activityLogs = activityLogsData?.data ?? [];
  const logsTotal = activityLogsData?.total ?? 0;
  const logsTotalPages = activityLogsData?.totalPages ?? 1;

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto font-sans text-black">
      {/* Toast Notice */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-white shadow-xl text-sm font-semibold animate-fade-in">
          <Check className="h-4 w-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}
      {actionErrorMsg && (
        <div className="fixed top-5 right-5 z-[100] flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-white shadow-xl text-sm font-semibold animate-fade-in">
          <Info className="h-4 w-4" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* Breadcrumbs & Back */}
      <div className="flex flex-col gap-4">
        <div className="text-xs text-[#0B0B0B66] flex items-center gap-2">
          <Link href="/admin/krafters" className="hover:underline">
            Krafters
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium">Krafter details</span>
        </div>
        <Link
          href="/admin/krafters"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#FF6600] hover:underline"
        >
          <ChevronLeft className="h-4 w-4 border border-[#FF6600] rounded-md" /> Back
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 flex-shrink-0">
            <Image
              src={header.profilePhotoUrl || "/images/login.jpg"}
              alt={header.displayName || header.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-garet font-bold text-slate-900">
                {header.displayName || header.name}
              </h1>
              {header.rating != null && (
                <div className="flex items-center gap-0.5 text-xs font-bold text-[#FF6600]">
                  <Star className="h-3.5 w-3.5 fill-[#FF6600]" />
                  <span>{header.rating}</span>
                </div>
              )}
            </div>
            <div>
              <div className="mt-0.5 flex items-center gap-2 text-[13px] text-slate-600">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{header.location || "No address provided"}</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    header.verified
                      ? "bg-[#FFF0E5] text-[#FF6600]"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {header.verified ? "Verified" : "Unverified"}
                </span>
                {header.primaryTrade && (
                  <span className="inline-flex items-center rounded-full bg-[#0000FF1A] px-2.5 py-0.5 text-[10px] font-bold text-[#0000FF]">
                    {header.primaryTrade}
                  </span>
                )}
                {isRestricted && (
                  <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700">
                    Restricted
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:items-end gap-4">
          <div className="flex flex-col sm:flex-row gap-6 text-xs text-slate-600">
            {header.joinedDate && (
              <div className="flex flex-col md:items-end gap-0.5">
                <span className="text-slate-400 font-medium">Joined Date</span>
                <span className="font-semibold text-black">
                  {new Date(header.joinedDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {header.lastActive && (
              <div className="flex flex-col md:items-end gap-0.5">
                <span className="text-slate-400 font-medium">Last Active</span>
                <span className="font-semibold text-black">
                  {new Date(header.lastActive).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(activeDropdown === "admin" ? null : "admin");
              }}
              className="flex items-center gap-1 rounded-lg bg-[#0000FF] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Admin Actions <ChevronDown className="h-3 w-3" />
            </button>

            {isRestricted ? (
              <button
                onClick={handleLiftRestriction}
                disabled={liftRestrictionMutation.isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                Lift Restriction
              </button>
            ) : (
              <button
                onClick={() => setActiveModal("restrict")}
                className="rounded-lg bg-[#C80A0A1A] px-4 py-2.5 text-xs font-bold text-[#C80A0A] hover:bg-[#FFD6D6] transition-colors"
              >
                Restrict Account
              </button>
            )}

            {/* Admin Actions Dropdown */}
            {activeDropdown === "admin" && (
              <div
                className="absolute right-0 top-12 w-48 rounded-lg border border-slate-200 bg-white shadow-xl overflow-hidden z-20 text-[13px] font-medium text-slate-800"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    setActiveModal("reset");
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100"
                >
                  <KeyRound className="h-4 w-4 text-slate-500" />
                  Send Password Reset
                </button>
                <button
                  onClick={() => {
                    setActiveModal("delete");
                    setActiveDropdown(null);
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Warning Banner if Restricted */}
      {isRestricted && (
        <div className="flex items-center justify-between rounded-xl border border-rose-300 bg-rose-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <span className="text-xs font-medium text-rose-800">
              This Krafter account has an active restriction applied.
            </span>
          </div>
          <button
            onClick={handleLiftRestriction}
            disabled={liftRestrictionMutation.isPending}
            className="text-xs font-bold text-rose-700 hover:underline"
          >
            Lift Now
          </button>
        </div>
      )}

      {/* Account Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="rounded-xl p-4 border border-[#0000001A] bg-[#F6F6F6] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Total Earnings</span>
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="text-xl font-mabry font-bold text-slate-900 mt-1">
            {account.stats.totalEarnings.formatted ||
              `£${account.stats.totalEarnings.value.toLocaleString()}`}
          </span>
        </div>

        {/* Completed Krafts */}
        <div className="rounded-xl p-4 border border-[#0000001A] bg-[#F6F6F6] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Completed Jobs</span>
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="text-xl font-mabry font-bold text-slate-900 mt-1">
            {account.stats.totalKraftsCompleted.toLocaleString()}
          </span>
        </div>

        {/* Completion Rate */}
        <div className="rounded-xl p-4 border border-[#0000001A] bg-[#F6F6F6] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Completion Rate</span>
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="text-xl font-mabry font-bold text-slate-900 mt-1">
            {account.stats.completionRate}%
          </span>
        </div>

        {/* User ID */}
        <div className="rounded-xl p-4 border border-[#0000001A] bg-[#F6F6F6] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Krafter ID</span>
            <Info className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-mono font-bold text-slate-900 mt-2 truncate">
            {detail.displayUserId || account.userId || krafterId}
          </span>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-garet font-bold text-slate-900">Account Information</h2>
          {!isEditingAccount ? (
            <button
              onClick={() => setIsEditingAccount(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6600] hover:underline"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Information
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingAccount(false)}
                className="text-xs font-semibold text-slate-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccountInfo}
                disabled={patchKrafterMutation.isPending}
                className="flex items-center gap-1 rounded bg-[#FF6600] px-3 py-1 text-xs font-semibold text-white hover:bg-[#e65c00] disabled:opacity-50"
              >
                {patchKrafterMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                )}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Email Address</span>
            {isEditingAccount ? (
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="rounded border border-slate-300 p-2 text-sm bg-white outline-none focus:border-[#FF6600]"
              />
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {account.email.value || "—"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    account.email.verified
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {account.email.verified ? "Verified" : "Unverified"}
                </span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Phone Number</span>
            {isEditingAccount ? (
              <input
                type="text"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="rounded border border-slate-300 p-2 text-sm bg-white outline-none focus:border-[#FF6600]"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-900">
                {account.phone || "—"}
              </span>
            )}
          </div>

          {/* Verified Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs text-slate-500 font-medium">Verified Address</span>
            <span className="text-sm text-slate-900 font-medium">
              {account.verifiedAddress || header.location || "No verified address recorded."}
            </span>
          </div>

          {/* User Bio */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs text-slate-500 font-medium">Artisan Bio</span>
            {isEditingAccount ? (
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={3}
                className="rounded border border-slate-300 p-2 text-sm bg-white outline-none focus:border-[#FF6600] resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {account.bio || "No bio provided."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Work & Eligibility Card */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-garet font-bold text-slate-900">Work & Profile Details</h2>
          {!isEditingWork ? (
            <button
              onClick={() => setIsEditingWork(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#FF6600] hover:underline"
            >
              <Edit2 className="h-3.5 w-3.5" /> Edit Work Info
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingWork(false)}
                className="text-xs font-semibold text-slate-600 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkInfo}
                disabled={patchKrafterMutation.isPending}
                className="flex items-center gap-1 rounded bg-[#FF6600] px-3 py-1 text-xs font-semibold text-white hover:bg-[#e65c00] disabled:opacity-50"
              >
                {patchKrafterMutation.isPending && (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                )}
                Save
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
          {/* Occupation */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Occupation</span>
            {isEditingWork ? (
              <input
                type="text"
                value={occupationInput}
                onChange={(e) => setOccupationInput(e.target.value)}
                className="rounded border border-slate-300 p-2 text-sm bg-white outline-none focus:border-[#FF6600]"
              />
            ) : (
              <span className="text-sm font-semibold text-slate-900">
                {account.occupationDescription || "Not specified"}
              </span>
            )}
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Languages Spoken</span>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {account.languages.length > 0 ? (
                account.languages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {lang}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500 font-medium">None listed</span>
              )}
            </div>
          </div>

          {/* Unique Selling Point */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <span className="text-xs text-slate-500 font-medium">Unique Selling Point</span>
            {isEditingWork ? (
              <textarea
                value={uniqueSellingPointInput}
                onChange={(e) => setUniqueSellingPointInput(e.target.value)}
                rows={2}
                className="rounded border border-slate-300 p-2 text-sm bg-white outline-none focus:border-[#FF6600] resize-none"
              />
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {account.uniqueSellingPoint || "None provided."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Skills and Pricing Card */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col gap-4">
        <h2 className="text-lg font-garet font-bold text-slate-900">Skills & Pricing Offerings</h2>
        {skillOfferings.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">No specific skill offerings registered yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {skillOfferings.map((skill, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl px-5 py-3 border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-[#FF6600]" />
                  <span className="text-sm font-semibold text-slate-900">
                    {skill.serviceCategoryName || "Service Offering"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-900">
                  {skill.pricingType === "HOURLY"
                    ? `£${skill.hourlyRate ?? 0}/hr`
                    : skill.pricingType === "FLAT"
                    ? `£${skill.flatRate ?? 0} Flat Rate`
                    : skill.hourlyRate
                    ? `£${skill.hourlyRate}/hr`
                    : "Flexible"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Methods Card */}
      <div className="bg-[#F6F6F6] rounded-2xl p-6 border border-[#0000001A] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-garet font-bold text-slate-900">Saved Payout Methods</h2>
          <div className="flex flex-col gap-2">
            {!paymentMethodsData?.items.length ? (
              <span className="text-xs text-slate-500">No payout cards or bank accounts configured.</span>
            ) : (
              paymentMethodsData.items.map((pm, idx) => (
                <div key={pm.id ?? idx} className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    {pm.brand || "Card"} ending in {pm.last4 || "••••"}
                  </span>
                  {pm.isDefault && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-700 font-bold">
                      Default
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Activity Logs Section */}
      <div className="rounded-xl border border-[#0000001A] bg-[#F6F6F6] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <h2 className="text-xl font-garet font-[850] text-black">Krafter Activity Logs</h2>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportActivityLogs}
              disabled={isExportingLogs}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {isExportingLogs ? (
                <>
                  Exporting <Loader2 className="h-3 w-3 animate-spin text-black" />
                </>
              ) : (
                <>
                  Export Logs <Image src="/export.svg" alt="Export" width={14} height={14} />
                </>
              )}
            </button>

            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => {
                setTimeRange(e.target.value);
                setActivityPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              <option value="all_time">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_7_days">Last 7 Days</option>
            </select>

            {/* Activity Type Filter */}
            <select
              value={activityType}
              onChange={(e) => {
                setActivityType(e.target.value);
                setActivityPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payouts</option>
              <option value="account">Account Changes</option>
              <option value="review">Reviews</option>
            </select>

            {/* Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                placeholder="Search activity..."
                className="w-44 rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2 text-[11px] outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {isLogsLoading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading activity logs…</div>
        ) : activityLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Image src="/empty.svg" alt="Empty logs" width={100} height={100} />
            <p className="mt-2 text-xs text-slate-500">No activity recorded for this criteria.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 px-6 py-3">
                <div className="flex-1">
                  <div className="font-bold text-black text-[13px]">{log.title}</div>
                  <div className="mt-0.5 text-[12px] text-slate-700">{log.description}</div>
                </div>
                <div className="text-[10px] font-medium text-slate-500 whitespace-nowrap mt-1">
                  {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : ""}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logs Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-[#F8F9FA] px-6 py-3 text-[11px]">
          <div className="font-bold text-black">
            Showing {activityLogs.length === 0 ? 0 : (activityPage - 1) * 10 + 1}-
            {Math.min(activityPage * 10, logsTotal)} of {logsTotal}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActivityPage((p) => Math.max(p - 1, 1))}
              disabled={activityPage <= 1}
              className="flex h-6 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="px-2 text-xs font-semibold">{activityPage} of {logsTotalPages}</span>
            <button
              onClick={() => setActivityPage((p) => (p < logsTotalPages ? p + 1 : p))}
              disabled={activityPage >= logsTotalPages}
              className="flex h-6 w-8 items-center justify-center rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <ActionModal
        isOpen={activeModal === "reset"}
        onClose={() => setActiveModal(null)}
        title="Send Password Reset?"
        description="This will send an email instructing the Krafter to securely choose a new password."
        primaryButtonText="Send Reset Link"
        primaryButtonAction={handleSendPasswordReset}
        primaryButtonClasses="bg-[#FF6600] text-white hover:bg-[#e65c00]"
      />

      {/* Restrict Account Modal */}
      <RestrictAccountModal
        isOpen={activeModal === "restrict"}
        onClose={() => setActiveModal(null)}
        user={{ name: header.displayName || header.name, id: krafterId }}
        isLoading={restrictMutation.isPending}
        onConfirm={async (payload) => {
          try {
            await restrictMutation.mutateAsync({
              id: krafterId,
              payload: {
                duration: payload.duration.toLowerCase().replace(/\s+/g, "_"),
                reason: payload.reason.toLowerCase().replace(/\s+/g, "_"),
                reasonDetail: payload.comments,
                adminNotes: payload.comments,
                notifyUser: payload.notifyUser
              }
            });
            setActiveModal(null);
            showSuccessNotice("Account restricted successfully.");
          } catch (err: any) {
            showErrorNotice(err?.message || "Failed to restrict account.");
          }
        }}
      />
    </div>
  );
}
