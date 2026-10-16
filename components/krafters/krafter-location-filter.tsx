"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAdminKrafterLocations } from "@/hooks/useAdminKrafters";
import {
  krafterLocationFilterHref,
  krafterLocationSummaryCount,
  krafterLocationSummaryKey,
  krafterLocationSummaryLabel,
  matchesKrafterLocationFilter
} from "@/lib/krafter-display";
import type { KrafterLocationSummary } from "@/types/admin-users";

type KrafterLocationFilterProps = {
  compact?: boolean;
};

function LocationChip({
  location,
  active,
  compact
}: {
  location: KrafterLocationSummary;
  active: boolean;
  compact?: boolean;
}) {
  const count = krafterLocationSummaryCount(location);
  const label = krafterLocationSummaryLabel(location);

  return (
    <Link
      href={krafterLocationFilterHref(location.city, location.country)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
          : "border-slate-700 bg-slate-950 text-slate-300 hover:border-emerald-400/50 hover:text-emerald-200"
      } ${compact ? "py-0.5 text-[11px]" : ""}`}
      title={`View krafters in ${label}`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] tabular-nums ${
          active ? "bg-emerald-500/20 text-emerald-100" : "bg-slate-800 text-slate-400"
        }`}
      >
        {count}
      </span>
    </Link>
  );
}

export function KrafterLocationFilter({ compact = false }: KrafterLocationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, error } = useAdminKrafterLocations();

  const locationCity = searchParams.get("locationCity");
  const locationCountry = searchParams.get("locationCountry");
  const hasFilter = Boolean(locationCity);

  const sortedLocations = [...(data ?? [])].sort(
    (a, b) => krafterLocationSummaryCount(b) - krafterLocationSummaryCount(a)
  );

  function clearFilter() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("locationCity");
    params.delete("locationCountry");
    const query = params.toString();
    router.push(query ? `/admin/krafters?${query}` : "/admin/krafters");
  }

  return (
    <section
      className={`rounded-xl border border-slate-800 bg-slate-900/60 ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            className={`font-medium text-slate-100 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            Krafters by location
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            Click a location to filter the krafters list.
          </p>
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={clearFilter}
            className="shrink-0 rounded-full border border-slate-700 px-2.5 py-1 text-[10px] text-slate-300 hover:border-emerald-400/50 hover:text-emerald-200"
          >
            Clear filter
          </button>
        ) : null}
      </div>

      {hasFilter ? (
        <p className="mt-3 text-xs text-slate-400">
          Active filter:{" "}
          <span className="font-medium text-emerald-200">
            {locationCity}
            {locationCountry ? `, ${locationCountry}` : ""}
          </span>
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: compact ? 4 : 6 }).map((_, index) => (
            <div
              key={index}
              className="h-7 w-24 animate-pulse rounded-full bg-slate-800/80"
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <p className="mt-3 text-xs text-rose-300">
          Failed to load locations: {error?.message ?? "Unknown error"}
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <>
          {!sortedLocations.length ? (
            <p className="mt-3 text-xs text-slate-500">
              No krafter locations recorded yet.
            </p>
          ) : (
            <div
              className={`mt-3 flex flex-wrap gap-2 ${
                compact ? "max-h-32 overflow-y-auto pr-1" : ""
              }`}
            >
              {sortedLocations.map((location) => (
                <LocationChip
                  key={krafterLocationSummaryKey(location)}
                  location={location}
                  active={matchesKrafterLocationFilter(
                    location,
                    locationCity,
                    locationCountry
                  )}
                  compact={compact}
                />
              ))}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
