import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  type PaginatedResult
} from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  RestrictedUsersSummarySchema,
  RestrictedUserRowSchema,
  ProfileLogItemSchema,
  type RestrictedUsersSummary,
  type RestrictedUserRow,
  type RestrictedUsersListParams,
  type ApplyAccountRestrictionDto,
  type LiftRestrictionDto,
  type AdminModerationNoteDto,
  type ProfileLogItem
} from "@/types/restricted-users";

export const restrictedUsersService = {
  async getSummary(): Promise<RestrictedUsersSummary> {
    const res = await apiClient.get("/api/admin/restricted-users/summary");
    return parseEntityResponse(
      RestrictedUsersSummarySchema,
      res.data,
      "restricted users summary"
    );
  },

  async list(
    params?: RestrictedUsersListParams
  ): Promise<PaginatedResult<RestrictedUserRow>> {
    const res = await apiClient.get("/api/admin/restricted-users", {
      params
    });
    return parsePaginatedResponse(
      RestrictedUserRowSchema,
      res.data,
      "restricted users list"
    );
  },

  async exportCsv(params?: RestrictedUsersListParams): Promise<void> {
    await fetchCsvExport(
      "/api/admin/restricted-users/export",
      "restricted-users.csv",
      { params }
    );
  },

  async restrictUser(
    userId: string,
    data: ApplyAccountRestrictionDto
  ): Promise<void> {
    await apiClient.post(`/api/admin/restricted-users/${userId}/restrict`, data);
  },

  async liftRestriction(
    userId: string,
    data?: LiftRestrictionDto
  ): Promise<void> {
    await apiClient.post(`/api/admin/restricted-users/${userId}/lift`, data ?? {});
  },

  async getProfileLogs(
    userId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResult<ProfileLogItem>> {
    const res = await apiClient.get(
      `/api/admin/restricted-users/${userId}/profile-logs`,
      { params }
    );
    return parsePaginatedResponse(
      ProfileLogItemSchema,
      res.data,
      "profile logs"
    );
  },

  async postModerationNote(
    userId: string,
    data: AdminModerationNoteDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/restricted-users/${userId}/profile-logs`,
      data
    );
  }
};
