import type { AdminUser } from "@/types/auth";

/**
 * Fraud-prevention admin APIs require JWT role exactly `ADMIN` (per backend RolesGuard).
 * `SUPER_ADMIN` alone is not accepted by those endpoints.
 */
export function hasFraudPreventionApiAccess(
  user: Pick<AdminUser, "roles"> | null | undefined
): boolean {
  return user?.roles?.includes("ADMIN") ?? false;
}

export function isSuperAdminWithoutAdminRole(
  user: Pick<AdminUser, "roles"> | null | undefined
): boolean {
  if (!user?.roles?.length) return false;
  return user.roles.includes("SUPER_ADMIN") && !user.roles.includes("ADMIN");
}
