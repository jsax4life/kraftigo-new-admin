import { z } from "zod";

export const KrafterPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);

export type KrafterPeriod = z.infer<typeof KrafterPeriodEnum>;

// Metric item schema with value and change/note/definition
export const KrafterMetricItemSchema = z
  .object({
    value: z.coerce.number().default(0),
    changePercent: z.coerce.number().nullish(),
    unit: z.string().nullish(),
    definition: z.string().nullish(),
    note: z.string().nullish()
  })
  .passthrough();

// Summary Headline Schema
export const KrafterSummaryResponseSchema = z
  .object({
    period: z.string().nullish(),
    range: z
      .object({
        from: z.string().nullish(),
        to: z.string().nullish(),
        label: z.string().nullish()
      })
      .nullish(),
    metrics: z
      .object({
        totalKrafters: KrafterMetricItemSchema.default({ value: 0 }),
        completionRate: KrafterMetricItemSchema.default({ value: 0, unit: "percent" }),
        activeKrafters: KrafterMetricItemSchema.default({ value: 0 }),
        probationAlerts: KrafterMetricItemSchema.default({ value: 0 })
      })
      .default({
        totalKrafters: { value: 0 },
        completionRate: { value: 0, unit: "percent" },
        activeKrafters: { value: 0 },
        probationAlerts: { value: 0 }
      }),
    restrictedProfiles: z
      .object({
        listPath: z.string().default("/admin/krafters/restricted"),
        unifiedListPath: z.string().default("/admin/restricted-users"),
        flaggedCount: z.coerce.number().default(0)
      })
      .passthrough()
      .default({
        listPath: "/admin/krafters/restricted",
        unifiedListPath: "/admin/restricted-users",
        flaggedCount: 0
      })
  })
  .passthrough();

export type KrafterSummaryResponse = z.infer<
  typeof KrafterSummaryResponseSchema
>;

// Top Krafter Item
export const TopKrafterItemSchema = z
  .object({
    id: z.string().nullish(),
    krafterId: z.string().nullish(),
    userId: z.string().nullish(),
    name: z.string().default("Krafter"),
    displayName: z.string().nullish(),
    email: z.string().nullish(),
    primaryTrade: z.string().nullish(),
    category: z.string().nullish(),
    location: z.string().nullish(),
    city: z.string().nullish(),
    country: z.string().nullish(),
    profilePhotoUrl: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    rating: z.coerce.number().nullish(),
    totalEarnings: z
      .union([
        z.number(),
        z.string(),
        z.object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          formatted: z.string().nullish()
        })
      ])
      .nullish(),
    earnings: z.union([z.number(), z.string()]).nullish(),
    completedKrafts: z.coerce.number().default(0),
    viewPath: z.string().nullish()
  })
  .passthrough();

export type TopKrafterItem = z.infer<typeof TopKrafterItemSchema>;

export const TopKraftersResponseSchema = z.union([
  z.array(TopKrafterItemSchema),
  z
    .object({
      items: z.array(TopKrafterItemSchema).default([])
    })
    .transform((o) => o.items),
  z
    .object({
      data: z.array(TopKrafterItemSchema).default([])
    })
    .transform((o) => o.data)
]);

export type TopKraftersResponse = TopKrafterItem[];

// Directory Item Schema
export const KrafterDirectoryItemSchema = z
  .object({
    id: z.string(),
    displayUserId: z.string().nullish(),
    name: z.string().default("Krafter"),
    displayName: z.string().nullish(),
    email: z.string().nullish(),
    phone: z.string().nullish(),
    primaryTrade: z.string().nullish(),
    category: z.string().nullish(),
    trade: z.string().nullish(),
    country: z.string().nullish(),
    city: z.string().nullish(),
    location: z.string().nullish(),
    rating: z.coerce.number().nullish(),
    completedKrafts: z.coerce.number().default(0),
    status: z.string().default("ACTIVE"),
    verificationStatus: z.string().nullish(),
    lastActive: z.string().nullish(),
    profilePhotoUrl: z.string().nullish(),
    viewPath: z.string().nullish()
  })
  .passthrough();

export type KrafterDirectoryItem = z.infer<typeof KrafterDirectoryItemSchema>;

export const KrafterDirectoryResponseSchema = z.union([
  z
    .object({
      period: z.string().nullish(),
      status: z.string().nullish(),
      category: z.string().nullish(),
      data: z.array(KrafterDirectoryItemSchema).default([]),
      total: z.coerce.number().default(0),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
      totalPages: z.coerce.number().default(1)
    })
    .passthrough(),
  z.array(KrafterDirectoryItemSchema).transform((arr) => ({
    period: "this_month",
    status: "all",
    category: "all",
    data: arr,
    total: arr.length,
    page: 1,
    limit: arr.length || 10,
    totalPages: 1
  }))
]);

export type KrafterDirectoryResponse = z.infer<
  typeof KrafterDirectoryResponseSchema
>;

export interface KrafterDirectoryParams {
  period?: KrafterPeriod | string;
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "verified" | "restricted" | string;
  category?: string;
  restricted?: boolean;
}

// Verification Queue Item Schema
export const KrafterVerificationItemSchema = z
  .object({
    id: z.string().nullish(),
    krafterId: z.string(),
    krafterName: z.string().default("Krafter"),
    email: z.string().nullish(),
    trade: z.string().nullish(),
    category: z.string().nullish(),
    documentId: z.string(),
    documentType: z.string().nullish(),
    documentUrl: z.string().nullish(),
    submittedAt: z.string().nullish(),
    status: z.string().default("PENDING")
  })
  .passthrough();

export type KrafterVerificationItem = z.infer<
  typeof KrafterVerificationItemSchema
>;

export const KrafterVerificationQueueResponseSchema = z
  .object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    total: z.coerce.number().default(0),
    totalPendingLabel: z.string().default("0 Pending"),
    items: z.array(KrafterVerificationItemSchema).default([]),
    filtered: z.boolean().default(false),
    legacy: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type KrafterVerificationQueueResponse = z.infer<
  typeof KrafterVerificationQueueResponseSchema
>;

// Restricted Summary
export const KrafterRestrictedSummarySchema = z
  .object({
    flaggedCount: z.coerce.number().default(0),
    definition: z.string().nullish(),
    listPath: z.string().default("/admin/krafters/restricted"),
    unifiedListPath: z.string().default("/admin/restricted-users")
  })
  .passthrough();

export type KrafterRestrictedSummary = z.infer<
  typeof KrafterRestrictedSummarySchema
>;

// Krafter Detail Profile Schema
export const KrafterDetailHeaderSchema = z
  .object({
    profilePhotoUrl: z.string().nullish(),
    name: z.string().default("Krafter"),
    displayName: z.string().nullish(),
    rating: z.coerce.number().nullish(),
    reviewCount: z.coerce.number().default(0),
    location: z.string().nullish(),
    verified: z.boolean().default(false),
    status: z.string().default("ACTIVE"),
    primaryTrade: z.string().nullish(),
    joinedDate: z.string().nullish(),
    lastActive: z.string().nullish()
  })
  .passthrough();

export const KrafterDetailAccountSchema = z
  .object({
    userId: z.string().default(""),
    email: z
      .object({
        value: z.string().default(""),
        verified: z.boolean().default(false)
      })
      .default({ value: "", verified: false }),
    phone: z.string().nullish(),
    bio: z.string().nullish(),
    occupationDescription: z.string().nullish(),
    uniqueSellingPoint: z.string().nullish(),
    languages: z.array(z.string()).default([]),
    verifiedAddress: z.string().nullish(),
    stats: z
      .object({
        totalEarnings: z
          .object({
            value: z.coerce.number().default(0),
            currency: z.string().default("GBP"),
            formatted: z.string().nullish()
          })
          .default({ value: 0, currency: "GBP" }),
        totalKraftsCompleted: z.coerce.number().default(0),
        completionRate: z.coerce.number().default(0),
        payoutsAdminPath: z.string().nullish()
      })
      .passthrough()
      .default({
        totalEarnings: { value: 0, currency: "GBP" },
        totalKraftsCompleted: 0,
        completionRate: 0
      })
  })
  .passthrough();

export const KrafterSkillOfferingSchema = z
  .object({
    serviceCategoryId: z.string().nullish(),
    serviceCategoryName: z.string().nullish(),
    pricingType: z.string().nullish(),
    hourlyRate: z.coerce.number().nullish(),
    flatRate: z.coerce.number().nullish(),
    experienceYears: z.coerce.number().nullish()
  })
  .passthrough();

export type KrafterSkillOffering = z.infer<typeof KrafterSkillOfferingSchema>;

export const KrafterDetailResponseSchema = z
  .object({
    id: z.string(),
    displayUserId: z.string().nullish(),
    header: KrafterDetailHeaderSchema.default({}),
    account: KrafterDetailAccountSchema.default({}),
    skillOfferings: z.array(KrafterSkillOfferingSchema).default([]),
    adminActions: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type KrafterDetailResponse = z.infer<typeof KrafterDetailResponseSchema>;

// DTOs
export interface AdminKrafterUpdateDto {
  email?: string;
  phone?: string;
  bio?: string;
  occupationDescription?: string;
  uniqueSellingPoint?: string;
  languages?: string[];
  serviceCategoryOfferings?: KrafterSkillOffering[];
}

export interface AdminKrafterRejectApplicationDto {
  reason:
    | "incomplete_documentation"
    | "qualifications_not_verified"
    | "background_check_failed"
    | "service_area_not_covered"
    | "other";
  additionalComments?: string;
  documentId?: string;
}

export interface RestrictKrafterPayload {
  duration?: string;
  reason?: string;
  reasonDetail?: string;
  adminNotes?: string;
  notifyUser?: boolean;
}

// Krafter Activity Logs
export const KrafterActivityLogItemSchema = z
  .object({
    id: z.string(),
    title: z.string().default("Activity"),
    description: z.string().default(""),
    type: z.string().default("general"),
    occurredAt: z.string().nullish(),
    metadata: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type KrafterActivityLogItem = z.infer<
  typeof KrafterActivityLogItemSchema
>;

export const KrafterActivityLogsResponseSchema = z.union([
  z
    .object({
      data: z.array(KrafterActivityLogItemSchema).default([]),
      total: z.coerce.number().default(0),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
      totalPages: z.coerce.number().default(1)
    })
    .passthrough(),
  z.array(KrafterActivityLogItemSchema).transform((arr) => ({
    data: arr,
    total: arr.length,
    page: 1,
    limit: arr.length || 10,
    totalPages: 1
  }))
]);

export type KrafterActivityLogsResponse = z.infer<
  typeof KrafterActivityLogsResponseSchema
>;

// Krafter Payment Methods
export const KrafterPaymentMethodItemSchema = z
  .object({
    id: z.string().nullish(),
    brand: z.string().nullish(),
    last4: z.string().nullish(),
    name: z.string().nullish(),
    isDefault: z.boolean().default(false),
    expMonth: z.coerce.number().nullish(),
    expYear: z.coerce.number().nullish()
  })
  .passthrough();

export type KrafterPaymentMethodItem = z.infer<
  typeof KrafterPaymentMethodItemSchema
>;

export const KrafterPaymentMethodsResponseSchema = z
  .object({
    items: z.array(KrafterPaymentMethodItemSchema).default([]),
    payoutHistoryPath: z.string().nullish()
  })
  .passthrough();

export type KrafterPaymentMethodsResponse = z.infer<
  typeof KrafterPaymentMethodsResponseSchema
>;

// Krafter Payment History
export const KrafterPaymentHistoryItemSchema = z
  .object({
    id: z.string().nullish(),
    transactionId: z.string().nullish(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          formatted: z.string().nullish()
        })
      ])
      .nullish(),
    currency: z.string().default("GBP"),
    status: z.string().nullish(),
    type: z.string().nullish(),
    description: z.string().nullish(),
    date: z.string().nullish(),
    createdAt: z.string().nullish(),
    fee: z.union([z.number(), z.string()]).nullish(),
    netAmount: z.union([z.number(), z.string()]).nullish(),
    destination: z.string().nullish()
  })
  .passthrough();

export type KrafterPaymentHistoryItem = z.infer<
  typeof KrafterPaymentHistoryItemSchema
>;

export const KrafterPaymentHistoryResponseSchema = z
  .object({
    data: z.array(KrafterPaymentHistoryItemSchema).default([]),
    items: z.array(KrafterPaymentHistoryItemSchema).optional(),
    total: z.coerce.number().default(0),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    totalPages: z.coerce.number().default(1)
  })
  .passthrough()
  .transform((res) => ({
    ...res,
    data: res.data && res.data.length > 0 ? res.data : (res.items ?? [])
  }));

export type KrafterPaymentHistoryResponse = z.infer<
  typeof KrafterPaymentHistoryResponseSchema
>;

// Re-export Restricted Users types for Krafter Management convenience
export type {
  RestrictedUserRow,
  RestrictedUsersListParams,
  ApplyAccountRestrictionDto,
  LiftRestrictionDto,
  AdminModerationNoteDto,
  ProfileLogItem
} from "@/types/restricted-users";
