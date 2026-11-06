"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type {
  DashboardStats,
  LiveBookingRow,
  LiveBookingsParams,
  CriticalPulseParams,
  CriticalPulseResponse,
  OverviewSummaryPeriod,
  OverviewSummaryResponse,
  OverviewVerificationQueueResponse
} from "@/types/dashboard";
import type { PaginatedResult } from "@/lib/admin-api";

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000
  });
}

export function useOverviewSummary(period?: OverviewSummaryPeriod | string) {
  return useQuery<OverviewSummaryResponse, Error>({
    queryKey: ["admin", "overview", "summary", period],
    queryFn: () => dashboardService.getOverviewSummary(period),
    staleTime: 30_000
  });
}

export function useLiveBookings(params?: LiveBookingsParams) {
  return useQuery<PaginatedResult<LiveBookingRow>, Error>({
    queryKey: ["admin", "overview", "bookings", "live", params],
    queryFn: () => dashboardService.getLiveBookings(params),
    staleTime: 15_000,
    refetchInterval: 30_000 // auto-refresh live monitor every 30 seconds
  });
}

export function useCriticalPulse(params?: CriticalPulseParams) {
  return useQuery<CriticalPulseResponse, Error>({
    queryKey: ["admin", "overview", "critical-pulse", params],
    queryFn: () => dashboardService.getCriticalPulse(params),
    staleTime: 60_000
  });
}

export function useOverviewKrafterVerificationQueue(
  params: { page?: number; limit?: number } = {}
) {
  return useQuery<OverviewVerificationQueueResponse, Error>({
    queryKey: ["admin", "overview", "krafter-verification-queue", params],
    queryFn: () => dashboardService.getKrafterVerificationQueue(params),
    staleTime: 15_000
  });
}
