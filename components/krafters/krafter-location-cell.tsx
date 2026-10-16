"use client";

import type { AdminUserRow } from "@/types/admin-users";
import {
  formatKrafterLocation,
  getKrafterLocation,
  mapsHref
} from "@/lib/krafter-display";

export function KrafterLocationCell({ user }: { user: AdminUserRow }) {
  const location = getKrafterLocation(user);
  if (!location) {
    return <span className="text-slate-500">—</span>;
  }

  const label = formatKrafterLocation(location);
  const href = mapsHref(location);
  const incomplete = location.addressCompleted === false;

  return (
    <div className="max-w-full text-xs">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-emerald-400 underline hover:text-emerald-300"
          title={label}
        >
          {label}
        </a>
      ) : (
        <span className="line-clamp-2" title={label}>
          {label}
        </span>
      )}
      {incomplete && (
        <span className="mt-0.5 block text-[10px] text-amber-300/90">
          Address incomplete
        </span>
      )}
    </div>
  );
}
