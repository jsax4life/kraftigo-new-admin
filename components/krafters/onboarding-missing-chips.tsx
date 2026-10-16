"use client";

import type { KrafterOnboarding } from "@/types/admin-users";
import { sectionStatusTone } from "@/lib/krafter-display";

export function OnboardingMissingChips({
  onboarding
}: {
  onboarding: KrafterOnboarding | null;
}) {
  if (!onboarding) {
    return <span className="text-slate-500">—</span>;
  }

  if (onboarding.allComplete) {
    return (
      <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
        Complete
      </span>
    );
  }

  const sections = onboarding.missingSections ?? [];
  if (!sections.length) {
    return (
      <span className="text-[10px] text-slate-400">
        In progress ({onboarding.completionPercent ?? 0}%)
      </span>
    );
  }

  return (
    <ul className="flex flex-wrap gap-1.5">
      {sections.map((section) => (
        <li
          key={`${section.label}-${section.status}`}
          className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] leading-tight ${sectionStatusTone(section.status)}`}
          title={section.status}
        >
          {section.label}
        </li>
      ))}
    </ul>
  );
}
