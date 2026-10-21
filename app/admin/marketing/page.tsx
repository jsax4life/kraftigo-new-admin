"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Layers,
  Ticket,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Calendar,
  ExternalLink,
  Copy,
  Check,
  TrendingUp,
  Users,
  Briefcase,
  Clock,
  AlertCircle,
  Percent,
  CheckCircle2,
  Info
} from "lucide-react";
import {
  useMarketingSummary,
  useCarouselBanners,
  useCreateCarouselBanner,
  useUpdateCarouselBanner,
  useDeleteCarouselBanner,
  useCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon
} from "@/hooks/useMarketing";
import type {
  MarketingPeriod,
  CarouselBanner,
  CreateCarouselBannerDto,
  UpdateCarouselBannerDto,
  Coupon,
  CreateCouponDto,
  UpdateCouponDto
} from "@/types/marketing";
import { BannerModal } from "@/components/marketing/banner-modal";
import { CouponModal } from "@/components/marketing/coupon-modal";
import { BannerPreviewModal } from "@/components/marketing/banner-preview-modal";
import { ActionModal } from "@/components/ui/action-modal";
import { useAlertModal } from "@/components/ui/alert-modal";

const PERIOD_OPTIONS: { label: string; value: MarketingPeriod }[] = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "Last 7 Days", value: "last_7_days" },
  { label: "Last 30 Days", value: "last_30_days" },
  { label: "All Time", value: "all_time" }
];

export default function MarketingPage() {
  const [period, setPeriod] = useState<MarketingPeriod>("this_month");
  const [activeTab, setActiveTab] = useState<"carousel" | "coupons">("carousel");

  // Alert Modal Hook
  const { showAlert, AlertModalComponent } = useAlertModal();

  // Queries
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    isError: isSummaryError
  } = useMarketingSummary(period);

  const {
    data: carouselData,
    isLoading: isCarouselLoading,
    isError: isCarouselError
  } = useCarouselBanners();

  const {
    data: couponsData,
    isLoading: isCouponsLoading,
    isError: isCouponsError
  } = useCoupons();

  // Mutations
  const createBannerMutation = useCreateCarouselBanner();
  const updateBannerMutation = useUpdateCarouselBanner();
  const deleteBannerMutation = useDeleteCarouselBanner();

  const createCouponMutation = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const deleteCouponMutation = useDeleteCoupon();

  // Modal States
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<CarouselBanner | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState<CarouselBanner | null>(null);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const [deleteBannerTarget, setDeleteBannerTarget] = useState<CarouselBanner | null>(null);
  const [deleteCouponTarget, setDeleteCouponTarget] = useState<Coupon | null>(null);

  // Copied code feedback
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Banner Actions
  const handleSaveBanner = async (
    data: CreateCarouselBannerDto | { id: string; dto: UpdateCarouselBannerDto }
  ) => {
    try {
      if ("id" in data) {
        await updateBannerMutation.mutateAsync({
          id: data.id,
          dto: data.dto
        });
      } else {
        await createBannerMutation.mutateAsync(data);
      }
      setIsBannerModalOpen(false);
      setSelectedBanner(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save carousel banner";
      showAlert({ title: "Banner Save Failed", message, type: "error" });
    }
  };

  const handleConfirmDeleteBanner = async () => {
    if (!deleteBannerTarget) return;
    try {
      await deleteBannerMutation.mutateAsync(deleteBannerTarget.id);
      setDeleteBannerTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete banner";
      showAlert({ title: "Delete Failed", message, type: "error" });
    }
  };

  // Coupon Actions
  const handleSaveCoupon = async (
    data: CreateCouponDto | { id: string; dto: UpdateCouponDto }
  ) => {
    try {
      if ("id" in data) {
        await updateCouponMutation.mutateAsync({
          id: data.id,
          dto: data.dto
        });
      } else {
        await createCouponMutation.mutateAsync(data);
      }
      setIsCouponModalOpen(false);
      setSelectedCoupon(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save coupon";
      showAlert({ title: "Coupon Save Failed", message, type: "error" });
    }
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!deleteCouponTarget) return;
    try {
      await deleteCouponMutation.mutateAsync(deleteCouponTarget.id);
      setDeleteCouponTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete coupon";
      showAlert({ title: "Delete Failed", message, type: "error" });
    }
  };

  const handleToggleCouponActive = async (coupon: Coupon) => {
    try {
      await updateCouponMutation.mutateAsync({
        id: coupon.id,
        dto: { isActive: !coupon.isActive }
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to toggle coupon status";
      showAlert({ title: "Status Update Failed", message, type: "error" });
    }
  };

  // Metrics unpack
  const metrics = summaryData?.metrics;
  const banners = carouselData?.banners ?? [];
  const maxBanners = carouselData?.maxBanners ?? 8;
  const uploadHint =
    carouselData?.uploadHint ?? "Upload up to 8 images (3MB max each).";
  const coupons = couponsData ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-slate-900 mt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-garet font-[850] text-black">
            Marketing & Ads
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-600">
            Orchestrate promotional carousel banners, discount coupons, and review marketing performance.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Window:
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as MarketingPeriod)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all focus:border-[#FF6600] focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
          >
            {PERIOD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Revenue */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Daily Revenue</span>
            <TrendingUp className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : `${metrics?.totalDailyRevenue?.currency === "GBP" ? "£" : "$"}${(metrics?.totalDailyRevenue?.value ?? 0).toLocaleString()}`}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {metrics?.totalDailyRevenue?.date
              ? `Date: ${metrics.totalDailyRevenue.date}`
              : (summaryData?.range?.label ?? "Today")}
          </div>
        </div>

        {/* New Krafter Registrations */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>New Krafters</span>
            <Users className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : (metrics?.newKrafterRegistrations?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {summaryData?.range?.label ?? "Selected time window"}
          </div>
        </div>

        {/* Active Krafts */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Active Krafts</span>
            <Briefcase className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : (metrics?.totalActiveKrafts?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            {isSummaryLoading
              ? "…"
              : `${metrics?.totalActiveKrafts?.registeredKrafters ?? 0} registered (${metrics?.totalActiveKrafts?.utilizationPercent ?? 0}% active)`}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5">
          <div className="flex items-center justify-between text-xs text-slate-900 font-medium">
            <span>Pending Approvals</span>
            <Clock className="h-4 w-4 text-black" />
          </div>
          <div className="mt-2 text-[22px] font-mabry font-extrabold text-slate-900">
            {isSummaryLoading
              ? "…"
              : (metrics?.pendingApprovals?.value ?? 0).toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium">
            Krafts awaiting verification
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("carousel")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "carousel"
                ? "bg-black text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <Layers className="w-4 h-4" />
            Carousel Banners
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "carousel"
                  ? "bg-[#FF6600] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {banners.length} / {maxBanners}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("coupons")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "coupons"
                ? "bg-black text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            <Ticket className="w-4 h-4" />
            Promo Coupons
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "coupons"
                  ? "bg-[#FF6600] text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {coupons.length}
            </span>
          </button>
        </div>

        {/* Tab specific action */}
        {activeTab === "carousel" ? (
          <button
            onClick={() => {
              setSelectedBanner(null);
              setIsBannerModalOpen(true);
            }}
            disabled={banners.length >= maxBanners}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedCoupon(null);
              setIsCouponModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Coupon
          </button>
        )}
      </div>

      {/* Tab 1: Carousel Banners View */}
      {activeTab === "carousel" && (
        <div className="space-y-6">
          {/* Upload Hint Alert */}
          <div className="flex items-center gap-3 bg-orange-50/70 border border-orange-200/60 p-4 rounded-2xl text-xs text-orange-950 font-medium">
            <Info className="w-4 h-4 text-[#FF6600] shrink-0" />
            <span>
              <strong>Banner Guidelines:</strong> {uploadHint} Configured banners are rendered in sequential priority on the customer marketplace top carousel.
            </span>
          </div>

          {/* Banners Grid or Empty State */}
          {banners.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6600] flex items-center justify-center mb-4">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-garet font-[850] text-slate-900">
                No Carousel Banners Configured
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                Promote deals, seasonal campaigns, and special Krafter spotlights on the customer home screen.
              </p>
              <button
                onClick={() => {
                  setSelectedBanner(null);
                  setIsBannerModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#e65c00] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Banner
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  {/* Banner Image Frame */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-between text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
                          Slot #{b.sortOrder}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            b.isEnabled
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-600 text-slate-200"
                          }`}
                        >
                          {b.isEnabled ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-garet font-bold text-white text-base line-clamp-1">
                          {b.title}
                        </h4>
                        {b.ctaLabel && (
                          <span className="text-[11px] text-slate-200 underline">
                            CTA: {b.ctaLabel}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Banner Info */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(b.scheduleStart).toLocaleDateString()}
                        {b.scheduleEnd
                          ? ` → ${new Date(b.scheduleEnd).toLocaleDateString()}`
                          : " (Ongoing)"}
                      </span>
                    </div>

                    {b.ctaUrl && (
                      <div className="flex items-center gap-1.5 text-xs text-[#FF6600] font-medium truncate">
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{b.ctaUrl}</span>
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setPreviewBanner(b);
                          setIsPreviewModalOpen(true);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-black py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedBanner(b);
                            setIsBannerModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteBannerTarget(b)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Delete Banner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Promo Coupons View */}
      {activeTab === "coupons" && (
        <div className="space-y-6">
          {coupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#FF6600] flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-garet font-[850] text-slate-900">
                No Promotional Coupons Available
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
                Create percent discount codes for customers to apply at checkout.
              </p>
              <button
                onClick={() => {
                  setSelectedCoupon(null);
                  setIsCouponModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#e65c00] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create First Coupon
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#F6F6F6] text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Coupon Code</th>
                      <th className="px-6 py-4">Discount</th>
                      <th className="px-6 py-4">Validity Range</th>
                      <th className="px-6 py-4">Redemptions</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map((c) => {
                      const isExpired = new Date(c.expiresAt).getTime() < Date.now();
                      const uses =
                        c.usedCount ?? c.currentUses ?? c.redemptions ?? 0;
                      return (
                        <tr
                          key={c.id}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          {/* Code */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs tracking-wider">
                                {c.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(c.code)}
                                className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                                title="Copy code"
                              >
                                {copiedCode === c.code ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Discount */}
                          <td className="px-6 py-4 font-bold text-slate-900">
                            <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg text-xs">
                              <Percent className="w-3 h-3" />
                              {c.discountPercent}% OFF
                            </span>
                          </td>

                          {/* Validity */}
                          <td className="px-6 py-4 text-xs text-slate-600">
                            <div className="font-medium">
                              {new Date(c.startsAt).toLocaleDateString()} →{" "}
                              {new Date(c.expiresAt).toLocaleDateString()}
                            </div>
                            {isExpired && (
                              <span className="text-rose-500 text-[10px] font-semibold">
                                Expired
                              </span>
                            )}
                          </td>

                          {/* Redemptions */}
                          <td className="px-6 py-4 text-xs font-medium text-slate-700">
                            {c.maxUses ? (
                              <span>
                                {uses} / {c.maxUses}
                              </span>
                            ) : (
                              <span>{uses} (Unlimited)</span>
                            )}
                          </td>

                          {/* Status Toggle */}
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => handleToggleCouponActive(c)}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                                c.isActive && !isExpired
                                  ? "bg-emerald-600"
                                  : "bg-slate-300"
                              }`}
                              title={
                                c.isActive ? "Click to disable" : "Click to enable"
                              }
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                  c.isActive && !isExpired
                                    ? "translate-x-4"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setSelectedCoupon(c);
                                  setIsCouponModalOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Edit Coupon"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteCouponTarget(c)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Delete Coupon"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Banner Create / Edit Modal */}
      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        banner={selectedBanner}
        onSave={handleSaveBanner}
        isLoading={
          createBannerMutation.isPending || updateBannerMutation.isPending
        }
      />

      {/* Banner Preview Modal */}
      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        banner={previewBanner}
      />

      {/* Coupon Create / Edit Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupon={selectedCoupon}
        onSave={handleSaveCoupon}
        isLoading={
          createCouponMutation.isPending || updateCouponMutation.isPending
        }
      />

      {/* Delete Banner Confirmation */}
      <ActionModal
        isOpen={Boolean(deleteBannerTarget)}
        onClose={() => setDeleteBannerTarget(null)}
        title="Delete Carousel Banner"
        description={`Are you sure you want to remove the banner "${deleteBannerTarget?.title}"? This banner will immediately be removed from the customer marketplace.`}
        primaryButtonText="Delete Banner"
        primaryButtonClasses="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
        primaryButtonAction={handleConfirmDeleteBanner}
      />

      {/* Delete Coupon Confirmation */}
      <ActionModal
        isOpen={Boolean(deleteCouponTarget)}
        onClose={() => setDeleteCouponTarget(null)}
        title="Delete Promo Coupon"
        description={`Are you sure you want to delete the coupon code "${deleteCouponTarget?.code}"? Customers will no longer be able to redeem this code.`}
        primaryButtonText="Delete Coupon"
        primaryButtonClasses="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
        primaryButtonAction={handleConfirmDeleteCoupon}
      />

      {/* Alert Modal */}
      <AlertModalComponent />
    </div>
  );
}
