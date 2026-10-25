"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, ArrowDownRight, Loader2, Calendar } from "lucide-react";
import { useCustomerPaymentHistory } from "@/hooks/useCustomers";
import { PaginationBar } from "@/components/ui/pagination-bar";

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName?: string;
}

export function PaymentHistoryModal({
  isOpen,
  onClose,
  customerId,
  customerName
}: PaymentHistoryModalProps) {
  const [page, setPage] = useState(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, isFetching, isError, error } =
    useCustomerPaymentHistory(customerId, { page, limit: 8 });

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
      return `${sym}${amt.toFixed(2)}`;
    }
    if (typeof amt === "string") return amt;
    if (amt && typeof amt === "object") {
      if (amt.formatted) return amt.formatted;
      const val = Number(amt.value ?? 0);
      const sym = amt.currency === "USD" ? "$" : amt.currency === "EUR" ? "€" : "£";
      return `${sym}${val.toFixed(2)}`;
    }
    return "£0.00";
  };

  const getStatusBadge = (status?: string | null) => {
    const s = (status || "completed").toLowerCase();
    if (s === "completed" || s === "paid" || s === "succeeded") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (s === "pending" || s === "processing") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (s === "failed" || s === "cancelled") {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (s === "refunded") {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#0000001A] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#0000001A]">
          <div>
            <h3 className="text-lg font-bold font-garet text-black">
              Payment History
            </h3>
            {customerName && (
              <p className="text-xs text-[#00000099] mt-0.5">
                Customer: <span className="font-semibold text-black">{customerName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-black transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF6600]" />
              <span className="text-xs font-semibold text-slate-500">
                Loading payment records…
              </span>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
              Unable to load payment history: {error?.message || "Unknown error"}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-black mb-1">
                No Payment Records
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                This customer has not made any completed transactions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((p, idx) => {
                const dateStr = p.date || p.createdAt;
                const formattedDate = dateStr
                  ? new Date(dateStr).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "—";

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
                          {p.description || p.type || "Booking Payment"}
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

                    {(p.cardLast4 || p.paymentMethod) && (
                      <div className="text-xs text-slate-600 font-medium sm:text-right shrink-0">
                        {p.paymentMethod || "Card"} {p.cardLast4 ? `•••• ${p.cardLast4}` : ""}
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
