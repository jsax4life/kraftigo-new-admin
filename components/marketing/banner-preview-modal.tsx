"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Smartphone, Monitor, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import type { CarouselBanner } from "@/types/marketing";

interface BannerPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner: CarouselBanner | null;
}

export function BannerPreviewModal({
  isOpen,
  onClose,
  banner
}: BannerPreviewModalProps) {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !banner || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-garet font-[850] text-black">
              Banner Live Simulation
            </h2>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDevice("desktop")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  device === "desktop"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop
              </button>
              <button
                type="button"
                onClick={() => setDevice("mobile")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  device === "mobile"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Mobile
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-black rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Simulation & Details */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5 [scrollbar-width:thin] [scrollbar-color:#CBD5E1_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
          {/* Simulation Frame */}
          <div className="py-6 flex items-center justify-center bg-slate-100/70 rounded-2xl overflow-hidden">
            <div
              className={`transition-all duration-300 overflow-hidden rounded-2xl shadow-xl bg-slate-900 relative ${
                device === "desktop" ? "w-full max-w-2xl h-72" : "w-72 h-80"
              }`}
            >
              {/* Background Image */}
              <img
                src={banner.imageUrl}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 flex flex-col justify-end text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FF6600] text-white px-2.5 py-0.5 rounded-full">
                    Featured
                  </span>
                  {banner.isEnabled && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Live
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-garet font-[850] text-white leading-tight">
                  {banner.title}
                </h3>
                {banner.ctaLabel && (
                  <div className="mt-4">
                    <a
                      href={banner.ctaUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6600] text-white text-xs font-semibold hover:bg-[#e65c00] transition-colors shadow-md pointer-events-auto"
                    >
                      {banner.ctaLabel}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Banner Details Footer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs text-slate-600 border-t border-slate-100">
            <div>
              <span className="font-semibold text-slate-400 block mb-0.5">Order</span>
              <span className="font-bold text-slate-800">Slot #{banner.sortOrder}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-400 block mb-0.5">Status</span>
              <span className={banner.isEnabled ? "text-emerald-600 font-bold" : "text-slate-500 font-bold"}>
                {banner.isEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-semibold text-slate-400 block mb-0.5">Schedule</span>
              <div className="flex items-center gap-1 text-slate-700 font-medium">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>
                  {new Date(banner.scheduleStart).toLocaleDateString()}
                  {banner.scheduleEnd
                    ? ` → ${new Date(banner.scheduleEnd).toLocaleDateString()}`
                    : " (No expiry)"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
