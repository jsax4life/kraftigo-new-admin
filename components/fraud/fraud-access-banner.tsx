"use client";

import { isSuperAdminWithoutAdminRole } from "@/lib/fraud-prevention-auth";
import { useAuth } from "@/hooks/useAuth";

export function FraudAccessBanner() {
  const { user } = useAuth();

  if (!isSuperAdminWithoutAdminRole(user)) return null;

  return (
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
      Fraud-prevention API calls require the exact{" "}
      <strong className="font-semibold">ADMIN</strong> JWT role.{" "}
      <strong>SUPER_ADMIN</strong> alone is rejected by the backend — add the
      ADMIN role to your account or use an ADMIN user.
    </div>
  );
}

export function FraudAccessDenied() {
  const { user } = useAuth();

  if (user?.roles?.includes("ADMIN")) return null;

  return (
    <p className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
      These actions require an account with the <strong>ADMIN</strong> role.
    </p>
  );
}
