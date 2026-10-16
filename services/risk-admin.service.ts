import { apiClient } from "@/lib/api-client";
import { parseEntityResponse, unwrapListPayload } from "@/lib/admin-api";
import {
  ArtisanRiskRecalculateSchema,
  RiskSummaryRowSchema,
  type ArtisanRiskRecalculate,
  type RiskSummaryRow
} from "@/types/risk-admin";
import { z } from "zod";

const RiskSummaryListSchema = z.array(RiskSummaryRowSchema);

export const riskAdminService = {
  async getSummary(): Promise<RiskSummaryRow[]> {
    const res = await apiClient.get("/api/admin/profiles/risk/summary");
    const rows = unwrapListPayload(res.data);
    const parsed = RiskSummaryListSchema.safeParse(rows);
    if (!parsed.success) {
      console.error("risk summary validation error", parsed.error);
      throw new Error("Unexpected risk summary response shape");
    }
    return parsed.data;
  },

  async recalculateAll(): Promise<void> {
    await apiClient.post("/api/admin/profiles/risk/recalculate");
  },

  async recalculateArtisan(
    artisanId: string
  ): Promise<ArtisanRiskRecalculate> {
    const res = await apiClient.post(
      `/api/admin/profiles/risk/${artisanId}/recalculate`
    );
    return parseEntityResponse(
      ArtisanRiskRecalculateSchema,
      res.data,
      "artisan risk recalculate"
    );
  }
};
