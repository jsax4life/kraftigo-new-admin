"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { JsonPanel } from "@/components/fraud/json-panel";
import {
  usePaymentAlerts,
  usePaymentOpsDashboard
} from "@/hooks/usePaymentOperations";
import { hasFraudPreventionApiAccess } from "@/lib/fraud-prevention-auth";
import { useAuth } from "@/hooks/useAuth";
import { paymentsOperationsAdminService } from "@/services/payments-operations-admin.service";
import type {
  PaymentAlert,
  PaymentAlertStatus
} from "@/types/payments-operations-admin";

const NOTE_MIN = 3;
const NOTE_MAX = 2000;

function AlertResolveRow({
  alert,
  onResolved
}: {
  alert: PaymentAlert;
  onResolved: () => void;
}) {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      paymentsOperationsAdminService.resolveAlert(alert.id, {
        note: note.trim()
      }),
    onSuccess: () => {
      setNote("");
      setError(null);
      onResolved();
    },
    onError: (e: Error) => setError(e.message)
  });

  if (alert.status === "RESOLVED") {
    return (
      <span className="text-slate-500">
        {alert.resolutionNote ?? "Resolved"}
      </span>
    );
  }

  if (!canAct) return <FraudAccessDenied />;

  return (
    <div className="space-y-1">
      <input
        className="h-7 w-full max-w-xs rounded-md border border-slate-700 bg-slate-950 px-2 text-[11px]"
        placeholder="Resolution note (3–2000 chars)"
        value={note}
        maxLength={NOTE_MAX}
        onChange={(e) => setNote(e.target.value)}
      />
      {error && <p className="text-[10px] text-rose-300">{error}</p>}
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => {
          const trimmed = note.trim();
          if (trimmed.length < NOTE_MIN || trimmed.length > NOTE_MAX) {
            setError(`Note must be ${NOTE_MIN}–${NOTE_MAX} characters.`);
            return;
          }
          mutation.mutate();
        }}
        className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[10px] text-emerald-200 disabled:opacity-50"
      >
        Resolve
      </button>
    </div>
  );
}

export default function PaymentOperationsPage() {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const queryClient = useQueryClient();
  const [alertStatus, setAlertStatus] = useState<PaymentAlertStatus | "ALL">(
    "OPEN"
  );
  const [reconcileResult, setReconcileResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const dashboard = usePaymentOpsDashboard();
  const alerts = usePaymentAlerts(alertStatus);

  const reconcileMutation = useMutation({
    mutationFn: () => paymentsOperationsAdminService.reconcile(),
    onSuccess: (data) => {
      setLocalError(null);
      setReconcileResult(data);
      queryClient.invalidateQueries({ queryKey: ["admin", "payments-ops"] });
    },
    onError: (e: Error) => setLocalError(e.message)
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "payments-ops"] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Payment operations</h1>
        <p className="text-sm text-slate-400">
          Reconciliation dashboard and operational alerts.
        </p>
      </div>

      <FraudAccessBanner />
      {localError && <p className="text-xs text-rose-300">{localError}</p>}

      {dashboard.isLoading && (
        <p className="text-xs text-slate-400">Loading dashboard…</p>
      )}
      {dashboard.isError && (
        <p className="text-xs text-rose-300">
          {dashboard.error?.message ?? "Failed to load dashboard"}
        </p>
      )}
      {dashboard.data && (
        <JsonPanel title="Operations dashboard" data={dashboard.data} />
      )}

      <section className="max-w-lg rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-medium text-slate-100">Reconcile</h2>
        {!canAct && <FraudAccessDenied />}
        {canAct && (
          <button
            type="button"
            onClick={() => reconcileMutation.mutate()}
            disabled={reconcileMutation.isPending}
            className="mt-3 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-xs text-amber-100 disabled:opacity-50"
          >
            {reconcileMutation.isPending ? "Running…" : "Run reconcile"}
          </button>
        )}
        {reconcileResult && (
          <div className="mt-3">
            <JsonPanel title="Reconcile result" data={reconcileResult} />
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-slate-100">Alerts</h2>
          <select
            className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs"
            value={alertStatus}
            onChange={(e) =>
              setAlertStatus(e.target.value as PaymentAlertStatus | "ALL")
            }
          >
            <option value="ALL">All</option>
            <option value="OPEN">Open</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {alerts.isLoading && (
          <p className="text-xs text-slate-400">Loading alerts…</p>
        )}
        {alerts.isError && (
          <p className="text-xs text-rose-300">
            {alerts.error?.message ?? "Failed to load alerts"}
          </p>
        )}
        {alerts.data?.length ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full min-w-[640px] text-xs">
              <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Severity</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Resource</th>
                  <th className="px-3 py-2 text-left">Detected</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.data.map((alert) => (
                  <tr key={alert.id} className="border-t border-slate-900">
                    <td className="px-3 py-2">{alert.type ?? "—"}</td>
                    <td className="px-3 py-2">{alert.severity ?? "—"}</td>
                    <td className="px-3 py-2">{alert.status ?? "—"}</td>
                    <td className="px-3 py-2 font-mono text-[10px]">
                      {alert.resourceType}/{alert.resourceId?.slice(0, 8) ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {alert.detectedAt
                        ? new Date(alert.detectedAt).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <AlertResolveRow alert={alert} onResolved={invalidate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !alerts.isLoading && (
            <p className="text-xs text-slate-400">No alerts.</p>
          )
        )}
      </section>
    </div>
  );
}
