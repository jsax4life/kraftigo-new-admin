import { z } from "zod";

export const FinancialsPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);

export type FinancialsPeriod = z.infer<typeof FinancialsPeriodEnum>;

export const PayoutStatusEnum = z.enum([
  "PENDING",
  "ON_HOLD",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "FAILED"
]);

export type PayoutStatus = z.infer<typeof PayoutStatusEnum>;

export const FinancialsSummaryResponseSchema = z
  .object({
    period: z.string().optional(),
    range: z
      .object({
        from: z.string().nullish(),
        to: z.string().nullish(),
        label: z.string().nullish()
      })
      .nullish(),
    metrics: z.object({
      totalRevenue: z
        .object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          formatted: z.string().nullish()
        })
        .passthrough(),
      averageTransaction: z
        .object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          transactionCount: z.coerce.number().default(0),
          formatted: z.string().nullish()
        })
        .passthrough(),
      revenueGrowth: z
        .object({
          value: z.coerce.number().nullable().optional(),
          unit: z.string().nullish(),
          label: z.string().nullable().optional()
        })
        .passthrough(),
      pendingApprovals: z
        .object({
          value: z.coerce.number().default(0)
        })
        .passthrough()
    })
  })
  .passthrough();

export type FinancialsSummaryResponse = z.infer<
  typeof FinancialsSummaryResponseSchema
>;

export const PayoutRowSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    code: z.string().nullish(),
    reference: z.string().nullish(),
    krafterName: z.string().nullish(),
    recipientName: z.string().nullish(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    amount: z.union([z.string(), z.number()]).nullish(),
    netAmount: z.union([z.string(), z.number()]).nullish(),
    currency: z.string().default("GBP"),
    status: z.string().nullish(),
    destination: z.string().nullish(),
    bankName: z.string().nullish(),
    ibanLast4: z.string().nullish(),
    createdAt: z.string().nullish(),
    requestedAt: z.string().nullish(),
    processedAt: z.string().nullish(),
    note: z.string().nullish()
  })
  .passthrough();

export type PayoutRow = z.infer<typeof PayoutRowSchema>;

export type PayoutsListParams = {
  status?: PayoutStatus | "ALL" | string;
  page?: number;
  limit?: number;
};
