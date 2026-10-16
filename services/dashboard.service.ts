import { apiClient } from "@/lib/api-client";
import { parseEntityResponse } from "@/lib/admin-api";
import { DashboardStatsSchema, type DashboardStats } from "@/types/dashboard";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get("/api/admin/dashboard/stats");
    return parseEntityResponse(DashboardStatsSchema, res.data, "dashboard stats");
  }
};
