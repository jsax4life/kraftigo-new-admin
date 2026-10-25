import { z } from "zod";

const CountValueSchema = z.preprocess((val) => {
  if (typeof val === "number") return { value: val };
  if (typeof val === "string") return { value: Number(val) || 0 };
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    const num = o.value ?? o.count ?? o.total ?? 0;
    return { value: Number(num) || 0 };
  }
  return { value: 0 };
}, z.object({ value: z.coerce.number().default(0) }));

export const RestrictedUsersSummarySchema = z.preprocess((val) => {
  if (val && typeof val === "object" && "data" in val && typeof (val as any).data === "object") {
    return (val as any).data;
  }
  return val;
}, z
  .object({
    systemFlagged: CountValueSchema.default({ value: 0 }),
    currentlyRestricted: CountValueSchema.default({ value: 0 }),
    resolvedToday: CountValueSchema.default({ value: 0 })
  })
  .passthrough());

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

export function normalizeRestrictedUserPayload(val: unknown): unknown {
  if (!val || typeof val !== "object" || Array.isArray(val)) {
    return val;
  }
  const obj = val as Record<string, unknown>;
  const user = (obj.user && typeof obj.user === "object" ? obj.user : {}) as Record<string, unknown>;
  const account = (obj.account && typeof obj.account === "object" ? obj.account : {}) as Record<string, unknown>;
  const profile = (obj.profile && typeof obj.profile === "object" ? obj.profile : {}) as Record<string, unknown>;

  const id =
    obj.id ??
    obj.userId ??
    user.id ??
    account.id ??
    obj._id ??
    obj.restrictionId ??
    "0";

  const userId =
    obj.userId ??
    obj.id ??
    user.id ??
    account.id ??
    obj._id ??
    String(id);

  const name =
    obj.name ||
    obj.customerName ||
    obj.krafterName ||
    user.name ||
    account.name ||
    profile.name ||
    obj.fullName ||
    user.fullName ||
    (user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || null);

  const email =
    obj.email ||
    obj.emailAddress ||
    user.email ||
    account.email ||
    null;

  const userType =
    obj.type ||
    obj.userType ||
    user.role ||
    user.type ||
    account.type ||
    "Krafter";

  const reason =
    obj.reason ||
    obj.reasonTitle ||
    obj.violationReason ||
    obj.details ||
    "Policy Violation";

  const status =
    obj.status ||
    obj.statusLabel ||
    user.status ||
    "Restricted";

  return {
    ...obj,
    id: String(id),
    userId: String(userId),
    ...(name ? { name } : {}),
    ...(email ? { email } : {}),
    type: String(userType),
    userType: String(userType),
    reason: String(reason),
    reasonTitle: obj.reasonTitle ? String(obj.reasonTitle) : String(reason),
    status: String(status)
  };
}

const RestrictedUserRowRawSchema = z
  .object({
    id: z
      .union([z.string(), z.number()])
      .nullish()
      .transform((v) => (v != null ? String(v) : "0")),
    userId: z
      .union([z.string(), z.number()])
      .nullish()
      .transform((v) => (v != null ? String(v) : undefined)),
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

export const RestrictedUserRowSchema = z.preprocess(
  normalizeRestrictedUserPayload,
  RestrictedUserRowRawSchema
);

export type RestrictedUserRow = z.infer<typeof RestrictedUserRowRawSchema>;

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
    id: z.union([z.string(), z.number()]).nullish().transform((v) => v != null ? String(v) : ""),
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
