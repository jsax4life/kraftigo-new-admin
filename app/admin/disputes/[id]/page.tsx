"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { JsonPanel } from "@/components/fraud/json-panel";
import { PresignedMediaList } from "@/components/fraud/presigned-media-link";
import { useDisputeEvidencePacket } from "@/hooks/useAdminDisputes";
import {
  getNoShowEventId,
  recordId,
  recordStatus
} from "@/lib/dispute-display";
import { hasFraudPreventionApiAccess } from "@/lib/fraud-prevention-auth";
import { entityLabel } from "@/lib/merge-profiles";
import { useAuth } from "@/hooks/useAuth";
import { disputesAdminService } from "@/services/disputes-admin.service";
import type {
  DisputeResolutionType,
  NoShowEvent
} from "@/types/disputes-admin";

const ADMIN_NOTE_MIN = 10;
const REVERSE_REASON_MIN = 3;

function SummaryRow({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-slate-900 py-2 sm:grid-cols-[160px_1fr] sm:gap-4">
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-xs text-slate-100">{children}</dd>
    </div>
  );
}

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);

  const disputeId = typeof params.id === "string" ? params.id : undefined;
  const {
    data: packet,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useDisputeEvidencePacket(disputeId);

  const [localError, setLocalError] = useState<string | null>(null);
  const [showResolveForm, setShowResolveForm] = useState(false);
  const [resolutionType, setResolutionType] =
    useState<DisputeResolutionType>("REFUND_CUSTOMER");
  const [refundAmount, setRefundAmount] = useState("0");
  const [artisanAmount, setArtisanAmount] = useState("0");
  const [adminNote, setAdminNote] = useState("");
  const [reverseReasons, setReverseReasons] = useState<Record<string, string>>(
    {}
  );

  const disputeStatus = useMemo(
    () => recordStatus(packet?.dispute),
    [packet?.dispute]
  );
  const bookingStatus = useMemo(
    () => recordStatus(packet?.booking),
    [packet?.booking]
  );
  const bookingId = useMemo(() => recordId(packet?.booking), [packet?.booking]);

  const canResolve =
    canAct &&
    disputeStatus !== "RESOLVING" &&
    disputeStatus !== "RESOLVED";
  const canConfirmCompletion =
    canAct && bookingStatus !== "DISPUTED" && !!bookingId;

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    if (disputeId) {
      await refetch();
    }
  };

  const reviewMutation = useMutation({
    mutationFn: () => disputesAdminService.review(disputeId!),
    onSuccess: invalidate,
    onError: (e: Error) => setLocalError(e.message)
  });

  const resolveMutation = useMutation({
    mutationFn: () =>
      disputesAdminService.resolve(disputeId!, {
        resolutionType,
        refundAmount: Number(refundAmount),
        artisanAmount: Number(artisanAmount),
        adminNote: adminNote.trim()
      }),
    onSuccess: async () => {
      setShowResolveForm(false);
      await invalidate();
      router.push("/admin/disputes");
    },
    onError: (e: Error) => setLocalError(e.message)
  });

  const confirmMutation = useMutation({
    mutationFn: () => disputesAdminService.confirmBookingCompletion(bookingId!),
    onSuccess: invalidate,
    onError: (e: Error) => setLocalError(e.message)
  });

  const reverseMutation = useMutation({
    mutationFn: ({
      eventId,
      reason
    }: {
      eventId: string;
      reason: string;
    }) => disputesAdminService.reverseNoShowStrike(eventId, { reason }),
    onSuccess: invalidate,
    onError: (e: Error) => setLocalError(e.message)
  });

  function handleResolve() {
    const note = adminNote.trim();
    if (note.length < ADMIN_NOTE_MIN) {
      setLocalError(
        `Admin note must be at least ${ADMIN_NOTE_MIN} characters.`
      );
      return;
    }
    setLocalError(null);
    resolveMutation.mutate();
  }

  function handleReverse(event: NoShowEvent) {
    const eventId = getNoShowEventId(event);
    if (!eventId) {
      setLocalError("No-show event id missing from evidence packet.");
      return;
    }
    const reason = (reverseReasons[eventId] ?? "").trim();
    if (reason.length < REVERSE_REASON_MIN) {
      setLocalError(`Reversal reason must be at least ${REVERSE_REASON_MIN} characters.`);
      return;
    }
    setLocalError(null);
    reverseMutation.mutate({ eventId, reason });
  }

  const refetchPacket = () => {
    setLocalError(null);
    refetch();
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold">Dispute review</h1>
          <p className="font-mono text-[11px] text-slate-500">{disputeId}</p>
        </div>
        <Link
          href="/admin/disputes"
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          ← Dispute queue
        </Link>
      </div>

      <FraudAccessBanner />

      {packet?.generatedAt && (
        <p className="text-[10px] text-slate-500">
          Evidence generated{" "}
          {new Date(packet.generatedAt).toLocaleString()} · presigned media
          expires in ~15 minutes —{" "}
          <button
            type="button"
            onClick={refetchPacket}
            className="text-emerald-400 underline"
          >
            refetch packet
          </button>{" "}
          if links return 403
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-slate-400">Loading evidence packet…</p>
      )}
      {isError && (
        <p className="text-xs text-rose-300">
          {error?.message ?? "Failed to load evidence"}
        </p>
      )}

      {packet && (
        <>
          <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Summary
            </h2>
            <dl>
              <SummaryRow label="Dispute status">
                {disputeStatus || "—"}
              </SummaryRow>
              <SummaryRow label="Booking status">
                {bookingStatus || "—"}
              </SummaryRow>
              <SummaryRow label="Booking ID">
                <span className="font-mono text-[11px]">{bookingId ?? "—"}</span>
              </SummaryRow>
            </dl>
          </section>

          {packet.participants?.length ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Participants
              </h2>
              <ul className="space-y-2 text-xs">
                {packet.participants.map((p) => (
                  <li key={p.id}>
                    {entityLabel(p)}{" "}
                    <span className="text-slate-500">
                      ({p.roles?.join(", ") ?? "—"})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {packet.integrity && (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Integrity
              </h2>
              <dl>
                <SummaryRow label="Start PIN verified">
                  {String(packet.integrity.startPinVerified ?? "—")}
                </SummaryRow>
                <SummaryRow label="Start location verified">
                  {String(packet.integrity.startLocationVerified ?? "—")}
                </SummaryRow>
                <SummaryRow label="Completion location verified">
                  {String(packet.integrity.completionLocationVerified ?? "—")}
                </SummaryRow>
                <SummaryRow label="Work duration (s)">
                  {packet.integrity.workDurationSeconds ?? "—"}
                </SummaryRow>
                <SummaryRow label="Before media">
                  <PresignedMediaList
                    items={packet.integrity.beforeMedia ?? []}
                    onExpired={refetchPacket}
                  />
                </SummaryRow>
                <SummaryRow label="After media">
                  <PresignedMediaList
                    items={packet.integrity.afterMedia ?? []}
                    onExpired={refetchPacket}
                  />
                </SummaryRow>
              </dl>
            </section>
          )}

          {packet.evidenceSubmissions?.length ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Evidence submissions
              </h2>
              {packet.evidenceSubmissions.map((sub, idx) => (
                <div key={idx} className="mb-3 last:mb-0">
                  <PresignedMediaList
                    items={sub.attachments ?? []}
                    onExpired={refetchPacket}
                  />
                </div>
              ))}
            </section>
          ) : null}

          {packet.chat?.messages?.length ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Chat
              </h2>
              <ul className="max-h-64 space-y-2 overflow-auto text-xs">
                {packet.chat.messages.map((msg) => (
                  <li
                    key={msg.id ?? `${msg.senderId}-${msg.createdAt}`}
                    className="rounded-lg border border-slate-800 bg-slate-950/60 p-2"
                  >
                    <div className="text-[10px] text-slate-500">
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleString()
                        : "—"}{" "}
                      · {msg.senderId?.slice(0, 8) ?? "system"}
                    </div>
                    <div className="mt-1 whitespace-pre-wrap text-slate-100">
                      {msg.content ?? "—"}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <JsonPanel title="Dispute" data={packet.dispute} />
          <JsonPanel title="Booking (GPS fields)" data={packet.booking} />
          <JsonPanel title="Payment" data={packet.payment} />
          <JsonPanel title="Verification events" data={packet.verificationEvents} />
          <JsonPanel title="Transactions" data={packet.transactions} />

          {packet.noShowEvents?.length ? (
            <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                No-show events
              </h2>
              {packet.noShowEvents.map((event, idx) => {
                const eventId = getNoShowEventId(event);
                const alreadyReversed = !!event.reversedAt;
                return (
                  <div
                    key={eventId ?? idx}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-xs"
                  >
                    <p className="font-mono text-[10px] text-slate-400">
                      Event: {eventId ?? "unknown"}
                    </p>
                    {alreadyReversed ? (
                      <p className="mt-1 text-slate-500">
                        Reversed {event.reversedAt} — {event.reversalReason}
                      </p>
                    ) : canAct && eventId ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          className="min-h-[60px] w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs outline-none focus:border-rose-400"
                          placeholder="Reason (required)…"
                          value={reverseReasons[eventId] ?? ""}
                          onChange={(e) =>
                            setReverseReasons((prev) => ({
                              ...prev,
                              [eventId]: e.target.value
                            }))
                          }
                        />
                        <button
                          type="button"
                          disabled={reverseMutation.isPending}
                          onClick={() => handleReverse(event)}
                          className="rounded-full border border-rose-500/50 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-200 disabled:opacity-50"
                        >
                          Reverse strike
                        </button>
                      </div>
                    ) : (
                      <FraudAccessDenied />
                    )}
                  </div>
                );
              })}
            </section>
          ) : null}

          <section className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Admin actions
            </h2>
            {localError && (
              <p className="text-xs text-rose-300">{localError}</p>
            )}
            {!canAct && <FraudAccessDenied />}

            {canAct && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => reviewMutation.mutate()}
                  disabled={reviewMutation.isPending || isFetching}
                  className="rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs text-sky-100 disabled:opacity-50"
                >
                  Mark under review
                </button>
                {canConfirmCompletion && (
                  <button
                    type="button"
                    onClick={() => confirmMutation.mutate()}
                    disabled={confirmMutation.isPending}
                    className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 disabled:opacity-50"
                  >
                    Confirm completion override
                  </button>
                )}
                {canResolve && !showResolveForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowResolveForm(true);
                      setLocalError(null);
                    }}
                    className="rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs text-amber-100"
                  >
                    Resolve dispute…
                  </button>
                )}
              </div>
            )}

            {!canResolve && canAct && disputeStatus && (
              <p className="text-xs text-slate-500">
                Resolve is disabled while status is {disputeStatus}.
              </p>
            )}

            {showResolveForm && canResolve && (
              <div className="space-y-3 border-t border-slate-800 pt-3">
                <label className="block text-[10px] uppercase text-slate-500">
                  Resolution type
                </label>
                <select
                  className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
                  value={resolutionType}
                  onChange={(e) =>
                    setResolutionType(e.target.value as DisputeResolutionType)
                  }
                >
                  <option value="REFUND_CUSTOMER">Refund customer</option>
                  <option value="PAY_ARTISAN">Pay Krafter</option>
                  <option value="SPLIT">Split</option>
                </select>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-[10px] text-slate-500">
                    Refund amount (cents)
                    <input
                      type="number"
                      min={0}
                      className="mt-1 h-8 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                    />
                  </label>
                  <label className="text-[10px] text-slate-500">
                    Krafter amount (cents)
                    <input
                      type="number"
                      min={0}
                      className="mt-1 h-8 w-full rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
                      value={artisanAmount}
                      onChange={(e) => setArtisanAmount(e.target.value)}
                    />
                  </label>
                </div>
                <label className="block text-[10px] uppercase text-slate-500">
                  Admin note
                </label>
                <textarea
                  className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs outline-none focus:border-emerald-400"
                  placeholder="Reasoned decision referencing the evidence…"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResolveForm(false)}
                    className="rounded-full border border-slate-600 px-3 py-2 text-xs text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResolve}
                    disabled={resolveMutation.isPending}
                    className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-100 disabled:opacity-50"
                  >
                    Submit resolution
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
