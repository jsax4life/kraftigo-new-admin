import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalUsers: z.coerce.number(),
  activeKrafters: z.coerce.number(),
  openBookings: z.coerce.number(),
  allKrafters: z.coerce.number(),
  allCustomers: z.coerce.number(),
  totalBookings: z.coerce.number(),
  intentKrafters: z.coerce.number()
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

export const LiveBookingStatusEnum = z.enum([
  "RECOMMENDATION_PENDING",
  "KRAFTER_SELECTED",
  "OPEN_FOR_APPLICATIONS",
  "PAYMENT_PENDING",
  "REQUESTED",
  "ACCEPTED",
  "COUNTERED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETION_SUBMITTED",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
  "DISPUTED",
  "DECLINED"
]);

export type LiveBookingStatus = z.infer<typeof LiveBookingStatusEnum>;

export const LiveBookingRowSchema = z
  .object({
    id: z.string(),
    code: z.string().nullish(),
    bookingReference: z.string().nullish(),
    name: z.string().nullish(),
    customerName: z.string().nullish(),
    krafterName: z.string().nullish(),
    service: z.string().nullish(),
    jobTitle: z.string().nullish(),
    value: z.union([z.string(), z.number()]).nullish(),
    amount: z.union([z.string(), z.number()]).nullish(),
    totalPrice: z.union([z.string(), z.number()]).nullish(),
    status: z.string().nullish(),
    displayStatus: z.string().nullish(),
    action: z.string().nullish(),
    suggestedAction: z.string().nullish(),
    actionColor: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
  .passthrough();

export type LiveBookingRow = z.infer<typeof LiveBookingRowSchema>;

export type LiveBookingsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: LiveBookingStatus | string;
  activeOnly?: boolean;
};

export const CriticalPulsePointSchema = z
  .object({
    month: z.string(),
    monthLabel: z.string(),
    revenueCurrent: z.coerce.number().default(0),
    revenuePrevious: z.coerce.number().default(0),
    activeKraftsCurrent: z.coerce.number().default(0),
    activeKraftsPrevious: z.coerce.number().default(0)
  })
  .passthrough();

export type CriticalPulsePoint = z.infer<typeof CriticalPulsePointSchema>;

export const CriticalPulseResponseSchema = z
  .object({
    period: z.string().optional(),
    comparison: z
      .object({
        currentSeriesLabel: z.string().optional(),
        previousSeriesLabel: z.string().optional(),
        description: z.string().optional()
      })
      .optional(),
    points: z.array(CriticalPulsePointSchema)
  })
  .passthrough();

export type CriticalPulseResponse = z.infer<
  typeof CriticalPulseResponseSchema
>;

export type CriticalPulsePeriod =
  | "this_month"
  | "last_month"
  | "last_7_days"
  | "last_30_days"
  | "all_time";

export type CriticalPulseParams = {
  period?: CriticalPulsePeriod | string;
  months?: number;
};

export type OverviewSummaryPeriod =
  | "this_month"
  | "last_month"
  | "last_7_days"
  | "last_30_days"
  | "all_time";

export const OverviewSummaryMetricNumberSchema = z
  .object({
    value: z.coerce.number().default(0),
    changePercent: z.coerce.number().nullish()
  })
  .passthrough();

export const OverviewSummaryTotalRevenueSchema = z
  .object({
    value: z.coerce.number().default(0),
    currency: z.string().default("GBP"),
    changePercent: z.coerce.number().nullish()
  })
  .passthrough();

export const OverviewSummaryActiveKraftsSchema = z
  .object({
    value: z.coerce.number().default(0),
    changePercent: z.coerce.number().nullish(),
    utilizationPercent: z.coerce.number().nullish(),
    registeredKrafters: z.coerce.number().nullish()
  })
  .passthrough();

export const OverviewSummarySupportTicketsSchema = z
  .object({
    value: z.coerce.number().default(0),
    disputesOpen: z.coerce.number().nullish(),
    operationalAlertsOpen: z.coerce.number().nullish()
  })
  .passthrough();

export const OverviewSummaryResponseSchema = z
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
      totalRevenue: OverviewSummaryTotalRevenueSchema,
      activeUsers: OverviewSummaryMetricNumberSchema,
      totalActiveKrafts: OverviewSummaryActiveKraftsSchema,
      openSupportTickets: OverviewSummarySupportTicketsSchema
    }),
    legacy: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type OverviewSummaryResponse = z.infer<
  typeof OverviewSummaryResponseSchema
>;

export {
  KrafterVerificationQueueResponseSchema as OverviewVerificationQueueResponseSchema,
  type KrafterVerificationQueueResponse as OverviewVerificationQueueResponse
} from "@/types/krafters";
