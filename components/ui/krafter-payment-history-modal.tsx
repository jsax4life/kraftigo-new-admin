"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, ArrowDownRight, Loader2, Calendar } from "lucide-react";
import { useKrafterPaymentHistory } from "@/hooks/useKrafters";
import { PaginationBar } from "@/components/ui/pagination-bar";

interface KrafterPaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  krafterId: string;
  krafterName?: string;
}

export function KrafterPaymentHistoryModal({
  isOpen,
  onClose,
  krafterId,
  krafterName
}: KrafterPaymentHistoryModalProps) {
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isFetching, isError, error } =
    useKrafterPaymentHistory(krafterId, { page, limit: 8 });

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const payments = data?.data ?? [];
  const total = data?.total ?? payments.length;
  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil(total / 8));

  const formatAmount = (amt: any, currency = "GBP") => {
    if (typeof amt === "number") {
      const sym = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
      return `${sym}${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (typeof amt === "string") {
      return amt.startsWith("£") || amt.startsWith("$") || amt.startsWith("€")
        ? amt
        : `£${amt}`;
    }
    if (amt && typeof amt === "object") {
      if (amt.formatted) return amt.formatted;
      const sym = (amt.currency ?? currency) === "USD" ? "$" : (amt.currency ?? currency) === "EUR" ? "€" : "£";
      return `${sym}${(amt.value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return "£0.00";
  };

  const getStatusBadge = (status?: string | null) => {
    const s = (status || "").toUpperCase();
    if (s === "COMPLETED" || s === "PAID" || s === "SUCCESS") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "PENDING" || s === "PROCESSING") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s === "FAILED" || s === "CANCELLED") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0000001A] p-5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF0E5] text-[#FF6600]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black">
                Payout & Transaction History
              </h2>
              <p className="text-xs text-[#00000099]">
                {krafterName ? `Transactions for ${krafterName}` : "Artisan disbursements and transactions"}
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-8 w-8 text-[#FF6600] animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading payment history…</p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
              Failed to load payments: {error?.message ?? "Unknown error"}
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No payment records found</h3>
              <p className="text-xs text-slate-500 mt-1">This Krafter has not completed any disbursement transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {payments.map((p, idx) => {
                const dateStr = p.date || p.createdAt;
                const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString() : "Recent";
                return (
                  <div
                    key={p.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#0000001A] bg-[#F6F6F6] p-4 hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-[#0000001A] text-slate-700 shrink-0">
                        <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-black">
                            {formatAmount(p.amount, p.currency)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${getStatusBadge(
                              p.status
                            )}`}
                          >
                            {p.status || "Completed"}
                          </span>
                        </div>
                        <p className="text-xs text-[#00000099] mt-0.5">
                          {p.description || p.type || "Payout Disbursement"}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {formattedDate}
                          </span>
                          {Boolean(p.reference || p.transactionId) && (
                            <span className="font-mono text-[10px]">
                              Ref: {String(p.reference || p.transactionId)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {Boolean(p.destination) && (
                      <div className="text-xs text-slate-600 font-medium sm:text-right shrink-0">
                        {String(p.destination)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {total > 8 && (
          <div className="p-4 border-t border-[#0000001A] bg-white">
            <PaginationBar
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={8}
              onPageChange={setPage}
              isLoading={isFetching}
            />
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
