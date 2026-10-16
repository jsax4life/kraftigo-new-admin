"use client";

import Link from "next/link";
import { useAdminKrafterLocations } from "@/hooks/useAdminKrafters";
import {
  krafterLocationFilterHref,
  krafterLocationSummaryCount,
  krafterLocationSummaryKey,
  krafterLocationSummaryLabel
} from "@/lib/krafter-display";

export function KrafterLocationsPanel() {
  const { data, isLoading, isError, error } = useAdminKrafterLocations();

  const topLocations = [...(data ?? [])]
    .sort((a, b) => krafterLocationSummaryCount(b) - krafterLocationSummaryCount(a))
    .slice(0, 12);

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-slate-100">
            Krafters by location
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Jump to krafters registered in a city.
          </p>
        </div>
        <Link
          href="/admin/krafters"
          className="text-xs text-emerald-400 hover:text-emerald-300"
        >
          All krafters →
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-7 w-28 animate-pulse rounded-full bg-slate-800/80"
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="mt-4 text-xs text-rose-300">
          Failed to load locations: {error?.message ?? "Unknown error"}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {!topLocations.length ? (
            <p className="mt-4 text-xs text-slate-500">
              No krafter locations recorded yet.
            </p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {topLocations.map((location) => {
                const label = krafterLocationSummaryLabel(location);
                const count = krafterLocationSummaryCount(location);

                return (
                  <Link
                    key={krafterLocationSummaryKey(location)}
                    href={krafterLocationFilterHref(
                      location.city,
                      location.country
                    )}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300 transition hover:border-emerald-400/50 hover:text-emerald-200"
                    title={`View krafters in ${label}`}
                  >
                    <span>{label}</span>
                    <span className="rounded-full bg-slate-800 px-1.5 py-0.5 text-[10px] tabular-nums text-slate-400">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
