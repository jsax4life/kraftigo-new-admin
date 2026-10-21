import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  type PaginatedResult
} from "@/lib/admin-api";
import {
  FinancialsSummaryResponseSchema,
  PayoutRowSchema,
  type FinancialsSummaryResponse,
  type FinancialsPeriod,
  type PayoutRow,
  type PayoutsListParams
} from "@/types/financials";

export const financialsService = {
  async getSummary(
    period?: FinancialsPeriod | string
  ): Promise<FinancialsSummaryResponse> {
    const res = await apiClient.get("/api/admin/financials/summary", {
      params: period ? { period } : undefined
    });
    return parseEntityResponse(
      FinancialsSummaryResponseSchema,
      res.data,
      "financials summary"
    );
  },

  async listPayouts(
    params?: PayoutsListParams
  ): Promise<PaginatedResult<PayoutRow>> {
    const queryParams: Record<string, unknown> = {};
    if (params?.page != null) queryParams.page = params.page;
    if (params?.limit != null) queryParams.limit = params.limit;
    if (params?.status && params.status !== "ALL") {
      queryParams.status = params.status;
    }

    const res = await apiClient.get("/api/admin/financials/payouts", {
      params: queryParams
    });
    return parsePaginatedResponse(
      PayoutRowSchema,
      res.data,
      "payouts ledger"
    );
  }
};
