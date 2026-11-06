"use client";

import { useQuery } from "@tanstack/react-query";
import { financialsService } from "@/services/financials.service";
import type {
  FinancialsSummaryResponse,
  FinancialsPeriod,
  PayoutRow,
  PayoutsListParams
} from "@/types/financials";
import type { PaginatedResult } from "@/lib/admin-api";

export function useFinancialsSummary(period?: FinancialsPeriod | string) {
  return useQuery<FinancialsSummaryResponse, Error>({
    queryKey: ["admin", "financials", "summary", period],
    queryFn: () => financialsService.getSummary(period),
    staleTime: 30_000
  });
}

export function usePayouts(params?: PayoutsListParams) {
  return useQuery<PaginatedResult<PayoutRow>, Error>({
    queryKey: ["admin", "financials", "payouts", params],
    queryFn: () => financialsService.listPayouts(params),
    staleTime: 15_000
  });
}
