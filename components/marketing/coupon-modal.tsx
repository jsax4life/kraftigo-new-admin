"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Ticket, Percent, Calendar, Users, CheckCircle2 } from "lucide-react";
import type {
  Coupon,
  CreateCouponDto,
  UpdateCouponDto
} from "@/types/marketing";

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  coupon?: Coupon | null;
  onSave: (
    data: CreateCouponDto | { id: string; dto: UpdateCouponDto }
  ) => Promise<void>;
  isLoading: boolean;
}

export function CouponModal({
  isOpen,
  onClose,
  coupon,
  onSave,
  isLoading
}: CouponModalProps) {
  const isEditing = Boolean(coupon);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code || "");
      setDiscountPercent(coupon.discountPercent || 10);
      setStartsAt(coupon.startsAt ? coupon.startsAt.slice(0, 16) : "");
      setExpiresAt(coupon.expiresAt ? coupon.expiresAt.slice(0, 16) : "");
      setMaxUses(coupon.maxUses != null ? String(coupon.maxUses) : "");
      setIsActive(coupon.isActive ?? true);
    } else {
      setCode("");
      setDiscountPercent(15);
      const now = new Date();
      setStartsAt(now.toISOString().slice(0, 16));
      const inOneMonth = new Date();
      inOneMonth.setDate(inOneMonth.getDate() + 30);
      setExpiresAt(inOneMonth.toISOString().slice(0, 16));
      setMaxUses("");
      setIsActive(true);
    }
  }, [coupon, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startsAt || !expiresAt) return;

    if (isEditing && coupon) {
      const updatePayload: UpdateCouponDto = {
        discountPercent: Number(discountPercent),
        startsAt: new Date(startsAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        maxUses: maxUses ? Number(maxUses) : null,
        isActive
      };
      await onSave({ id: coupon.id, dto: updatePayload });
    } else {
      if (!code.trim()) return;
      const createPayload: CreateCouponDto = {
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        startsAt: new Date(startsAt).toISOString(),
        expiresAt: new Date(expiresAt).toISOString(),
        maxUses: maxUses ? Number(maxUses) : null
      };
      await onSave(createPayload);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-5 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-garet font-[850] text-black">
              {isEditing ? `Edit Coupon: ${coupon?.code}` : "New Promo Coupon"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set discount rates, usage caps, and scheduling parameters.
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
          {/* Coupon Code */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Coupon Code <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isEditing}
                placeholder="e.g. WELCOME20, SPRING2026"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
              />
              <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
            {isEditing && (
              <p className="text-[11px] text-slate-500 mt-1">
                Coupon codes cannot be renamed once created.
              </p>
            )}
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Discount Percentage (1–100%) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                required
                min={1}
                max={100}
                placeholder="15"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-semibold text-slate-900"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Schedule Window */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Valid From <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Valid Until <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Max Uses */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Maximum Uses (Optional)
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                placeholder="Leave blank for unlimited redemptions"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6600]/20 focus:border-[#FF6600] transition-all font-medium text-slate-900"
              />
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Active Status (Editing only) */}
          {isEditing && (
            <div className="flex items-center justify-between bg-[#F6F6F6] p-4 rounded-2xl">
              <span className="text-xs font-semibold text-slate-800">
                Active & Redeemable
              </span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  isActive ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          )}

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
              {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create Coupon"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
