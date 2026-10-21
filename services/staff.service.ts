import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  type PaginatedResult
} from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  StaffRolesResponseSchema,
  StaffMemberRowSchema,
  StaffDetailSchema,
  StaffActivityLogSchema,
  type StaffRoleOption,
  type StaffMemberRow,
  type StaffListParams,
  type AdminStaffCreateDto,
  type AdminStaffUpdateDto,
  type StaffDetail,
  type StaffActivityLog
} from "@/types/staff";

export const staffService = {
  async getRoles(): Promise<StaffRoleOption[]> {
    const res = await apiClient.get("/api/admin/staff/roles");
    const parsed = parseEntityResponse(
      StaffRolesResponseSchema,
      res.data,
      "staff roles"
    );
    return parsed.roles;
  },

  async list(
    params?: StaffListParams
  ): Promise<PaginatedResult<StaffMemberRow>> {
    const res = await apiClient.get("/api/admin/staff", { params });
    return parsePaginatedResponse(
      StaffMemberRowSchema,
      res.data,
      "staff list"
    );
  },

  async create(data: AdminStaffCreateDto): Promise<StaffMemberRow> {
    const payload = { ...data };
    if (!payload.password) delete payload.password;
    if (!payload.profilePhotoUrl) delete payload.profilePhotoUrl;

    const res = await apiClient.post("/api/admin/staff", payload);
    return parseEntityResponse(
      StaffMemberRowSchema,
      res.data,
      "create staff"
    );
  },

  async getDetail(id: string): Promise<StaffDetail> {
    const res = await apiClient.get(`/api/admin/staff/${id}`);
    return parseEntityResponse(
      StaffDetailSchema,
      res.data,
      "staff detail"
    );
  },

  async update(id: string, data: AdminStaffUpdateDto): Promise<StaffDetail> {
    const res = await apiClient.patch(`/api/admin/staff/${id}`, data);
    return parseEntityResponse(
      StaffDetailSchema,
      res.data,
      "update staff"
    );
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/staff/${id}`);
  },

  async activate(id: string): Promise<void> {
    await apiClient.post(`/api/admin/staff/${id}/activate`);
  },

  async deactivate(id: string): Promise<void> {
    await apiClient.post(`/api/admin/staff/${id}/deactivate`);
  },

  async resetPassword(id: string): Promise<void> {
    await apiClient.post(`/api/admin/staff/${id}/reset-password`);
  },

  async exportCsv(params?: StaffListParams): Promise<void> {
    await fetchCsvExport("/api/admin/staff/export", "staff-list.csv", {
      params
    });
  },

  async getActivityLogs(
    id: string,
    params?: { page?: number; limit?: number }
  ): Promise<PaginatedResult<StaffActivityLog>> {
    const res = await apiClient.get(`/api/admin/staff/${id}/activity-logs`, {
      params
    });
    return parsePaginatedResponse(
      StaffActivityLogSchema,
      res.data,
      "staff activity logs"
    );
  }
};
