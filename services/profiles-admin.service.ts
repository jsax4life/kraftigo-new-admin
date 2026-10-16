import { apiClient } from "@/lib/api-client";
import { parsePaginatedResponse, type PaginatedResult } from "@/lib/admin-api";
import {
  AdminProfileRowSchema,
  type AdminProfileRow
} from "@/types/admin-profiles";
import type { AdminUsersListParams } from "@/types/admin-users";

function listParams(params?: AdminUsersListParams) {
  return {
    ...(params?.page != null ? { page: params.page } : {}),
    ...(params?.limit != null ? { limit: params.limit } : {})
  };
}

export const profilesAdminService = {
  async listArtisans(): Promise<PaginatedResult<AdminProfileRow>> {
    const res = await apiClient.get("/api/admin/profiles/artisans");
    return parsePaginatedResponse(
      AdminProfileRowSchema,
      res.data,
      "artisan profiles"
    );
  },

  async listCustomers(
    params?: AdminUsersListParams
  ): Promise<PaginatedResult<AdminProfileRow>> {
    const res = await apiClient.get("/api/admin/profiles/customers", {
      params: listParams(params)
    });
    return parsePaginatedResponse(
      AdminProfileRowSchema,
      res.data,
      "customer profiles"
    );
  }
};
