import type { AdminProfileRow } from "@/types/admin-profiles";
import type { AdminUserRow, AdminUserWithProfile } from "@/types/admin-users";

export function mergeUsersWithProfiles(
  users: AdminUserRow[],
  profiles: AdminProfileRow[]
): AdminUserWithProfile[] {
  const byUserId = new Map<string, AdminProfileRow>();

  for (const profile of profiles) {
    const key = profile.userId ?? profile.id;
    if (key) byUserId.set(key, profile);
  }

  return users.map((user) => ({
    ...user,
    profile: byUserId.get(user.id)
  }));
}

export function profileDisplayName(
  user: AdminUserRow,
  profile?: AdminProfileRow
): string {
  const raw = user as Record<string, unknown>;
  const fromUser = [raw.firstName, raw.lastName]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .join(" ")
    .trim();

  if (profile) {
    const composed = [profile.firstName, profile.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    const name =
      profile.displayName ??
      profile.fullName ??
      (composed || undefined) ??
      (fromUser || undefined);
    return name || user.email || user.id;
  }

  return fromUser || user.email || user.id;
}

export function entityLabel(
  entity?: Record<string, unknown> | null
): string {
  if (!entity) return "—";
  const email = typeof entity.email === "string" ? entity.email : null;
  const first = typeof entity.firstName === "string" ? entity.firstName : "";
  const last = typeof entity.lastName === "string" ? entity.lastName : "";
  const composed = `${first} ${last}`.trim();
  const name =
    typeof entity.displayName === "string"
      ? entity.displayName
      : typeof entity.fullName === "string"
        ? entity.fullName
        : composed || null;
  if (name && email) return `${name} (${email})`;
  return name ?? email ?? (typeof entity.id === "string" ? entity.id : "—");
}
