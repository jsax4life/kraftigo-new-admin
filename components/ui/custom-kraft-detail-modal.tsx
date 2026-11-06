"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  X,
  User,
  Calendar,
  Clock,
  PoundSterling,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Tag,
  Loader2,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { useCustomKraft, useReviewCustomKraft } from "@/hooks/useKrafts";

function getStatusBadge(status?: string) {
  const norm = (status || "NEW").toUpperCase();
  switch (norm) {
    case "UNDER_REVIEW":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "REJECTED":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "APPROVED":
    case "PUBLISHED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "NEW":
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

export function CustomKraftDetailModal({
  customKraftId,
  isOpen,
  onClose
}: {
  customKraftId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    data: customKraft,
    isLoading,
    isError,
    error
  } = useCustomKraft(customKraftId ?? "");

  const reviewMutation = useReviewCustomKraft();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else {
          onClose();
        }
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      setIsRejecting(false);
      setRejectReason("");
      setSelectedPhoto(null);
      setErrorMsg(null);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, selectedPhoto]);

  if (!isOpen || !customKraftId || typeof document === "undefined") return null;

  const handleStatusChange = async (
    status: "NEW" | "UNDER_REVIEW" | "REJECTED",
    reason?: string
  ) => {
    setErrorMsg(null);
    try {
      await reviewMutation.mutateAsync({
        id: customKraftId,
        dto: {
          status,
          rejectedReason: reason
        }
      });
      setIsRejecting(false);
      setRejectReason("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update review status";
      setErrorMsg(msg);
    }
  };

  const customerName =
    customKraft?.customer?.name || customKraft?.customerName || "Customer";
  const customerEmail =
    customKraft?.customer?.email || "customer@kraftigo.app";
  const customerAvatar =
    customKraft?.customer?.avatarUrl ||
    customKraft?.customerAvatarUrl ||
    "/images/login.jpg";

  const statusText = customKraft?.status || "NEW";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-[#0000001A] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#0000001A] bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 rounded-full overflow-hidden border border-[#0000001A] bg-slate-100 shrink-0">
              <Image
                src={customerAvatar}
                alt={customerName}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-garet font-[850] text-black">
                  {customerName}
                </h2>
                <span
                  className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                    statusText
                  )}`}
                >
                  {statusText.replace("_", " ")}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {customerEmail}
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {isLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="h-8 w-8 text-[#FF6600] animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">
                Loading Custom Kraft details…
              </p>
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-600">
              Failed to load details: {error?.message ?? "Unknown error"}
            </div>
          ) : customKraft ? (
            <>
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Price & Schedule Hero */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#F6F6F6] border border-[#0000001A]">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Offer Amount
                  </div>
                  <div className="text-lg font-mabry font-black text-black mt-1">
                    {customKraft.offerAmount != null
                      ? `£${Number(customKraft.offerAmount).toLocaleString()}`
                      : "Flexible"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {customKraft.openToNegotiation
                      ? "Negotiable"
                      : "Fixed budget"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F6F6F6] border border-[#0000001A]">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Duration
                  </div>
                  <div className="text-lg font-mabry font-black text-black mt-1">
                    {customKraft.bookingHours || 1} hrs
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 capitalize">
                    {customKraft.frequency?.toLowerCase() || "Once"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#F6F6F6] border border-[#0000001A] col-span-2 sm:col-span-1">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Schedule
                  </div>
                  <div className="text-xs font-bold text-black mt-1.5 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    <span>{customKraft.scheduledDate || "Flexible"}</span>
                  </div>
                  {customKraft.scheduledTime && (
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{customKraft.scheduledTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Requirement Details
                </div>
                <div className="p-4 rounded-2xl bg-[#F6F6F6] border border-[#0000001A] text-xs leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {customKraft.description || "No specific instructions provided."}
                </div>
              </div>

              {/* Photos Gallery */}
              {customKraft.photos && customKraft.photos.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Attached Photos ({customKraft.photos.length})
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {customKraft.photos.map((url, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedPhoto(url)}
                        className="relative h-20 rounded-xl overflow-hidden border border-[#0000001A] bg-slate-100 cursor-pointer group hover:ring-2 hover:ring-[#FF6600]"
                      >
                        <img
                          src={url}
                          alt={`Attachment ${i + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Form */}
              {isRejecting && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
                  <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-600" />
                    Reject Custom Kraft
                  </div>
                  <textarea
                    rows={2}
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter rejection reason for customer/audit logs..."
                    className="w-full text-xs rounded-xl border border-rose-200 bg-white p-2.5 outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-rose-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={reviewMutation.isPending}
                      onClick={() =>
                        handleStatusChange("REJECTED", rejectReason.trim())
                      }
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                    >
                      {reviewMutation.isPending ? "Rejecting…" : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer / Review Queue Actions */}
        <div className="p-4 border-t border-[#0000001A] bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono">
            ID: {customKraftId.slice(0, 10)}…
          </div>

          <div className="flex items-center gap-2">
            {statusText === "NEW" && (
              <button
                disabled={reviewMutation.isPending}
                onClick={() => handleStatusChange("UNDER_REVIEW")}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-colors"
              >
                Move to Under Review
              </button>
            )}

            {statusText !== "REJECTED" && !isRejecting && (
              <button
                onClick={() => setIsRejecting(true)}
                className="rounded-xl bg-white border border-rose-200 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                Reject Request
              </button>
            )}

            {(statusText === "UNDER_REVIEW" || statusText === "REJECTED") && (
              <button
                disabled={reviewMutation.isPending}
                onClick={() => handleStatusChange("NEW")}
                className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset to New</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl bg-[#F6F6F6] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for photo enlarge */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="Enlarged"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>,
    document.body
  );
}
