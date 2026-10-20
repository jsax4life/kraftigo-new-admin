import { apiClient } from "@/lib/api-client";
import { parseEntityResponse, parsePaginatedResponse, type PaginatedResult } from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  DashboardStatsSchema,
  LiveBookingRowSchema,
  CriticalPulseResponseSchema,
  OverviewSummaryResponseSchema,
  type DashboardStats,
  type LiveBookingRow,
  type LiveBookingsParams,
  type CriticalPulseParams,
  type CriticalPulseResponse,
  type OverviewSummaryResponse,
  type OverviewSummaryPeriod
} from "@/types/dashboard";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get("/api/admin/dashboard/stats");
    return parseEntityResponse(DashboardStatsSchema, res.data, "dashboard stats");
  },

  async getOverviewSummary(period?: OverviewSummaryPeriod | string): Promise<OverviewSummaryResponse> {
    const res = await apiClient.get("/api/admin/overview/summary", {
      params: period ? { period } : undefined
    });
    return parseEntityResponse(OverviewSummaryResponseSchema, res.data, "overview summary");
  },

  async getLiveBookings(params?: LiveBookingsParams): Promise<PaginatedResult<LiveBookingRow>> {
    const res = await apiClient.get("/api/admin/overview/bookings/live", { params });
    return parsePaginatedResponse(LiveBookingRowSchema, res.data, "live bookings");
  },

  async exportLiveBookingsCsv(params?: LiveBookingsParams): Promise<void> {
    await fetchCsvExport(
      "/api/admin/overview/bookings/live/export",
      "live-bookings.csv",
      { params }
    );
  },

  async getCriticalPulse(params?: CriticalPulseParams): Promise<CriticalPulseResponse> {
    const res = await apiClient.get("/api/admin/overview/critical-pulse", { params });
    return parseEntityResponse(CriticalPulseResponseSchema, res.data, "critical pulse");
  }
};
