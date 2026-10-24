"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  Info,
  Scale,
  X,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
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

function AlertResolveCell({
  alert,
  onResolved
}: {
  alert: PaymentAlert;
  onResolved: () => void;
}) {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const [isResolving, setIsResolving] = useState(false);
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
      setIsResolving(false);
      onResolved();
    },
    onError: (e: Error) => setError(e.message)
  });

  if (alert.status === "RESOLVED") {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          Resolved
        </span>
        {alert.resolutionNote && (
          <span
            className="text-[10px] text-slate-500 max-w-[200px] truncate"
            title={alert.resolutionNote}
          >
            &quot;{alert.resolutionNote}&quot;
          </span>
        )}
      </div>
    );
  }

  if (!canAct) {
    return <span className="text-[10px] text-slate-400 italic">Admin role required</span>;
  }

  if (!isResolving) {
    return (
      <button
        type="button"
        onClick={() => setIsResolving(true)}
        className="rounded-md border border-[#0000001A] bg-white px-3 py-1.5 text-[11px] font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
      >
        Resolve Alert
      </button>
    );
  }

  return (
    <div className="min-w-[240px] space-y-2 rounded-lg border border-slate-200 bg-white p-2.5 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Resolution Note
        </span>
        <button
          onClick={() => {
            setIsResolving(false);
            setError(null);
          }}
          className="text-slate-400 hover:text-black"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      <textarea
        className="w-full rounded border border-slate-200 bg-[#F9F9F9] p-1.5 text-[11px] text-black outline-none placeholder:text-slate-400 focus:border-[#FF6600]"
        placeholder="Reason for resolving (3–2000 chars)…"
        rows={2}
        value={note}
        maxLength={NOTE_MAX}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="text-[10px] text-rose-600 font-medium">{error}</p>}

      <div className="flex items-center justify-between pt-1">
        <span className="text-[9px] text-slate-400">
          {note.length}/{NOTE_MAX}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setIsResolving(false);
              setError(null);
            }}
            className="rounded px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
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
            className="flex items-center gap-1 rounded bg-[#FF6600] px-2.5 py-1 text-[10px] font-semibold text-white hover:bg-[#e65c00] disabled:opacity-50"
          >
            {mutation.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentOperationsPage() {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const queryClient = useQueryClient();

  const [alertStatus, setAlertStatus] = useState<PaymentAlertStatus | "ALL">("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [reconcileResult, setReconcileResult] = useState<Record<string, unknown> | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDashboardJson, setShowDashboardJson] = useState(false);
  const [showReconcileJson, setShowReconcileJson] = useState(false);

  const dashboard = usePaymentOpsDashboard();
  const alerts = usePaymentAlerts(alertStatus);

  const reconcileMutation = useMutation({
    mutationFn: () => paymentsOperationsAdminService.reconcile(),
    onSuccess: (data) => {
      setLocalError(null);
      setReconcileResult(data);
      setSuccessMessage("Ledger reconciliation run completed successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin", "payments-ops"] });
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (e: Error) => {
      setLocalError(e.message || "Failed to execute payment reconciliation.");
      setSuccessMessage(null);
    }
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "payments-ops"] });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics computation from alerts & dashboard
  const metrics = useMemo(() => {
    const list = alerts.data ?? [];
    let openCount = 0;
    let resolvedCount = 0;
    let highSeverityCount = 0;

    for (const a of list) {
      const s = (a.status ?? "").toUpperCase();
      const sev = (a.severity ?? "").toUpperCase();

      if (s === "RESOLVED") resolvedCount++;
      else openCount++;

      if (sev === "HIGH" || sev === "CRITICAL") {
        highSeverityCount++;
      }
    }

    return {
      totalAlerts: list.length,
      openCount,
      resolvedCount,
      highSeverityCount
    };
  }, [alerts.data]);

  // Filtered Alerts List
  const filteredAlerts = useMemo(() => {
    return (alerts.data ?? []).filter((a) => {
      // Severity Filter
      if (severityFilter !== "ALL") {
        if ((a.severity ?? "").toUpperCase() !== severityFilter.toUpperCase()) {
          return false;
        }
      }

      // Search Query Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesId = a.id?.toLowerCase().includes(query);
        const matchesType = a.type?.toLowerCase().includes(query);
        const matchesResource = a.resourceId?.toLowerCase().includes(query) || a.resourceType?.toLowerCase().includes(query);
        const matchesNote = a.resolutionNote?.toLowerCase().includes(query);
        if (!matchesId && !matchesType && !matchesResource && !matchesNote) {
          return false;
        }
      }

      return true;
    });
  }, [alerts.data, severityFilter, search]);

  const getSeverityBadge = (severity?: string | null) => {
    const upper = (severity ?? "").toUpperCase();
    if (upper === "CRITICAL" || upper === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-800">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
          {severity ?? "High"}
        </span>
      );
    }
    if (upper === "MEDIUM" || upper === "MODERATE") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
          {severity ?? "Medium"}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
        {severity ?? "Low"}
      </span>
    );
  };

  const getStatusBadge = (status?: string | null) => {
    const upper = (status ?? "").toUpperCase();
    if (upper === "RESOLVED") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
        Open
      </span>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Payment Operations & Reconciliation
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Escrow balance audits, ledger synchronization, and anomaly detection alerts.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              dashboard.refetch();
              alerts.refetch();
            }}
            disabled={dashboard.isFetching || alerts.isFetching}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                dashboard.isFetching || alerts.isFetching
                  ? "animate-spin text-[#FF6600]"
                  : "text-slate-600"
              }`}
            />
            Refresh
          </button>

          {canAct && (
            <button
              onClick={() => reconcileMutation.mutate()}
              disabled={reconcileMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50"
            >
              {reconcileMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Reconciling…
                </>
              ) : (
                <>
                  <Scale className="h-3.5 w-3.5" />
                  Run Reconcile
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Role & Access Banner */}
      <FraudAccessBanner />

      {localError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-800 font-medium">
            <span className="font-bold">Error:</span> {localError}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 font-medium">
            {successMessage}
          </div>
        </div>
      )}

      {/* 4 Headline KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Alerts */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Operational Alerts
            </span>
            <Activity className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {alerts.isLoading ? "…" : metrics.totalAlerts}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              In Current Filter
            </span>
          </div>
        </div>

        {/* Action Needed */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Open Action Queue
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Pending
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {alerts.isLoading ? "…" : metrics.openCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Requires Note
            </span>
          </div>
        </div>

        {/* High Severity */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              High / Critical Risk
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              Urgent
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {alerts.isLoading ? "…" : metrics.highSeverityCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Priority Review
            </span>
          </div>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Resolved Cases
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Closed
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {alerts.isLoading ? "…" : metrics.resolvedCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Audit Retained
            </span>
          </div>
        </div>
      </div>

      {/* Operations Dashboard & Reconcile Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ledger Reconcile Card */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#FF6600]" />
              <h2 className="text-lg font-garet font-[850] text-black">
                Ledger Reconciliation Engine
              </h2>
            </div>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
              Execute an automated reconciliation cycle comparing transactional entries against escrow holding reserves, gateway states, and customer disbursements.
            </p>
          </div>

          {!canAct ? (
            <FraudAccessDenied />
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => reconcileMutation.mutate()}
                disabled={reconcileMutation.isPending}
                className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50"
              >
                {reconcileMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Executing Reconciliation…
                  </>
                ) : (
                  <>
                    <Scale className="h-3.5 w-3.5" />
                    Run Reconciliation Cycle
                  </>
                )}
              </button>
            </div>
          )}

          {/* Last Reconcile Result */}
          {reconcileResult && (
            <div className="rounded-xl border border-[#0000001A] bg-white p-4 space-y-3 mt-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Reconciliation Result Summary
                </span>
                <button
                  type="button"
                  onClick={() => setShowReconcileJson((prev) => !prev)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-black flex items-center gap-1"
                >
                  {showReconcileJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showReconcileJson ? "Hide Raw" : "Raw JSON"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(reconcileResult).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-[#F9F9F9] p-2.5">
                    <span className="text-[10px] font-medium uppercase text-slate-500 block">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-mono text-xs font-bold text-black">
                      {typeof value === "object" ? JSON.stringify(value) : String(value ?? "—")}
                    </span>
                  </div>
                ))}
              </div>

              {showReconcileJson && (
                <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-[#F9F9F9] p-3 text-[10px] font-mono text-slate-800">
                  {JSON.stringify(reconcileResult, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Operations Dashboard Status Card */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#FF6600]" />
                <h2 className="text-lg font-garet font-[850] text-black">
                  Operational Dashboard Status
                </h2>
              </div>
              {dashboard.data && (
                <button
                  type="button"
                  onClick={() => setShowDashboardJson((prev) => !prev)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-black flex items-center gap-1"
                >
                  {showDashboardJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showDashboardJson ? "Hide Data" : "Inspect Payload"}
                </button>
              )}
            </div>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
              Real-time synchronization telemetry from payment gateway webhooks, payouts queue, and custodial escrow accounts.
            </p>
          </div>

          {dashboard.isLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-[#FF6600]" />
              Loading operations dashboard…
            </div>
          ) : dashboard.isError ? (
            <div className="p-4 text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
              {dashboard.error?.message ?? "Failed to load dashboard"}
            </div>
          ) : dashboard.data && Object.keys(dashboard.data).length > 0 ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {Object.entries(dashboard.data).slice(0, 6).map(([key, val]) => (
                  <div key={key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block truncate" title={key}>
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="mt-1 font-mono text-sm font-extrabold text-black block truncate">
                      {typeof val === "object" ? JSON.stringify(val) : String(val ?? "0")}
                    </span>
                  </div>
                ))}
              </div>

              {showDashboardJson && (
                <pre className="max-h-48 overflow-auto rounded-lg border border-slate-200 bg-[#F9F9F9] p-3 text-[10px] font-mono text-slate-800">
                  {JSON.stringify(dashboard.data, null, 2)}
                </pre>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
              No active operational dashboard telemetry.
            </div>
          )}
        </div>
      </div>

      {/* Operational Payment Alerts Table */}
      <div className="space-y-4">
        {/* Table Title & Filter Bar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-garet font-[850] text-black">
              Payment & Anomaly Alerts
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Real-time payment anomalies, missing webhooks, and manual resolution queue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Tabs */}
            <div className="inline-flex rounded-lg border border-[#0000001A] bg-white p-0.5 shadow-sm">
              {(["ALL", "OPEN", "RESOLVED"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setAlertStatus(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    alertStatus === tab
                      ? "bg-[#FF6600] text-white shadow-sm"
                      : "text-slate-600 hover:text-black hover:bg-slate-50"
                  }`}
                >
                  {tab === "ALL" ? "All Alerts" : tab === "OPEN" ? "Open Queue" : "Resolved"}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-[#0000001A] bg-white px-3 py-1.5 text-xs font-medium text-black outline-none focus:ring-1 focus:ring-[#FF6600] shadow-sm"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search alerts or resource ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-56 rounded-lg border border-[#0000001A] bg-white py-1.5 pl-9 pr-7 text-xs text-black outline-none placeholder:text-slate-400 focus:ring-1 focus:ring-[#FF6600] shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 text-slate-400 hover:text-black"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Alerts Table */}
        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100 text-[11px]">
                  <th className="py-3 px-5">Alert Type</th>
                  <th className="py-3 px-5">Severity</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Target Resource</th>
                  <th className="py-3 px-5">Detected</th>
                  <th className="py-3 px-5 text-right">Resolution & Sign-off</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {alerts.isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF6600]" />
                        <span className="text-xs font-medium">Loading operational alerts…</span>
                      </div>
                    </td>
                  </tr>
                ) : alerts.isError ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-rose-600 bg-white">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <AlertCircle className="h-6 w-6 text-rose-500" />
                        <span className="text-xs font-semibold">
                          {alerts.error?.message ?? "Failed to load alerts"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 bg-white">
                      No operational payment alerts matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert, index) => {
                    const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";

                    return (
                      <tr key={alert.id} className={`${rowBg} hover:bg-slate-200/50 transition-colors`}>
                        {/* Alert Type */}
                        <td className="py-3.5 px-5 font-semibold text-black">
                          <div className="flex flex-col">
                            <span className="text-[12px]">{alert.type ?? "PAYMENT_ANOMALY"}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              #{alert.id.slice(0, 8)}…
                            </span>
                          </div>
                        </td>

                        {/* Severity */}
                        <td className="py-3.5 px-5">
                          {getSeverityBadge(alert.severity)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-5">
                          {getStatusBadge(alert.status)}
                        </td>

                        {/* Target Resource */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800">
                            <span className="font-semibold text-slate-600">
                              {alert.resourceType ?? "PAYMENT"}:
                            </span>
                            <span title={alert.resourceId ?? ""}>
                              {alert.resourceId ? `${alert.resourceId.slice(0, 8)}…` : "—"}
                            </span>
                            {alert.resourceId && (
                              <button
                                onClick={() => handleCopy(alert.resourceId!)}
                                className="text-slate-400 hover:text-black transition-colors"
                                title="Copy Resource ID"
                              >
                                {copiedId === alert.resourceId ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Detected At */}
                        <td className="py-3.5 px-5 text-slate-600 font-medium text-[11px]">
                          {alert.detectedAt ? (
                            <div className="flex flex-col">
                              <span>{new Date(alert.detectedAt).toLocaleDateString()}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(alert.detectedAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        {/* Resolution Action */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex justify-end">
                            <AlertResolveCell alert={alert} onResolved={invalidate} />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Escrow & Operational Integrity Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Escrow Integrity & Financial Settlement Policies
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            All customer funds are placed into escrow immediately upon booking approval. Disbursements to Krafters occur following authenticated PIN verification or dispute resolution. Resolving an alert creates a permanent, auditable ledger sign-off timestamp.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/disputes"
            className="rounded-lg border border-[#0000001A] bg-white px-4 py-2.5 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm"
          >
            Disputes Queue
          </Link>
          <Link
            href="/admin/risk"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Risk & Fraud Signals
          </Link>
        </div>
      </div>
    </div>
  );
}

