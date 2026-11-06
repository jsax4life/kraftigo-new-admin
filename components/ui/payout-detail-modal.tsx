"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Wallet,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  CreditCard
} from "lucide-react";
import type { PayoutRow } from "@/types/financials";

function getStatusBadgeStyle(status?: string | null) {
  const norm = (status ?? "PENDING").toUpperCase();
  switch (norm) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "PROCESSING":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "PENDING":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ON_HOLD":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "CANCELLED":
    case "FAILED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export function PayoutDetailModal({
  payout,
  isOpen,
  onClose
}: {
  payout: PayoutRow | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !payout || typeof document === "undefined") return null;

  const refCode = payout.reference || payout.code || `#PO-${payout.id.slice(0, 8)}`;
  const recipient =
    payout.recipientName ||
    payout.krafterName ||
    payout.name ||
    payout.email ||
    "Artisan Account";

  const formattedAmount =
    payout.amount != null
      ? String(payout.amount).startsWith("£")
        ? String(payout.amount)
        : `£${Number(payout.amount).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`
      : "£0.00";

  const destinationLabel =
    payout.destination ||
    payout.bankName ||
    (payout.ibanLast4 ? `IBAN ending in ${payout.ibanLast4}` : "Stripe Connect");

  const statusText = payout.status || "PENDING";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-[#0000001A] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#0000001A] bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 border border-orange-100 text-[#FF6600]">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-garet font-[850] text-black">
                Payout Details
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {refCode}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Amount and Status Hero */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F6F6F6] border border-[#0000001A]">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Payout Amount
              </div>
              <div className="text-2xl font-mabry font-black text-black mt-0.5">
                {formattedAmount}
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold uppercase tracking-wider ${getStatusBadgeStyle(
                statusText
              )}`}
            >
              {statusText === "COMPLETED" ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock className="h-3.5 w-3.5" />
              )}
              {statusText}
            </span>
          </div>

          {/* Recipient Details */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Beneficiary
            </div>
            <div className="p-4 rounded-2xl bg-[#F6F6F6] border border-[#0000001A] space-y-2.5">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm font-bold text-black">{recipient}</span>
              </div>
              {payout.email && (
                <div className="text-xs text-slate-600 pl-6.5 font-medium">
                  {payout.email}
                </div>
              )}
            </div>
          </div>

          {/* Destination Details */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payout Destination
            </div>
            <div className="p-4 rounded-2xl bg-[#F6F6F6] border border-[#0000001A] space-y-2">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                <span className="text-sm font-semibold text-black">
                  {destinationLabel}
                </span>
              </div>
              {payout.bankName && (
                <div className="text-xs text-slate-500 pl-6.5">
                  Bank: {payout.bankName}
                </div>
              )}
              {payout.ibanLast4 && (
                <div className="text-xs text-slate-500 pl-6.5 font-mono">
                  IBAN ending in •••• {payout.ibanLast4}
                </div>
              )}
            </div>
          </div>

          {/* Timeline / Dates */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ledger Timestamps
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#F6F6F6] border border-[#0000001A]">
                <div className="text-[11px] text-slate-500 font-medium">Requested At</div>
                <div className="text-xs font-bold text-black mt-1">
                  {payout.requestedAt || payout.createdAt || "—"}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#F6F6F6] border border-[#0000001A]">
                <div className="text-[11px] text-slate-500 font-medium">Processed At</div>
                <div className="text-xs font-bold text-black mt-1">
                  {payout.processedAt || (statusText === "COMPLETED" ? "Processed" : "Pending")}
                </div>
              </div>
            </div>
          </div>

          {/* Note / Memo */}
          {payout.note && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900 space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <FileText className="h-3.5 w-3.5" /> Note
              </div>
              <p>{payout.note}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#0000001A] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#F6F6F6] px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
