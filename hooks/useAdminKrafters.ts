"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedMeta, PaginatedResult } from "@/lib/admin-api";
import { mergeUsersWithProfiles } from "@/lib/merge-profiles";
import { profilesAdminService } from "@/services/profiles-admin.service";
import { usersAdminService } from "@/services/users-admin.service";
import type {
  AdminUserWithProfile,
  AdminUsersListParams,
  KrafterLocationSummary
} from "@/types/admin-users";

export type PaginatedUsersWithProfiles = PaginatedResult<AdminUserWithProfile>;

function enrichMeta(
  meta: PaginatedMeta,
  params: AdminUsersListParams
): PaginatedMeta {
  const page = meta.page ?? params.page ?? 1;
  const limit = meta.limit ?? params.limit ?? 20;
  const total = meta.total;
  const totalPages =
    meta.totalPages ??
    (total != null && limit > 0
      ? Math.max(1, Math.ceil(total / limit))
      : undefined);

  return { ...meta, page, limit, total, totalPages };
}

async function fetchKraftersPage(
  fetchUsers: (params: AdminUsersListParams) => ReturnType<
    typeof usersAdminService.listKrafters
  >,
  params: AdminUsersListParams
): Promise<PaginatedUsersWithProfiles> {
  const [users, profiles] = await Promise.all([
    fetchUsers(params),
    profilesAdminService.listArtisans().catch(() => ({
      items: [],
      meta: {}
    }))
  ]);
  return {
    items: mergeUsersWithProfiles(users.items, profiles.items),
    meta: enrichMeta(users.meta, params)
  };
}

export function useAdminKrafters(
  params: AdminUsersListParams,
  enabled = true
) {
  return useQuery<PaginatedUsersWithProfiles, Error>({
    queryKey: [
      "admin",
      "krafters",
      params.page ?? 1,
      params.limit ?? 20,
      params.locationCity ?? "",
      params.locationCountry ?? "",
      params.city ?? ""
    ],
    queryFn: () => fetchKraftersPage(usersAdminService.listKrafters, params),
    enabled
  });
}

export function useAdminKrafterLocations(enabled = true) {
  return useQuery<KrafterLocationSummary[], Error>({
    queryKey: ["admin", "krafters", "locations"],
    queryFn: () => usersAdminService.listKrafterLocations(),
    enabled
  });
}

export function useAdminIntentKrafters(
  params: AdminUsersListParams,
  enabled = true
) {
  return useQuery<PaginatedUsersWithProfiles, Error>({
    queryKey: [
      "admin",
      "intent-krafters",
      params.page ?? 1,
      params.limit ?? 20
    ],
    queryFn: () =>
      fetchKraftersPage(usersAdminService.listIntentKrafters, params),
    enabled
  });
}
