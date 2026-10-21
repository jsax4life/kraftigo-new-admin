import { z } from "zod";

export const RestrictedUsersSummarySchema = z
  .object({
    systemFlagged: z.object({ value: z.coerce.number().default(0) }).default({ value: 0 }),
    currentlyRestricted: z.object({ value: z.coerce.number().default(0) }).default({ value: 0 }),
    resolvedToday: z.object({ value: z.coerce.number().default(0) }).default({ value: 0 })
  })
  .passthrough();

export type RestrictedUsersSummary = z.infer<typeof RestrictedUsersSummarySchema>;

export const RestrictedUserTypeEnum = z.enum(["all", "krafter", "customer"]);
export type RestrictedUserType = z.infer<typeof RestrictedUserTypeEnum>;

export const RestrictedUserPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);
export type RestrictedUserPeriod = z.infer<typeof RestrictedUserPeriodEnum>;

export const RestrictedDurationEnum = z.enum([
  "flag_account",
  "24_hours",
  "48_hours",
  "1_week",
  "2_weeks",
  "1_month",
  "3_months",
  "permanent"
]);
export type RestrictedDuration = z.infer<typeof RestrictedDurationEnum>;

export const RestrictedReasonEnum = z.enum([
  "terms_violation",
  "suspicious_activity",
  "poor_ratings",
  "multiple_policy_violations",
  "suspicious_payment_activity",
  "terms_of_service_breach",
  "repeated_negative_feedback",
  "other"
]);
export type RestrictedReason = z.infer<typeof RestrictedReasonEnum>;

export const RestrictedUserRowSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    userId: z.string().optional(),
    name: z.string().nullish(),
    customerName: z.string().nullish(),
    krafterName: z.string().nullish(),
    email: z.string().nullish(),
    type: z.string().nullish(),
    userType: z.string().nullish(),
    reasonTitle: z.string().nullish(),
    reason: z.string().nullish(),
    reasonDetail: z.string().nullish(),
    reasons: z.union([z.array(z.string()), z.string()]).nullish(),
    status: z.string().nullish(),
    statusColor: z.string().nullish(),
    action: z.string().nullish(),
    duration: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
  .passthrough();

export type RestrictedUserRow = z.infer<typeof RestrictedUserRowSchema>;

export type RestrictedUsersListParams = {
  page?: number;
  limit?: number;
  search?: string;
  userType?: RestrictedUserType | string;
  period?: RestrictedUserPeriod | string;
};

export const ApplyAccountRestrictionSchema = z.object({
  duration: RestrictedDurationEnum,
  reason: RestrictedReasonEnum,
  reasonDetail: z.string().optional(),
  adminNotes: z.string().optional(),
  notifyUser: z.boolean().default(true)
});

export type ApplyAccountRestrictionDto = z.infer<typeof ApplyAccountRestrictionSchema>;

export const LiftRestrictionSchema = z.object({
  note: z.string().optional()
});

export type LiftRestrictionDto = z.infer<typeof LiftRestrictionSchema>;

export const AdminModerationNoteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty")
});

export type AdminModerationNoteDto = z.infer<typeof AdminModerationNoteSchema>;

export const ProfileLogItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    date: z.string().nullish(),
    createdAt: z.string().nullish(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    note: z.string().nullish(),
    highlighted: z.boolean().optional(),
    author: z.string().nullish()
  })
  .passthrough();

export type ProfileLogItem = z.infer<typeof ProfileLogItemSchema>;
