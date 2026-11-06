"use client";

import React, { use, useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Info,
  MapPin,
  CreditCard,
  Check,
  Edit2,
  Loader2,
  Trash2,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  Search
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActionModal } from "@/components/ui/action-modal";
import { RestrictAccountModal } from "@/components/ui/restrict-account-modal";
import { BookingHistoryModal } from "@/components/ui/booking-history-modal";
import { PaymentHistoryModal } from "@/components/ui/payment-history-modal";
import { PaginationBar } from "@/components/ui/pagination-bar";
import { useAlertModal } from "@/components/ui/alert-modal";
import {
  useCustomerDetail,
  usePatchCustomer,
  useSendCustomerPasswordReset,
  useRestrictCustomer,
  useLiftCustomerRestriction,
  useDeleteCustomer,
  useCustomerActivityLogs,
  useCustomerPaymentMethods
} from "@/hooks/useCustomers";
import { customersService } from "@/services/customers.service";
import type { CustomerActivityType, CustomerTimeRange } from "@/types/customers";

export default function CustomerDetailsPage({
  params
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const unwrappedParams =
    typeof (params as any)?.then === "function"
      ? use(params as Promise<{ id: string }>)
      : (params as { id: string });
  const customerId = unwrappedParams.id;

  const { showAlert, AlertModalComponent } = useAlertModal();

  // Queries & Mutations
  const {
    data: customer,
    isLoading: isCustomerLoading,
    isError,
    error
  } = useCustomerDetail(customerId);

  const { data: paymentMethodsData, isLoading: isPaymentMethodsLoading } =
    useCustomerPaymentMethods(customerId);
  const paymentMethods = paymentMethodsData?.items ?? [];

  const patchCustomerMutation = usePatchCustomer();
  const resetPasswordMutation = useSendCustomerPasswordReset();
  const restrictMutation = useRestrictCustomer();
  const liftRestrictionMutation = useLiftCustomerRestriction();
  const deleteMutation = useDeleteCustomer();

  // Dropdown & Modal States
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"reset" | "delete" | null>(null);
  const [isRestrictModalOpen, setIsRestrictModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false);

  // Editable Form Fields
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Activity Logs Query & Filter States
  const [logPage, setLogPage] = useState(1);
  const [logSearch, setLogSearch] = useState("");
  const [debouncedLogSearch, setDebouncedLogSearch] = useState("");
  const [logType, setLogType] = useState<CustomerActivityType>("all");
  const [logTimeRange, setLogTimeRange] = useState<CustomerTimeRange>("all_time");
  const [isExportingLogs, setIsExportingLogs] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLogSearch(logSearch);
      setLogPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [logSearch]);

  const {
    data: activityLogsData,
    isLoading: isActivityLogsLoading,
    isFetching: isActivityLogsFetching
  } = useCustomerActivityLogs(customerId, {
    page: logPage,
    limit: 10,
    activityType: logType,
    search: debouncedLogSearch,
    timeRange: logTimeRange
  });

  const logs = activityLogsData?.data ?? [];
  const logTotalCount = activityLogsData?.total ?? 0;
  const logTotalPages =
    activityLogsData?.totalPages ??
    Math.max(1, Math.ceil(logTotalCount / 10));

  // Sync state when customer data loads
  useEffect(() => {
    if (customer?.account) {
      setEmail(customer.account.email?.value ?? "");
      setPhone(customer.account.phone ?? "");
      setAddress(customer.account.verifiedAddress ?? "");
    }
  }, [customer]);

  const header = customer?.header;
  const account = customer?.account;
  const stats = account?.stats;
  const isRestricted =
    header?.status?.toUpperCase() === "RESTRICTED" ||
    header?.status?.toUpperCase() === "SUSPENDED";
  const isFlagged = header?.status?.toUpperCase() === "FLAGGED";

  // Check if form was modified
  const isFormDirty =
    email !== (account?.email?.value ?? "") ||
    phone !== (account?.phone ?? "") ||
    address !== (account?.verifiedAddress ?? "");

  // Handlers
  const handleSaveContactInfo = async () => {
    if (!isFormDirty) return;
    try {
      await patchCustomerMutation.mutateAsync({
        id: customerId,
        dto: {
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          serviceAddress: address.trim()
            ? { street: address.trim() }
            : undefined
        }
      });
      setIsEditing(false);
      showAlert({
        title: "Profile Updated",
        message: "Customer contact info has been successfully saved.",
        type: "success"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile";
      showAlert({ title: "Update Failed", message: msg, type: "error" });
    }
  };

  const handleSendPasswordReset = async () => {
    try {
      await resetPasswordMutation.mutateAsync(customerId);
      setActiveModal(null);
      showAlert({
        title: "Password Reset Sent",
        message: "A password reset email has been dispatched to the customer.",
        type: "success"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email";
      showAlert({ title: "Reset Failed", message: msg, type: "error" });
    }
  };

  const handleLiftRestriction = async () => {
    try {
      await liftRestrictionMutation.mutateAsync(customerId);
      showAlert({
        title: "Restriction Lifted",
        message: "The customer account restriction has been removed.",
        type: "success"
      });
      setActiveDropdown(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to lift restriction";
      showAlert({ title: "Action Failed", message: msg, type: "error" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteMutation.mutateAsync(customerId);
      setActiveModal(null);
      showAlert({
        title: "Account Deleted",
        message: "Customer account has been successfully removed.",
        type: "success"
      });
      router.push("/admin/customers");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete account";
      showAlert({ title: "Delete Failed", message: msg, type: "error" });
    }
  };

  const handleMoveAccountData = async () => {
    try {
      await customersService.moveAccountData(customerId);
      showAlert({
        title: "Account Data Moved",
        message: "Customer account data has been successfully moved.",
        type: "success"
      });
    } catch (err: any) {
      showAlert({
        title: "Move Account Data",
        message: err?.message || "Move account data feature is not yet supported by the server.",
        type: "info"
      });
    }
  };

  const handleExportActivityLogs = async () => {
    try {
      setIsExportingLogs(true);
      await customersService.exportActivityLogs(customerId, {
        activityType: logType,
        search: debouncedLogSearch,
        timeRange: logTimeRange
      });
      showAlert({
        title: "Export Completed",
        message: "Customer activity logs have been downloaded as CSV.",
        type: "success"
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to export logs";
      showAlert({ title: "Export Failed", message: msg, type: "error" });
    } finally {
      setIsExportingLogs(false);
    }
  };

  const getActivityLogIcon = (type: string, title: string) => {
    const t = (type || "").toLowerCase();
    const lowerTitle = (title || "").toLowerCase();
    if (lowerTitle.includes("cancel")) {
      return <Image src="/cancel.svg" alt="Cancel" width={35} height={35} />;
    }
    if (t === "booking" || lowerTitle.includes("book")) {
      return <Image src="/book.svg" alt="Booking" width={35} height={35} />;
    }
    if (
      t === "account" ||
      lowerTitle.includes("password") ||
      lowerTitle.includes("auth") ||
      lowerTitle.includes("register") ||
      lowerTitle.includes("created")
    ) {
      return <Image src="/pass.svg" alt="Account" width={35} height={35} />;
    }
    if (
      lowerTitle.includes("admin") ||
      lowerTitle.includes("shield") ||
      lowerTitle.includes("restrict")
    ) {
      return <Image src="/sheild.svg" alt="Admin" width={35} height={35} />;
    }
    return <Image src="/change.svg" alt="Activity" width={35} height={35} />;
  };

  // Spend display helper
  const totalSpendFormatted = (() => {
    if (!stats?.totalSpend) return "£0";
    if (typeof stats.totalSpend === "object") {
      if ("formatted" in stats.totalSpend && stats.totalSpend.formatted) {
        return stats.totalSpend.formatted;
      }
      const val = (stats.totalSpend as { value?: number }).value ?? 0;
      const curr =
        (stats.totalSpend as { currency?: string }).currency === "USD" ? "$" : "£";
      return `${curr}${val.toLocaleString()}`;
    }
    return String(stats.totalSpend);
  })();

  if (isCustomerLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl py-24 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF6600]" />
        <p className="mt-3 text-sm font-semibold text-slate-500">
          Loading customer profile…
        </p>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="mx-auto w-full max-w-7xl py-12 font-sans">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <h2 className="text-base font-bold mb-1">Failed to Load Customer</h2>
          <p className="text-xs">{error?.message ?? "Customer not found."}</p>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 mt-4 text-xs font-bold text-[#FF6600] hover:underline"
          >
            <ChevronLeft className="h-4 w-4" /> Return to Customers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12 font-sans bg-white text-black mt-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#0B0B0B66] mb-3">
            <Link href="/admin/customers" className="hover:text-slate-800 transition-colors">
              Customers
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{header?.name || "Customer details"}</span>
          </div>
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline"
          >
            <ChevronLeft className="h-4 w-4 border border-[#FF6600] rounded-md" /> Back
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="flex flex-wrap items-start justify-between gap-6 pt-2">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-[#0000001A]">
            {header?.profilePhotoUrl ? (
              <img
                src={header.profilePhotoUrl}
                alt={header.name || "Customer"}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/login.jpg";
                }}
              />
            ) : (
              <Image src="/images/login.jpg" alt={header?.name || "Customer"} fill className="object-cover" />
            )}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-garet font-[850] text-black">
                {header?.name || "Customer"}
              </h1>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className={`h-4 w-4 ${
                      header?.rating && header.rating >= i
                        ? "text-[#FF6600]"
                        : "text-slate-200"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-[#00000080] text-xs font-medium ml-1">
                  ({header?.rating ?? 0})
                </span>
              </div>
            </div>
            <div>
              <div className="mt-1 flex items-center gap-3 text-[14px] text-[#00000080]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {header?.location || "No location specified"}
                </span>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold mt-1.5 ${
                  account?.email?.verified
                    ? "bg-[#FFF0E5] text-[#FF6600]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {account?.email?.verified ? "Verified" : "Unverified"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-8 text-right text-[13px]">
            <div>
              <div className="text-[#00000099]">Account Creation Date</div>
              <div className="text-black font-semibold mt-0.5">
                {header?.accountCreationDate || header?.createdAt
                  ? new Date(header.accountCreationDate || header.createdAt!).toLocaleDateString()
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-[#00000099]">Last Active</div>
              <div className="text-black font-semibold mt-0.5">
                {header?.lastActive
                  ? new Date(header.lastActive).toLocaleDateString()
                  : "—"}
              </div>
            </div>
          </div>

          <div className="flex gap-2 relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === "admin" ? null : "admin")}
              className="flex items-center gap-1 rounded-lg bg-[#0000FF] px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              Admin Actions <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => {
                if (isRestricted) {
                  handleLiftRestriction();
                } else {
                  setIsRestrictModalOpen(true);
                }
              }}
              disabled={restrictMutation.isPending || liftRestrictionMutation.isPending}
              className={`rounded-lg px-4 py-2.5 text-xs font-bold transition-colors ${
                isRestricted
                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  : "bg-[#C80A0A1A] text-[#C80A0A] hover:bg-[#FFD6D6]"
              }`}
            >
              {isRestricted ? "Lift Restriction" : "Restrict Account"}
            </button>

            {/* Admin Actions Dropdown Menu */}
            {activeDropdown === "admin" && (
              <div className="absolute right-0 top-12 w-52 rounded-xl border border-[#0000001A] bg-white shadow-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex flex-col text-[12px] font-semibold text-slate-700">
                  <button
                    onClick={() => {
                      setActiveModal("reset");
                      setActiveDropdown(null);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    Send Password Reset
                  </button>
                  <button
                    onClick={() => {
                      setActiveDropdown(null);
                      handleMoveAccountData();
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    Move Account Data
                  </button>
                  <button
                    onClick={() => {
                      setActiveModal("delete");
                      setActiveDropdown(null);
                    }}
                    className="flex items-center gap-2 px-4 py-3 text-left hover:bg-rose-50 text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Alert Banners */}
      {isFlagged && (
        <div className="flex items-center justify-between rounded-xl border border-[#FFAE00] bg-[#FFAE001A] p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">
              This account has been flagged for administrative review.
            </span>
          </div>
        </div>
      )}

      {isRestricted && (
        <div className="flex items-center justify-between rounded-xl border border-[#C80A0A] bg-[#C80A0A1A] p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-semibold text-rose-800">
              This account is currently restricted from platform bookings.
            </span>
          </div>
          <button
            onClick={handleLiftRestriction}
            className="text-xs font-bold text-rose-700 hover:underline"
          >
            Lift Restriction
          </button>
        </div>
      )}

      {/* Account Information Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-garet font-[850] text-black">Account Information</h2>
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Edit2 className="w-3 h-3 text-[#FF6600]" />
            {isEditing ? "Cancel Edit" : "Edit Details"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-[#0000001A] bg-white p-5 flex flex-col justify-between h-28 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Bookings</span>
              <Info className="h-4 w-4 text-black" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-mabry font-extrabold text-black">
                {stats?.totalBookings ?? 0}
              </div>
              {stats?.bookingsAdminPath ? (
                <Link
                  href={stats.bookingsAdminPath}
                  className="text-[11px] font-bold text-black underline hover:text-slate-700"
                >
                  View Bookings
                </Link>
              ) : (
                <button
                  onClick={() => setIsBookingModalOpen(true)}
                  className="text-[11px] font-bold text-black underline hover:text-slate-700"
                >
                  View Bookings
                </button>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#0000001A] bg-white p-5 flex flex-col justify-between h-28 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
              <span>Total Spend</span>
              <Info className="h-4 w-4 text-black" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-mabry font-extrabold text-black">
                {totalSpendFormatted}
              </div>
              {stats?.paymentsAdminPath && (
                <Link
                  href={stats.paymentsAdminPath}
                  className="text-[11px] font-bold text-black underline hover:text-slate-700"
                >
                  View History
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Contact Fields Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-6">
          {/* Email */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1.5">
              Email Address
            </div>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              />
            ) : (
              <div className="text-sm font-bold text-slate-800">
                {account?.email?.value || "—"}
              </div>
            )}
            <div className="mt-1.5 inline-flex border border-[#FFDB561A] rounded-full bg-[#FF6600] px-2 py-0.5 text-[10px] font-bold text-white">
              {account?.email?.verified ? "Verified" : "Unverified"}
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1.5">
              Phone Number
            </div>
            {isEditing ? (
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              />
            ) : (
              <div className="text-sm font-bold text-slate-800">
                {account?.phone || "—"}
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1.5">
              Verified Address
            </div>
            {isEditing ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#FF6600]"
              />
            ) : (
              <div className="text-sm font-bold text-slate-800">
                {account?.verifiedAddress || "—"}
              </div>
            )}
          </div>

          {/* User ID */}
          <div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#00000099] mb-1.5">
              User ID
            </div>
            <div className="text-sm font-mono font-bold text-slate-800">
              {customer.displayUserId || account?.userId || customer.id}
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleSaveContactInfo}
              disabled={!isFormDirty || patchCustomerMutation.isPending}
              className="rounded-lg bg-[#FF6600] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {patchCustomerMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Payment Methods Card (Connected to /api/admin/customers/{id}/payment-methods) */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-xl font-garet font-[850] text-black mb-3">Payment Methods</h2>
          {isPaymentMethodsLoading ? (
            <div className="text-xs text-slate-500 py-2">Loading payment methods…</div>
          ) : paymentMethods.length > 0 ? (
            <ul className="space-y-3">
              {paymentMethods.map((pm, i) => (
                <li key={pm.id || i} className="flex items-center gap-3 text-sm font-medium text-slate-800">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                  <span>{pm.name || `${pm.brand || "Card"} •••• ${pm.last4 || "4242"}`}</span>
                  {pm.isDefault && <span className="text-[10px] text-slate-500 italic">Default</span>}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-[13px] text-[#00000099] font-medium pt-1">
              No added Payment Methods
            </div>
          )}
        </div>
        <button
          onClick={() => setIsPaymentHistoryModalOpen(true)}
          className="rounded-lg bg-black px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-sm"
        >
          View payment history
        </button>
      </div>

      {/* Activity Logs Card (Connected to /api/admin/customers/{id}/activity-logs) */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-garet font-[850] text-black">Activity Logs</h2>
          <div className="flex flex-wrap items-center gap-3">
            {/* Export Button */}
            <button
              onClick={handleExportActivityLogs}
              disabled={isExportingLogs}
              className="flex items-center gap-1.5 rounded-lg bg-[#FF66001A] hover:bg-[#FF660033] px-3 py-1.5 text-[11px] font-bold text-black transition-colors"
            >
              {isExportingLogs ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Image src="/export.svg" alt="Export" width={14} height={14} />
              )}
              Export Logs
            </button>

            {/* Time Range Selector */}
            <select
              value={logTimeRange}
              onChange={(e) => {
                setLogTimeRange(e.target.value as CustomerTimeRange);
                setLogPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-[#F9F9F9] px-2.5 py-1.5 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              <option value="all_time">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_7_days">Last 7 Days</option>
            </select>

            {/* Activity Type Selector */}
            <select
              value={logType}
              onChange={(e) => {
                setLogType(e.target.value as CustomerActivityType);
                setLogPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-[#F9F9F9] px-2.5 py-1.5 text-[11px] font-semibold text-black outline-none focus:border-[#FF6600]"
            >
              <option value="all">All Types</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="account">Account</option>
              <option value="review">Reviews</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Search logs…"
                className="w-44 rounded-lg border border-slate-200 bg-[#F9F9F9] py-1.5 pl-8 pr-2 text-[11px] font-medium text-slate-800 outline-none focus:border-[#FF6600]"
              />
            </div>
          </div>
        </div>

        {/* Logs List */}
        {isActivityLogsLoading ? (
          <div className="py-16 text-center text-xs text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-[#FF6600] mx-auto mb-2" />
            Loading activity logs…
          </div>
        ) : logs.length > 0 ? (
          <>
            <div className="p-6 space-y-4">
              {logs.map((log, index) => (
                <div key={log.id || index} className="flex gap-4">
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="z-10">{getActivityLogIcon(log.type, log.title)}</div>
                    {index !== logs.length - 1 && (
                      <div className="absolute top-[35px] bottom-[-24px] w-[1px] bg-slate-200 z-0" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="font-bold text-black text-[13px]">{log.title}</div>
                    <div className="mt-0.5 text-xs text-slate-600">{log.description}</div>
                  </div>
                  <div className="text-[10px] font-medium text-slate-400 whitespace-nowrap mt-1">
                    {new Date(log.occurredAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <PaginationBar
              page={logPage}
              totalPages={logTotalPages}
              total={logTotalCount}
              pageSize={10}
              onPageChange={setLogPage}
              isLoading={isActivityLogsFetching}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <Image src="/empty.svg" alt="Empty logs" width={120} height={160} />
            <p className="text-xs font-semibold text-slate-500 mt-3">
              No activity logs recorded yet.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      <ActionModal
        isOpen={activeModal === "reset"}
        onClose={() => setActiveModal(null)}
        title="Send Password Reset?"
        description={`This will send an automated password reset email to ${account?.email?.value || "the customer"}.`}
        primaryButtonText="Send Reset Email"
        primaryButtonClasses="bg-[#0000FF] hover:bg-blue-700 text-white font-semibold"
        primaryButtonAction={handleSendPasswordReset}
      />

      <ActionModal
        isOpen={activeModal === "delete"}
        onClose={() => setActiveModal(null)}
        title="Delete Customer Account?"
        titleClasses="text-rose-600 font-bold"
        description="This will permanently deactivate and delete this customer account. This action cannot be undone."
        primaryButtonText="Delete Account"
        primaryButtonClasses="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
        primaryButtonAction={handleDeleteAccount}
        countdownSeconds={5}
      />

      <RestrictAccountModal
        isOpen={isRestrictModalOpen}
        onClose={() => setIsRestrictModalOpen(false)}
        user={{ name: header?.name, id: customerId }}
        isLoading={restrictMutation.isPending}
        onConfirm={async (payload) => {
          try {
            await restrictMutation.mutateAsync({
              id: customerId,
              payload: {
                duration: payload.duration.toLowerCase().replace(/\s+/g, "_"),
                reason: payload.reason.toLowerCase().replace(/\s+/g, "_"),
                reasonDetail: payload.comments,
                adminNotes: payload.comments,
                notifyUser: payload.notifyUser
              }
            });
            setIsRestrictModalOpen(false);
            showAlert({
              title: "Account Restricted",
              message: "The customer account restriction has been applied.",
              type: "warning"
            });
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to restrict account";
            showAlert({ title: "Action Failed", message: msg, type: "error" });
          }
        }}
      />

      <BookingHistoryModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />

      <PaymentHistoryModal
        isOpen={isPaymentHistoryModalOpen}
        onClose={() => setIsPaymentHistoryModalOpen(false)}
        customerId={customerId}
        customerName={header?.name}
      />

      <AlertModalComponent />
    </div>
  );
}
