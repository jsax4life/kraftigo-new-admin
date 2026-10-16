import type {
  AdminUserRow,
  KrafterLocation,
  KrafterLocationSummary,
  KrafterOnboarding,
  OnboardingMissingSection
} from "@/types/admin-users";

export function getKrafterOnboarding(user: AdminUserRow): KrafterOnboarding | null {
  const raw = user.onboarding;
  if (!raw || typeof raw !== "object") return null;
  return raw as KrafterOnboarding;
}

export function getKrafterLocation(user: AdminUserRow): KrafterLocation | null {
  const raw = user.location;
  if (!raw || typeof raw !== "object") return null;
  return raw as KrafterLocation;
}

export function formatKrafterLocation(location: KrafterLocation | null): string {
  if (!location) return "—";
  if (location.formattedAddress) return location.formattedAddress;

  const parts = [
    location.city,
    location.postalCode,
    location.country
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : "—";
}

export function mapsHref(location: KrafterLocation | null): string | null {
  if (!location) return null;
  const { latitude, longitude, formattedAddress } = location;
  if (latitude != null && longitude != null) {
    return `https://www.google.com/maps?q=${latitude},${longitude}`;
  }
  if (formattedAddress) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formattedAddress)}`;
  }
  return null;
}

export function sectionStatusTone(status: string): string {
  const upper = status.toUpperCase();
  if (upper.includes("PENDING")) {
    return "border-sky-500/40 bg-sky-500/10 text-sky-200";
  }
  if (upper === "MISSING") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  }
  return "border-slate-600 bg-slate-900 text-slate-300";
}

export function formatReminderSent(onboarding: KrafterOnboarding | null): string {
  if (!onboarding) return "—";
  const parts: string[] = [];
  if (onboarding.profileReminder1hSentAt) {
    parts.push(
      `1h: ${new Date(onboarding.profileReminder1hSentAt).toLocaleDateString()}`
    );
  }
  if (onboarding.profileReminder48hSentAt) {
    parts.push(
      `48h: ${new Date(onboarding.profileReminder48hSentAt).toLocaleDateString()}`
    );
  }
  return parts.length ? parts.join(" · ") : "None (cron)";
}

export function missingSectionLabels(
  sections: OnboardingMissingSection[] | undefined
): string[] {
  return sections?.map((s) => s.label) ?? [];
}

export function krafterLocationSummaryCount(
  location: KrafterLocationSummary
): number {
  return location.count ?? location.krafterCount ?? 0;
}

export function krafterLocationSummaryLabel(
  location: KrafterLocationSummary
): string {
  if (location.label) return location.label;
  const { city, country } = location;
  return country ? `${city}, ${country}` : city;
}

export function krafterLocationSummaryKey(
  location: KrafterLocationSummary
): string {
  return `${location.city}|${location.country ?? ""}`;
}

export function krafterLocationFilterHref(
  city: string,
  country?: string | null
): string {
  const params = new URLSearchParams();
  params.set("locationCity", city);
  if (country) params.set("locationCountry", country);
  return `/admin/krafters?${params.toString()}`;
}

export function matchesKrafterLocationFilter(
  location: KrafterLocationSummary,
  locationCity?: string | null,
  locationCountry?: string | null
): boolean {
  if (!locationCity) return false;
  if (location.city !== locationCity) return false;
  return (locationCountry ?? "") === (location.country ?? "");
}
