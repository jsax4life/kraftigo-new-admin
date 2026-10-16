import { z } from "zod";

export const RiskLevelSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const RiskSummaryRowSchema = z.object({
  riskLevel: RiskLevelSchema,
  count: z.coerce.number(),
  averageScore: z.union([z.string(), z.number()])
});

export type RiskSummaryRow = z.infer<typeof RiskSummaryRowSchema>;

export const RiskFactorsSchema = z
  .object({
    noShows: z.coerce.number().nullish(),
    openDisputes: z.coerce.number().nullish(),
    customerRefunds: z.coerce.number().nullish(),
    splitResolutions: z.coerce.number().nullish(),
    rejectedVerifications: z.coerce.number().nullish(),
    flaggedVerifications: z.coerce.number().nullish(),
    anomalousCompletions: z.coerce.number().nullish(),
    completedJobs: z.coerce.number().nullish()
  })
  .passthrough();

export const ArtisanRiskRecalculateSchema = z.object({
  artisanId: z.string(),
  reliabilityScore: z.coerce.number(),
  riskLevel: RiskLevelSchema,
  riskFactors: RiskFactorsSchema,
  marketplaceRiskSuspendedUntil: z.string().nullable().optional()
});

export type ArtisanRiskRecalculate = z.infer<
  typeof ArtisanRiskRecalculateSchema
>;
