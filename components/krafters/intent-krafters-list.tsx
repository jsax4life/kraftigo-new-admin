"use client";

import type { ReactNode } from "react";

import { KrafterLocationCell } from "@/components/krafters/krafter-location-cell";
import { OnboardingMissingChips } from "@/components/krafters/onboarding-missing-chips";
import { SendProfileReminderButton } from "@/components/krafters/send-profile-reminder-button";
import type { AdminUserWithProfile } from "@/types/admin-users";
import {
  formatReminderSent,
  getKrafterOnboarding
} from "@/lib/krafter-display";
import { profileDisplayName } from "@/lib/merge-profiles";

function statusBadge(status?: string) {
  if (!status) return null;
  const normalized = status.toUpperCase();
  const tone =
    normalized === "ACTIVE"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
      : "border-slate-600 bg-slate-900 text-slate-300";
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${tone}`}
    >
      {status}
    </span>
  );
}

function formatJoined(createdAt?: string) {
  if (!createdAt) return "—";
  return new Date(createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function DetailBlock({
  label,
  children
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="text-xs text-slate-100">{children}</div>
    </div>
  );
}

function IntentKrafterCard({ user }: { user: AdminUserWithProfile }) {
  const onboarding = getKrafterOnboarding(user);
  const percent = onboarding?.completionPercent ?? 0;
  const canSendReminder = onboarding?.allComplete !== true;

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="grid grid-cols-1 gap-x-10 gap-y-4 md:grid-cols-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-slate-50">
              {profileDisplayName(user, user.profile)}
            </h3>
            {statusBadge(user.status)}
          </div>
          <p className="text-xs text-slate-400">{user.email}</p>
          <p className="text-[10px] text-slate-500">
            Joined {formatJoined(user.createdAt)}
            {onboarding?.hoursSinceSignup != null && (
              <span> · {onboarding.hoursSinceSignup}h since signup</span>
            )}
          </p>
        </div>

        <div className="min-w-0 md:pt-0.5">
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[10px]">
            <span className="text-slate-500">Onboarding</span>
            <span className="shrink-0 tabular-nums text-slate-200">
              {percent}%
              {onboarding?.kycStatus ? (
                <span className="text-slate-500">
                  {" "}
                  · KYC {onboarding.kycStatus}
                </span>
              ) : null}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-400"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
        </div>

        <DetailBlock label="Location">
          <KrafterLocationCell user={user} />
        </DetailBlock>

        <DetailBlock label="Still needed">
          <OnboardingMissingChips onboarding={onboarding} />
        </DetailBlock>

        <div className="col-span-full grid grid-cols-1 gap-3 border-t border-slate-800/80 pt-4 md:grid-cols-2 md:items-center">
          <p className="text-[10px] text-slate-500">
            Automated reminders:{" "}
            <span className="text-slate-300">
              {formatReminderSent(onboarding)}
            </span>
          </p>
          <div className="md:justify-self-end">
            <SendProfileReminderButton
              userId={user.id}
              disabled={!canSendReminder}
              compact
            />
          </div>
        </div>
      </div>
    </article>
  );
}

type IntentKraftersListProps = {
  users: AdminUserWithProfile[];
};

export function IntentKraftersList({ users }: IntentKraftersListProps) {
  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li key={user.id}>
          <IntentKrafterCard user={user} />
        </li>
      ))}
    </ul>
  );
}
