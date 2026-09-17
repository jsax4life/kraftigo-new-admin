"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedMeta, PaginatedResult } from "@/lib/admin-api";
import { mergeUsersWithProfiles } from "@/lib/merge-profiles";
import { profilesAdminService } from "@/services/profiles-admin.service";
import { usersAdminService } from "@/services/users-admin.service";
import type {
  AdminUserWithProfile,
  AdminUsersListParams
} from "@/types/admin-users";

export type PaginatedCustomersWithProfiles =
  PaginatedResult<AdminUserWithProfile>;

/** Fetch enough profiles to enrich any paginated users page. */
const PROFILE_MERGE_LIMIT = 500;

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

export function useAdminCustomers(
  params: AdminUsersListParams,
  enabled = true
) {
  return useQuery<PaginatedCustomersWithProfiles, Error>({
    queryKey: ["admin", "customers", params.page ?? 1, params.limit ?? 20],
    queryFn: async () => {
      const [users, profiles] = await Promise.all([
        usersAdminService.listCustomers(params),
        profilesAdminService
          .listCustomers({ page: 1, limit: PROFILE_MERGE_LIMIT })
          .catch(() => ({ items: [], meta: {} }))
      ]);

      return {
        items: mergeUsersWithProfiles(users.items, profiles.items),
        meta: enrichMeta(users.meta, params)
      };
    },
    enabled
  });
}
