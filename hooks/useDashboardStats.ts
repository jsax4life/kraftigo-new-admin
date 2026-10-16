"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type { DashboardStats } from "@/types/dashboard";

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
    staleTime: 30_000
  });
}
