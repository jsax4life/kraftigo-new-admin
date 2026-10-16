"use client";

import { useQuery } from "@tanstack/react-query";
import { riskAdminService } from "@/services/risk-admin.service";
import type { RiskSummaryRow } from "@/types/risk-admin";

export function useRiskSummary() {
  return useQuery<RiskSummaryRow[], Error>({
    queryKey: ["admin", "risk", "summary"],
    queryFn: () => riskAdminService.getSummary()
  });
}
