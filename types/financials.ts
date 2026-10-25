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

const MetricValueSchema = z.preprocess((val) => {
  if (typeof val === "number") return { value: val, currency: "GBP" };
  if (typeof val === "string") return { value: Number(val) || 0, currency: "GBP" };
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    return {
      value: Number(o.value ?? o.amount ?? o.total ?? 0),
      currency: typeof o.currency === "string" ? o.currency : "GBP",
      formatted: typeof o.formatted === "string" ? o.formatted : undefined,
      transactionCount:
        o.transactionCount != null ? Number(o.transactionCount) : undefined
    };
  }
  return { value: 0, currency: "GBP" };
}, z
  .object({
    value: z.coerce.number().default(0),
    currency: z.string().default("GBP"),
    formatted: z.string().nullish(),
    transactionCount: z.coerce.number().optional()
  })
  .passthrough());

const GrowthMetricSchema = z.preprocess((val) => {
  if (typeof val === "number") return { value: val, unit: "%" };
  if (typeof val === "string") return { value: Number(val) || 0, unit: "%" };
  if (val && typeof val === "object") return val;
  return { value: null };
}, z
  .object({
    value: z.coerce.number().nullable().optional(),
    unit: z.string().nullish(),
    label: z.string().nullable().optional()
  })
  .passthrough());

const CountMetricSchema = z.preprocess((val) => {
  if (typeof val === "number") return { value: val };
  if (typeof val === "string") return { value: Number(val) || 0 };
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    return { value: Number(o.value ?? o.count ?? o.total ?? 0) };
  }
  return { value: 0 };
}, z
  .object({
    value: z.coerce.number().default(0)
  })
  .passthrough());

export const normalizeFinancialsSummaryPayload = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return raw;
  const o = raw as Record<string, any>;
  const root = o.data && typeof o.data === "object" && !Array.isArray(o.data) ? o.data : o;
  const metricsSource =
    root.metrics && typeof root.metrics === "object" && !Array.isArray(root.metrics)
      ? root.metrics
      : root;

  return {
    ...root,
    period: root.period,
    range: root.range,
    metrics: {
      totalRevenue: metricsSource.totalRevenue,
      averageTransaction: metricsSource.averageTransaction,
      revenueGrowth: metricsSource.revenueGrowth,
      pendingApprovals: metricsSource.pendingApprovals
    }
  };
};

export const FinancialsSummaryResponseSchema = z.preprocess(
  normalizeFinancialsSummaryPayload,
  z
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
        totalRevenue: MetricValueSchema.default({ value: 0, currency: "GBP" }),
        averageTransaction: MetricValueSchema.default({ value: 0, currency: "GBP" }),
        revenueGrowth: GrowthMetricSchema.default({ value: null }),
        pendingApprovals: CountMetricSchema.default({ value: 0 })
      })
    })
    .passthrough()
);

export type FinancialsSummaryResponse = z.infer<
  typeof FinancialsSummaryResponseSchema
>;

export const normalizePayoutRowPayload = (raw: unknown) => {
  if (!raw || typeof raw !== "object") return raw;
  const o = raw as Record<string, any>;
  const resolvedId =
    o.id ??
    o._id ??
    o.payoutId ??
    o.reference ??
    o.code ??
    `payout-${Math.random().toString(36).slice(2, 9)}`;

  const recipient =
    o.recipientName ??
    o.krafterName ??
    o.name ??
    (o.krafter && typeof o.krafter === "object" ? o.krafter.name : undefined) ??
    (o.user && typeof o.user === "object" ? o.user.name : undefined);

  const email =
    o.email ??
    (o.krafter && typeof o.krafter === "object" ? o.krafter.email : undefined) ??
    (o.user && typeof o.user === "object" ? o.user.email : undefined);

  return {
    ...o,
    id: String(resolvedId),
    recipientName: recipient,
    email
  };
};

export const PayoutRowSchema = z.preprocess(
  normalizePayoutRowPayload,
  z
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
    .passthrough()
);

export type PayoutRow = z.infer<typeof PayoutRowSchema>;

export type PayoutsListParams = {
  status?: PayoutStatus | "ALL" | string;
  page?: number;
  limit?: number;
};
