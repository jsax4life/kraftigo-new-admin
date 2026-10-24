"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Loader2,
  Info,
  Scale,
  FileX,
  Flag,
  ArrowRight,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { useRiskSummary } from "@/hooks/useRiskSummary";
import { hasFraudPreventionApiAccess } from "@/lib/fraud-prevention-auth";
import { useAuth } from "@/hooks/useAuth";
import { riskAdminService } from "@/services/risk-admin.service";
import type { ArtisanRiskRecalculate } from "@/types/risk-admin";

export default function RiskPage() {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch, isFetching } = useRiskSummary();

  const [artisanId, setArtisanId] = useState("");
  const [lastRecalc, setLastRecalc] = useState<ArtisanRiskRecalculate | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  // Recalculate All Mutation
  const recalcAllMutation = useMutation({
    mutationFn: () => riskAdminService.recalculateAll(),
    onSuccess: async () => {
      setLocalError(null);
      setSuccessMessage("Global risk scores recalculation initiated successfully.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "risk"] });
      refetch();
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (e: Error) => {
      setLocalError(e.message || "Failed to trigger global recalculation.");
      setSuccessMessage(null);
    }
  });

  // Recalculate Single Artisan Mutation
  const recalcOneMutation = useMutation({
    mutationFn: (id: string) => riskAdminService.recalculateArtisan(id),
    onSuccess: (result) => {
      setLocalError(null);
      setLastRecalc(result);
      setSuccessMessage(`Risk score recalculated for Krafter: ${result.artisanId.slice(0, 8)}…`);
      refetch();
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (e: Error) => {
      setLocalError(e.message || "Failed to recalculate Krafter risk score.");
      setSuccessMessage(null);
    }
  });

  // Metrics Calculations
  const metrics = useMemo(() => {
    const rows = data ?? [];
    const low = rows.find((r) => r.riskLevel === "LOW");
    const medium = rows.find((r) => r.riskLevel === "MEDIUM");
    const high = rows.find((r) => r.riskLevel === "HIGH");

    const lowCount = low?.count ?? 0;
    const medCount = medium?.count ?? 0;
    const highCount = high?.count ?? 0;
    const totalCount = lowCount + medCount + highCount;

    const lowScore = low ? Number(low.averageScore) || 0 : 0;
    const medScore = medium ? Number(medium.averageScore) || 0 : 0;
    const highScore = high ? Number(high.averageScore) || 0 : 0;

    const weightedScore =
      totalCount > 0
        ? (lowCount * lowScore + medCount * medScore + highCount * highScore) / totalCount
        : null;

    return {
      totalCount,
      lowCount,
      medCount,
      highCount,
      lowScore,
      medScore,
      highScore,
      weightedScore
    };
  }, [data]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getTierBadge = (tier: "LOW" | "MEDIUM" | "HIGH") => {
    switch (tier) {
      case "LOW":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Low Risk
          </span>
        );
      case "MEDIUM":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
            Medium Risk
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            High Risk
          </span>
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 pb-12 font-sans bg-white text-black mt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-garet font-[850] text-black">
            Risk & Operational Signals
          </h1>
          <p className="text-[13px] text-slate-700 font-medium">
            Operational reliability scores (0–100, higher is better) measuring platform safety, fulfillment integrity, and dispute patterns.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 rounded-lg border border-[#0000001A] bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-[#FF6600]" : "text-slate-600"}`} />
            Refresh
          </button>

          {canAct && (
            <button
              onClick={() => recalcAllMutation.mutate()}
              disabled={recalcAllMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-4 py-2 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50"
            >
              {recalcAllMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recalculating…
                </>
              ) : (
                <>
                  <Activity className="h-3.5 w-3.5" />
                  Recalculate All Profiles
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* System & Role Alerts */}
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

      {/* Top 4 KPI Headline Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Profiles */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Assessed Profiles
            </span>
            <Activity className="h-4 w-4 text-[#00000066]" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {isLoading ? "…" : metrics.totalCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Avg: {metrics.weightedScore ? metrics.weightedScore.toFixed(1) : "—"}/100
            </span>
          </div>
        </div>

        {/* Low Risk */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Low Risk (Tier 1)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Optimal
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {isLoading ? "…" : metrics.lowCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Avg Score: {metrics.lowScore ? metrics.lowScore.toFixed(1) : "—"}
            </span>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              Medium Risk (Tier 2)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
              Elevated
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {isLoading ? "…" : metrics.medCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Avg Score: {metrics.medScore ? metrics.medScore.toFixed(1) : "—"}
            </span>
          </div>
        </div>

        {/* High Risk */}
        <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#00000080]">
              High Risk (Tier 3)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-800">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
              Action Req.
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[22px] font-mabry font-extrabold text-black">
              {isLoading ? "…" : metrics.highCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              Avg Score: {metrics.highScore ? metrics.highScore.toFixed(1) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Distribution Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-garet font-[850] text-black">
              Operational Risk Tiers
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Distribution of Krafter reliability scores computed from platform signals.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#0000001A] overflow-hidden bg-[#F6F6F6] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F6F6F6] text-[#00000066] font-medium border-b border-slate-100 text-[11px]">
                  <th className="py-3 px-5">Risk Tier</th>
                  <th className="py-3 px-5">Krafter Count</th>
                  <th className="py-3 px-5">Marketplace Share</th>
                  <th className="py-3 px-5">Average Reliability Score</th>
                  <th className="py-3 px-5">Operational Impact & Policy</th>
                  <th className="py-3 px-5 text-right">Directory</th>
                </tr>
              </thead>
              <tbody className="text-xs font-normal text-black divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 bg-white">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-[#FF6600]" />
                        <span className="text-xs font-medium">Loading risk tier summary…</span>
                      </div>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-rose-600 bg-white">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <AlertCircle className="h-6 w-6 text-rose-500" />
                        <span className="text-xs font-semibold">
                          {error?.message ?? "Failed to load risk summary"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (data?.length ?? 0) === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 bg-white">
                      No risk score records found. Click &quot;Recalculate All Profiles&quot; to initialize scoring.
                    </td>
                  </tr>
                ) : (
                  data?.map((row, index) => {
                    const rowBg = index % 2 === 0 ? "bg-[#E6E6E6]" : "bg-[#F6F6F6]";
                    const share =
                      metrics.totalCount > 0
                        ? ((row.count / metrics.totalCount) * 100).toFixed(1)
                        : "0.0";
                    const avgNum = Number(row.averageScore) || 0;

                    let guidance = "";
                    if (row.riskLevel === "LOW") {
                      guidance = "Eligible for auto-disbursement, priority match routing, and fast-track verifications.";
                    } else if (row.riskLevel === "MEDIUM") {
                      guidance = "Standard monitoring. Secondary evidence review on disputes and milestone changes.";
                    } else {
                      guidance = "Dispute hold flag enabled. Requires administrative manual sign-off before payouts.";
                    }

                    return (
                      <tr key={row.riskLevel} className={`${rowBg} hover:bg-slate-200/50 transition-colors`}>
                        <td className="py-3.5 px-5 font-medium">
                          {getTierBadge(row.riskLevel)}
                        </td>
                        <td className="py-3.5 px-5 font-semibold text-black">
                          {row.count.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">{share}%</span>
                            <div className="w-16 h-1.5 rounded-full bg-slate-300 overflow-hidden">
                              <div
                                className={`h-full ${
                                  row.riskLevel === "LOW"
                                    ? "bg-emerald-500"
                                    : row.riskLevel === "MEDIUM"
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(Number(share), 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="inline-flex items-center gap-1.5 font-bold font-mono">
                            <span className="text-black text-sm">{avgNum.toFixed(1)}</span>
                            <span className="text-[10px] font-normal text-slate-500">/ 100</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700 max-w-md font-medium text-[11px] leading-relaxed">
                          {guidance}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            href="/admin/krafters"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#FF6600] hover:underline"
                          >
                            <span>Krafters</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
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

      {/* Krafter Profile Recalculation & Inspection Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F6F6F6] p-6 space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-garet font-[850] text-black">
            Inspect & Recalculate Krafter Profile
          </h2>
          <p className="text-[13px] text-slate-700 font-medium">
            Look up a specific Krafter account by UUID to recalculate their reliability score on-demand and inspect their operational signals.
          </p>
        </div>

        {!canAct && <FraudAccessDenied />}

        {canAct && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Krafter UUID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                value={artisanId}
                onChange={(e) => setArtisanId(e.target.value)}
                className="w-full rounded-lg border border-[#0000001A] bg-white py-2.5 pl-9 pr-4 text-xs font-mono placeholder:font-sans placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF6600]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const id = artisanId.trim();
                if (!id) {
                  setLocalError("Please enter a valid Krafter UUID.");
                  return;
                }
                setLocalError(null);
                recalcOneMutation.mutate(id);
              }}
              disabled={recalcOneMutation.isPending || !artisanId.trim()}
              className="flex items-center gap-2 rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm disabled:opacity-50"
            >
              {recalcOneMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Calculating…
                </>
              ) : (
                <>
                  <UserCheck className="h-3.5 w-3.5" />
                  Recalculate & Inspect
                </>
              )}
            </button>
          </div>
        )}

        {/* Krafter Inspection Result Card */}
        {lastRecalc && (
          <div className="rounded-xl border border-[#0000001A] bg-white p-5 space-y-5 shadow-sm animate-in fade-in-50 duration-200">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Target Krafter Account
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-black">
                    {lastRecalc.artisanId}
                  </span>
                  <button
                    onClick={() => handleCopyId(lastRecalc.artisanId)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    title="Copy Krafter ID"
                  >
                    {copiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <Link
                    href={`/admin/krafters/${lastRecalc.artisanId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF6600] hover:underline ml-2"
                  >
                    <span>View Krafter Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Status & Level Badge */}
              <div className="flex items-center gap-3">
                {lastRecalc.marketplaceRiskSuspendedUntil ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    Suspended until {new Date(lastRecalc.marketplaceRiskSuspendedUntil).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Active in Marketplace
                  </span>
                )}
                {getTierBadge(lastRecalc.riskLevel)}
              </div>
            </div>

            {/* Score & Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Reliability Score Callout */}
              <div className="md:col-span-1 rounded-xl border border-slate-100 bg-[#F9F9F9] p-4 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Reliability Score
                  </span>
                  <div className="mt-2 flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-black">
                      {lastRecalc.reliabilityScore}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        lastRecalc.riskLevel === "LOW"
                          ? "bg-emerald-500"
                          : lastRecalc.riskLevel === "MEDIUM"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${Math.min(lastRecalc.reliabilityScore, 100)}%` }}
                    />
                  </div>
                  <span className="mt-1 block text-[10px] text-slate-500 font-medium">
                    {lastRecalc.riskLevel === "LOW"
                      ? "High reliability profile"
                      : lastRecalc.riskLevel === "MEDIUM"
                      ? "Moderate reliability profile"
                      : "Low reliability profile"}
                  </span>
                </div>
              </div>

              {/* 8 Operational Risk Signals */}
              <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Completed Jobs */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Completed Jobs</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="mt-2 text-base font-extrabold font-mono text-black">
                    {lastRecalc.riskFactors?.completedJobs ?? 0}
                  </span>
                </div>

                {/* No Shows */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">No-Shows</span>
                    <AlertTriangle className={`h-3.5 w-3.5 ${(lastRecalc.riskFactors?.noShows ?? 0) > 0 ? "text-rose-600" : "text-slate-400"}`} />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.noShows ?? 0) > 0 ? "text-rose-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.noShows ?? 0}
                  </span>
                </div>

                {/* Open Disputes */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Open Disputes</span>
                    <ShieldAlert className={`h-3.5 w-3.5 ${(lastRecalc.riskFactors?.openDisputes ?? 0) > 0 ? "text-rose-600" : "text-slate-400"}`} />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.openDisputes ?? 0) > 0 ? "text-rose-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.openDisputes ?? 0}
                  </span>
                </div>

                {/* Customer Refunds */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Refunds Issued</span>
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.customerRefunds ?? 0) > 0 ? "text-amber-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.customerRefunds ?? 0}
                  </span>
                </div>

                {/* Split Resolutions */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Split Resolutions</span>
                    <Scale className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <span className="mt-2 text-base font-extrabold font-mono text-black">
                    {lastRecalc.riskFactors?.splitResolutions ?? 0}
                  </span>
                </div>

                {/* Rejected Verifications */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Rejected Verifs</span>
                    <FileX className={`h-3.5 w-3.5 ${(lastRecalc.riskFactors?.rejectedVerifications ?? 0) > 0 ? "text-amber-600" : "text-slate-400"}`} />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.rejectedVerifications ?? 0) > 0 ? "text-amber-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.rejectedVerifications ?? 0}
                  </span>
                </div>

                {/* Flagged Verifications */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Flagged Verifs</span>
                    <Flag className={`h-3.5 w-3.5 ${(lastRecalc.riskFactors?.flaggedVerifications ?? 0) > 0 ? "text-amber-600" : "text-slate-400"}`} />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.flaggedVerifications ?? 0) > 0 ? "text-amber-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.flaggedVerifications ?? 0}
                  </span>
                </div>

                {/* Anomalous Completions */}
                <div className="rounded-lg border border-slate-100 bg-[#F9F9F9] p-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-medium">Anomalous Runs</span>
                    <AlertTriangle className={`h-3.5 w-3.5 ${(lastRecalc.riskFactors?.anomalousCompletions ?? 0) > 0 ? "text-rose-600" : "text-slate-400"}`} />
                  </div>
                  <span className={`mt-2 text-base font-extrabold font-mono ${(lastRecalc.riskFactors?.anomalousCompletions ?? 0) > 0 ? "text-rose-600" : "text-black"}`}>
                    {lastRecalc.riskFactors?.anomalousCompletions ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Technical JSON Inspector */}
            <div className="border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowRawJson((prev) => !prev)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-black transition-colors"
              >
                {showRawJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showRawJson ? "Hide Raw Response Payload" : "View Raw Response Payload"}
              </button>

              {showRawJson && (
                <pre className="mt-2.5 max-h-60 overflow-auto rounded-lg border border-[#0000001A] bg-[#F9F9F9] p-3 text-[11px] font-mono text-slate-800 leading-relaxed">
                  {JSON.stringify(lastRecalc, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Operational Policy & Safeguards Card */}
      <div className="rounded-2xl border border-[#0000001A] bg-[#F9F9F9] p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-[#FF6600]" />
            <h2 className="text-xl font-garet font-[850] text-black">
              Risk Scoring Principles & Safeguards
            </h2>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
            Scores are dynamic, real-time indicators reflecting verifiable actions (arrival PINs, dispute outcomes, no-shows).
            High risk designations alert operational staff to examine evidence packets manually before any suspension or marketplace restriction is enacted.
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
            href="/admin/restricted"
            className="rounded-lg bg-[#FF6600] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#e65c00] transition-colors shadow-sm"
          >
            Restricted Accounts
          </Link>
        </div>
      </div>
    </div>
  );
}

