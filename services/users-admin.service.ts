import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  unwrapListPayload,
  type PaginatedResult
} from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  AdminUserRowSchema,
  KrafterLocationSummarySchema,
  SendProfileReminderResponseSchema,
  type AdminUserRow,
  type AdminUsersListParams,
  type KrafterLocationSummary,
  type SendProfileReminderDto,
  type SendProfileReminderResponse
} from "@/types/admin-users";

function listParams(params?: AdminUsersListParams) {
  return {
    ...(params?.page != null ? { page: params.page } : {}),
    ...(params?.limit != null ? { limit: params.limit } : {}),
    ...(params?.locationCity ? { locationCity: params.locationCity } : {}),
    ...(params?.locationCountry
      ? { locationCountry: params.locationCountry }
      : {}),
    ...(params?.city ? { city: params.city } : {})
  };
}

export const usersAdminService = {
  async listKrafters(
    params?: AdminUsersListParams
  ): Promise<PaginatedResult<AdminUserRow>> {
    const res = await apiClient.get("/api/admin/users/krafters", {
      params: listParams(params)
    });
    return parsePaginatedResponse(AdminUserRowSchema, res.data, "krafters");
  },

  async listKrafterLocations(): Promise<KrafterLocationSummary[]> {
    const res = await apiClient.get("/api/admin/users/krafters/locations");
    const rows = unwrapListPayload(res.data);
    const items: KrafterLocationSummary[] = [];

    rows.forEach((row, index) => {
      const parsed = KrafterLocationSummarySchema.safeParse(row);
      if (!parsed.success) {
        console.error(`krafter locations row ${index} validation error`, parsed.error);
        throw new Error("Unexpected krafter locations response shape");
      }
      items.push(parsed.data);
    });

    return items;
  },

  async listCustomers(
    params?: AdminUsersListParams
  ): Promise<PaginatedResult<AdminUserRow>> {
    const res = await apiClient.get("/api/admin/users/customers", {
      params: listParams(params)
    });
    return parsePaginatedResponse(AdminUserRowSchema, res.data, "customers");
  },

  async listIntentKrafters(
    params?: AdminUsersListParams
  ): Promise<PaginatedResult<AdminUserRow>> {
    const res = await apiClient.get("/api/admin/users/intent-krafters", {
      params: listParams(params)
    });
    return parsePaginatedResponse(
      AdminUserRowSchema,
      res.data,
      "intent krafters"
    );
  },

  async sendProfileReminder(
    userId: string,
    body?: SendProfileReminderDto
  ): Promise<SendProfileReminderResponse> {
    const res = await apiClient.post(
      `/api/admin/users/intent-krafters/${userId}/send-profile-reminder`,
      body ?? { template: "auto" }
    );
    return parseEntityResponse(
      SendProfileReminderResponseSchema,
      res.data,
      "profile reminder"
    );
  },

  async exportCustomersCsv(): Promise<void> {
    await fetchCsvExport(
      "/api/admin/users/customers/export",
      "kraftigo-customers.csv"
    );
  },

  async exportKraftersCsv(): Promise<void> {
    await fetchCsvExport(
      "/api/admin/users/krafters/export",
      "kraftigo-krafters.csv"
    );
  },

  async exportIntentKraftersCsv(): Promise<void> {
    await fetchCsvExport(
      "/api/admin/users/intent-krafters/export",
      "kraftigo-intent-krafters.csv"
    );
  }
};
