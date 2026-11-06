"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, Calendar, Link2, Tag, Eye } from "lucide-react";
import type {
  CarouselBanner,
  CreateCarouselBannerDto,
  UpdateCarouselBannerDto
} from "@/types/marketing";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: CarouselBanner | null;
  onSave: (
    data: CreateCarouselBannerDto | { id: string; dto: UpdateCarouselBannerDto }
  ) => Promise<void>;
  isLoading: boolean;
}

export function BannerModal({
  isOpen,
  onClose,
  banner,
  onSave,
  isLoading
}: BannerModalProps) {
  const isEditing = Boolean(banner);
  const [mounted, setMounted] = useState(false);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (banner) {
      setTitle(banner.title || "");
      setImageUrl(banner.imageUrl || "");
      setScheduleStart(
        banner.scheduleStart ? banner.scheduleStart.slice(0, 16) : ""
      );
      setScheduleEnd(
        banner.scheduleEnd ? banner.scheduleEnd.slice(0, 16) : ""
      );
      setCtaLabel(banner.ctaLabel || "");
      setCtaUrl(banner.ctaUrl || "");
      setIsEnabled(banner.isEnabled ?? true);
      setSortOrder(banner.sortOrder ?? 0);
    } else {
      setTitle("");
      setImageUrl("");
      const now = new Date();
      setScheduleStart(now.toISOString().slice(0, 16));
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setScheduleEnd(nextMonth.toISOString().slice(0, 16));
      setCtaLabel("");
      setCtaUrl("");
      setIsEnabled(true);
      setSortOrder(0);
    }
    setImgError(false);
  }, [banner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim() || !scheduleStart) return;

    const payload: CreateCarouselBannerDto = {
      title: title.trim(),
      imageUrl: imageUrl.trim(),
      scheduleStart: new Date(scheduleStart).toISOString(),
      scheduleEnd: scheduleEnd ? new Date(scheduleEnd).toISOString() : null,
      ctaLabel: ctaLabel.trim() || null,
      ctaUrl: ctaUrl.trim() || null,
      isEnabled,
      sortOrder: Number(sortOrder) || 0
    };

    if (banner) {
      await onSave({ id: banner.id, dto: payload });
    } else {
      await onSave(payload);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-garet font-[850] text-black">
              {isEditing ? "Edit Carousel Banner" : "New Carousel Banner"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure hero banner display, schedule, and customer action.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-black rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Banner Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Spring Renovation Special 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Image URL <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/... or CDN URL"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImgError(false);
                }}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
              />
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Recommended aspect ratio 16:9 or 21:9 (3MB max each).
            </p>
          </div>

          {/* Live Preview Box */}
          {imageUrl && !imgError && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-40 group">
              <img
                src={imageUrl}
                alt="Banner preview"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                <span className="text-xs font-semibold bg-[#FF6600] text-white px-2 py-0.5 rounded-md w-fit mb-1">
                  Preview
                </span>
                <p className="font-bold text-sm truncate">{title || "Banner Title"}</p>
                {ctaLabel && (
                  <span className="text-xs text-slate-200 underline mt-0.5">
                    CTA: {ctaLabel}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Schedule Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Start Schedule <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                End Schedule (Optional)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* CTA Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                CTA Button Label
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Claim Offer, Book Now"
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                CTA Target URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. /services/carpentry"
                  value={ctaUrl}
                  onChange={(e) => setCtaUrl(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Sort Order & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-[#F6F6F6] p-4 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={0}
                max={8}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-xl border border-slate-200 text-sm bg-white font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20"
              />
              <span className="text-[11px] text-slate-500 ml-2">Lower = First</span>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs font-semibold text-slate-800">
                Active & Visible
              </span>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isEnabled ? "bg-[#FF6600]" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 p-6 sm:p-8 py-4 border-t border-slate-100 bg-white flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-[#FF6600] text-white text-sm font-semibold hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
