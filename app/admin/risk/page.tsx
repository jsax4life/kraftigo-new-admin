"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  FraudAccessBanner,
  FraudAccessDenied
} from "@/components/fraud/fraud-access-banner";
import { JsonPanel } from "@/components/fraud/json-panel";
import { useRiskSummary } from "@/hooks/useRiskSummary";
import { hasFraudPreventionApiAccess } from "@/lib/fraud-prevention-auth";
import { useAuth } from "@/hooks/useAuth";
import { riskAdminService } from "@/services/risk-admin.service";
import type { ArtisanRiskRecalculate } from "@/types/risk-admin";

export default function RiskPage() {
  const { user } = useAuth();
  const canAct = hasFraudPreventionApiAccess(user);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useRiskSummary();

  const [artisanId, setArtisanId] = useState("");
  const [lastRecalc, setLastRecalc] = useState<ArtisanRiskRecalculate | null>(
    null
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const recalcAllMutation = useMutation({
    mutationFn: () => riskAdminService.recalculateAll(),
    onSuccess: async () => {
      setLocalError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "risk"] });
      refetch();
    },
    onError: (e: Error) => setLocalError(e.message)
  });

  const recalcOneMutation = useMutation({
    mutationFn: (id: string) => riskAdminService.recalculateArtisan(id),
    onSuccess: (result) => {
      setLocalError(null);
      setLastRecalc(result);
      refetch();
    },
    onError: (e: Error) => setLocalError(e.message)
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Risk profiles</h1>
        <p className="text-sm text-slate-400">
          Operational reliability signals (0–100 score, higher is better). Not
          automated fraud verdicts.
        </p>
      </div>

      <FraudAccessBanner />
      {localError && <p className="text-xs text-rose-300">{localError}</p>}

      {isLoading && <p className="text-xs text-slate-400">Loading summary…</p>}
      {isError && (
        <p className="text-xs text-rose-300">
          {error?.message ?? "Failed to load risk summary"}
        </p>
      )}

      {data?.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-xs">
            <thead className="bg-slate-950/90 text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Risk level</th>
                <th className="px-3 py-2 text-left">Count</th>
                <th className="px-3 py-2 text-left">Avg score</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.riskLevel} className="border-t border-slate-900">
                  <td className="px-3 py-2">{row.riskLevel}</td>
                  <td className="px-3 py-2 tabular-nums">{row.count}</td>
                  <td className="px-3 py-2 tabular-nums">{row.averageScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <section className="max-w-lg space-y-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="text-sm font-medium text-slate-100">Recalculate</h2>
        {!canAct && <FraudAccessDenied />}
        {canAct && (
          <>
            <button
              type="button"
              onClick={() => recalcAllMutation.mutate()}
              disabled={recalcAllMutation.isPending}
              className="rounded-full border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-xs text-sky-100 disabled:opacity-50"
            >
              {recalcAllMutation.isPending
                ? "Recalculating all…"
                : "Recalculate all profiles"}
            </button>
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-[10px] text-slate-500">
                Krafter UUID
                <input
                  className="h-8 w-64 rounded-md border border-slate-700 bg-slate-950 px-2 font-mono text-[11px]"
                  value={artisanId}
                  onChange={(e) => setArtisanId(e.target.value)}
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const id = artisanId.trim();
                  if (!id) {
                    setLocalError("Enter a Krafter UUID.");
                    return;
                  }
                  recalcOneMutation.mutate(id);
                }}
                disabled={recalcOneMutation.isPending}
                className="h-8 rounded-md border border-slate-700 bg-slate-950 px-3 text-xs hover:border-emerald-400 disabled:opacity-50"
              >
                Recalculate one
              </button>
            </div>
          </>
        )}
      </section>

      {lastRecalc && <JsonPanel title="Last recalculation" data={lastRecalc} />}
    </div>
  );
}
