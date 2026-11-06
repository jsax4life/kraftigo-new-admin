"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldAlert,
  UserCheck,
  ChevronLeft
} from "lucide-react";
import { useWorkEligibilityDocument } from "@/hooks/useWorkEligibilityDocument";
import { workEligibilityService } from "@/services/work-eligibility.service";
import {
  getDocumentHref,
  getKrafterLabel
} from "@/lib/work-eligibility-display";
import type { WorkEligibilitySubmission } from "@/types/work-eligibility";

const REJECTION_MAX = 2000;

function statusBadge(status: WorkEligibilitySubmission["status"]) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        Approved
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
        <XCircle className="h-3.5 w-3.5 text-rose-600" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
      <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
      Pending Review
    </span>
  );
}

export default function WorkEligibilityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : undefined;
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useWorkEligibilityDocument(id);

  const [rejectReason, setRejectReason] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    setShowRejectForm(false);
    setRejectReason("");
    setLocalError(null);
  }, [id]);

  const reviewMutation = useMutation({
    mutationFn: ({
      id: docId,
      body
    }: {
      id: string;
      body: Parameters<typeof workEligibilityService.review>[1];
    }) => workEligibilityService.review(docId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["work-eligibility"] });
      router.push("/admin/work-eligibility");
    },
    onError: (e: Error) => {
      setLocalError(e.message || "Failed to submit review decision.");
    }
  });

  function handleApprove() {
    if (!id) return;
    setShowRejectForm(false);
    setLocalError(null);
    reviewMutation.mutate({ id, body: { status: "APPROVED" } });
  }

  function cancelReject() {
    setShowRejectForm(false);
    setRejectReason("");
    setLocalError(null);
  }

  function handleReject() {
    if (!id) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      setLocalError("A reason is required when rejecting a document.");
      return;
    }
    if (trimmed.length > REJECTION_MAX) {
      setLocalError(`Reason must be at most ${REJECTION_MAX} characters.`);
      return;
    }
    setLocalError(null);
    reviewMutation.mutate({
      id,
      body: { status: "REJECTED", rejectionReason: trimmed }
    });
  }

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const docHref = data ? getDocumentHref(data) : null;
  const krafterName = data ? getKrafterLabel(data) : "";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/admin/krafters"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#FF6600] hover:underline"
          >
            <ChevronLeft className="h-4 w-4 border border-[#FF6600] rounded-md" /> Back
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-garet font-[850] text-black">
              Work Eligibility Review
            </h1>
            {data && statusBadge(data.status)}
          </div>
          <p className="mt-1 font-mono text-[11px] text-slate-500">Document ID: {id}</p>
        </div>

        {data?.status === "PENDING" && !showRejectForm && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowRejectForm(true);
                setLocalError(null);
              }}
              disabled={reviewMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
            >
              <XCircle className="h-3.5 w-3.5" /> Reject…
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={reviewMutation.isPending}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {reviewMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Approve Verification
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-8 text-center text-slate-500">
          <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-[#FF6600]" />
          Loading document verification details...
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-xs text-rose-700">
          <p className="font-semibold">Unable to load document review</p>
          <p className="mt-1 text-[11px] text-rose-600">
            {error?.message || "The requested document could not be retrieved from the server."}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 text-xs font-bold underline hover:text-rose-900"
          >
            Retry Loading
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Main Krafter & Submission Details Card */}
          <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm">
            <div className="flex items-start justify-between border-b border-[#0000001A] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-base font-extrabold text-[#FF6600]">
                  {krafterName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-black">{krafterName}</h2>
                  <p className="text-xs text-slate-500">Krafter Applicant Verification</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Submitted
                </span>
                <p className="text-xs font-medium text-slate-700">
                  {data.createdAt || data.updatedAt
                    ? new Date(data.createdAt || data.updatedAt!).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short"
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 gap-4 pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-[#0000001A] bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  User ID (UUID)
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-800 truncate">
                    {data.userId || "—"}
                  </span>
                  {data.userId && (
                    <button
                      onClick={() => handleCopy(data.userId!, "userId")}
                      className="text-slate-400 hover:text-black transition-colors"
                      title="Copy user ID"
                    >
                      {copiedField === "userId" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#0000001A] bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document Reference ID
                </span>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-800 truncate">
                    {data.id}
                  </span>
                  <button
                    onClick={() => handleCopy(data.id, "docId")}
                    className="text-slate-400 hover:text-black transition-colors"
                    title="Copy document ID"
                  >
                    {copiedField === "docId" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-[#0000001A] bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Review Status
                </span>
                <div className="mt-2">{statusBadge(data.status)}</div>
              </div>

              <div className="rounded-xl border border-[#0000001A] bg-white p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document File
                </span>
                <div className="mt-1 flex items-center gap-2">
                  {docHref ? (
                    <a
                      href={docHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#FF6600] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-orange-600 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open Full Document
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No URL available in file record</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rejection notice if previously rejected */}
            {data.rejectionReason && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <div className="flex items-center gap-2 text-rose-800 text-xs font-bold mb-1">
                  <ShieldAlert className="h-4 w-4" />
                  Previous Rejection Reason
                </div>
                <p className="text-xs text-rose-700 whitespace-pre-wrap leading-relaxed">
                  {data.rejectionReason}
                </p>
              </div>
            )}
          </div>

          {/* Action / Decision Card (when PENDING) */}
          {data.status === "PENDING" && (
            <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                Verification Decision
              </h2>

              {(localError || reviewMutation.isError) && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  {localError ||
                    (reviewMutation.error instanceof Error
                      ? reviewMutation.error.message
                      : "Review request failed")}
                </div>
              )}

              {!showRejectForm ? (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={reviewMutation.isPending}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {reviewMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Approve Krafter Eligibility
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRejectForm(true);
                      setLocalError(null);
                    }}
                    disabled={reviewMutation.isPending}
                    className="flex items-center gap-2 rounded-xl border border-rose-300 bg-white px-5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Document…
                  </button>
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-rose-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      Reason for Rejection <span className="text-rose-600">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {rejectReason.length} / {REJECTION_MAX} characters
                    </span>
                  </div>
                  <textarea
                    className="min-h-[110px] w-full rounded-xl border border-slate-300 p-3 text-xs text-black outline-none transition focus:border-rose-500"
                    placeholder="Provide a clear explanation for why this document or identity proof is rejected..."
                    value={rejectReason}
                    maxLength={REJECTION_MAX}
                    onChange={(e) => setRejectReason(e.target.value)}
                    aria-label="Rejection reason"
                  />
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={cancelReject}
                      disabled={reviewMutation.isPending}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      disabled={reviewMutation.isPending}
                      className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                      {reviewMutation.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {data.status !== "PENDING" && (
            <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-4 text-xs text-slate-600">
              This submission was already marked as{" "}
              <strong className="text-black capitalize">{data.status.toLowerCase()}</strong>. No further review action is needed.
            </div>
          )}

          {/* Serialized Raw Data Collapsible Drawer */}
          <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex w-full items-center justify-between p-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Raw Document Payload</span>
              {showRawJson ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {showRawJson && (
              <div className="border-t border-[#0000001A] bg-white p-4">
                <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 font-mono text-[11px] text-slate-200">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
