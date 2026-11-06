import { z } from "zod";

// Sub-Kraft / Skill under a category
export const CategorySubKraftSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string().default("Kraft"),
    description: z.string().nullish(),
    iconUrl: z.string().nullish(),
    isActive: z.boolean().default(true),
    killSwitchActive: z.boolean().default(false),
    registeredKraftersCount: z.coerce.number().default(0)
  })
  .passthrough();

export type CategorySubKraft = z.infer<typeof CategorySubKraftSchema>;

// Category Item
export const KraftCategoryItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string().default("Category"),
    description: z.string().nullish(),
    imageUrl: z.string().nullish(),
    isActive: z.boolean().default(true),
    registeredKraftersCount: z.coerce.number().default(0),
    krafts: z.array(CategorySubKraftSchema).default([])
  })
  .passthrough();

export type KraftCategoryItem = z.infer<typeof KraftCategoryItemSchema>;

export const CustomKraftsEntrySchema = z
  .object({
    title: z.string().default("Custom Krafts"),
    description: z.string().default("See all custom Krafts on the platform"),
    totalCount: z.coerce.number().default(0)
  })
  .passthrough();

export type CustomKraftsEntry = z.infer<typeof CustomKraftsEntrySchema>;

// Top Performing Category / Kraft
export const TopPerformingKraftSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string().default("Top Kraft"),
    description: z.string().nullish(),
    imageUrl: z.string().nullish(),
    isActive: z.boolean().default(true),
    registeredKraftersCount: z.coerce.number().default(0)
  })
  .passthrough();

export type TopPerformingKraft = z.infer<typeof TopPerformingKraftSchema>;

// Categories List Response
export const KraftCategoriesResponseSchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return { categories: val };
  }
  if (val && typeof val === "object") {
    const o = val as Record<string, any>;
    if (Array.isArray(o.data)) {
      return { ...o, categories: o.data };
    }
  }
  return val;
}, z
  .object({
    categories: z.array(KraftCategoryItemSchema).default([]),
    customKraftsEntry: CustomKraftsEntrySchema.default({
      title: "Custom Krafts",
      description: "See all custom Krafts on the platform",
      totalCount: 0
    })
  })
  .passthrough());

export type KraftCategoriesResponse = z.infer<
  typeof KraftCategoriesResponseSchema
>;

// Custom Krafts Hub Metadata
export const CustomKraftsHubSchema = z
  .object({
    tabs: z
      .object({
        new: z.coerce.number().default(0),
        underReview: z.coerce.number().default(0),
        rejected: z.coerce.number().default(0)
      })
      .default({ new: 0, underReview: 0, rejected: 0 }),
    totalPublished: z.coerce.number().default(0)
  })
  .passthrough();

// Hub Landing Response
export const KraftHubResponseSchema = z
  .object({
    topPerforming: z.array(TopPerformingKraftSchema).default([]),
    categories: KraftCategoriesResponseSchema.default({
      categories: [],
      customKraftsEntry: {
        title: "Custom Krafts",
        description: "See all custom Krafts on the platform",
        totalCount: 0
      }
    }),
    customKrafts: CustomKraftsHubSchema.default({
      tabs: { new: 0, underReview: 0, rejected: 0 },
      totalPublished: 0
    })
  })
  .passthrough();

export type KraftHubResponse = z.infer<typeof KraftHubResponseSchema>;

// Custom Kraft Queue Item
export const CustomKraftQueueItemSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    description: z.string().default(""),
    photos: z.array(z.string()).default([]),
    roughCategoryId: z.string().nullish(),
    scheduledDate: z.string().nullish(),
    scheduledTime: z.string().nullish(),
    bookingHours: z.coerce.number().default(1),
    frequency: z.string().default("ONCE"),
    offerAmount: z.coerce.number().nullish(),
    openToNegotiation: z.boolean().default(false),
    status: z.string().default("NEW"),
    createdAt: z.string().nullish(),
    customer: z
      .object({
        id: z.string().nullish(),
        name: z.string().nullish(),
        avatarUrl: z.string().nullish(),
        email: z.string().nullish()
      })
      .nullish(),
    customerName: z.string().nullish(),
    customerAvatarUrl: z.string().nullish()
  })
  .passthrough();

export type CustomKraftQueueItem = z.infer<typeof CustomKraftQueueItemSchema>;

export const CustomKraftsListResponseSchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return { data: val, meta: { total: val.length, page: 1, limit: 10, totalPages: 1 } };
  }
  return val;
}, z
  .object({
    data: z.array(CustomKraftQueueItemSchema).default([]),
    meta: z
      .object({
        total: z.coerce.number().default(0),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(10),
        totalPages: z.coerce.number().default(1)
      })
      .passthrough()
      .default({ total: 0, page: 1, limit: 10, totalPages: 1 })
  })
  .passthrough());

export type CustomKraftsListResponse = z.infer<
  typeof CustomKraftsListResponseSchema
>;

// DTOs for mutations
export interface AdminCreateKraftCategoryDto {
  name: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface AdminUpdateKraftCategoryDto {
  name?: string;
  description?: string;
  imageUrl?: string | null;
  isActive?: boolean;
}

export interface AdminCreateCategoryKraftDto {
  name: string;
  description?: string;
  iconUrl?: string | null;
  isActive?: boolean;
}

export interface AdminCustomKraftReviewDto {
  status: "NEW" | "UNDER_REVIEW" | "REJECTED";
  rejectedReason?: string;
}

export interface AdminKraftKillSwitchDto {
  killSwitchActive: boolean;
}

export interface AdminUpdateKraftSkillDto {
  name?: string;
  description?: string;
  iconUrl?: string | null;
  killSwitchActive?: boolean;
}

export const CustomKraftsSummarySchema = z.preprocess((val) => {
  if (!val || typeof val !== "object") return val;
  const o = val as Record<string, any>;
  const root = o.data && typeof o.data === "object" ? o.data : o;
  if (!root.tabs && ("new" in root || "underReview" in root || "rejected" in root)) {
    return {
      tabs: {
        new: root.new ?? 0,
        underReview: root.underReview ?? 0,
        rejected: root.rejected ?? 0
      },
      totalPublished: root.totalPublished ?? 0
    };
  }
  return root;
}, z
  .object({
    tabs: z
      .object({
        new: z.coerce.number().default(0),
        underReview: z.coerce.number().default(0),
        rejected: z.coerce.number().default(0)
      })
      .default({ new: 0, underReview: 0, rejected: 0 }),
    totalPublished: z.coerce.number().default(0)
  })
  .passthrough());

export type CustomKraftsSummary = z.infer<typeof CustomKraftsSummarySchema>;

// Single Kraft Detail
export const KraftDetailSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    name: z.string(),
    description: z.string().nullish(),
    iconUrl: z.string().nullish(),
    killSwitchActive: z.boolean().default(false),
    isActive: z.boolean().default(true),
    categoryId: z.string().nullish(),
    categoryName: z.string().nullish()
  })
  .passthrough();

export type KraftDetail = z.infer<typeof KraftDetailSchema>;

// Kraft Metrics Schema (Krafters, Bookings, Avg Price, Completion Rate)
export const KraftMetricsSchema = z.preprocess((val) => {
  if (!val || typeof val !== "object") return val;
  const o = val as Record<string, any>;
  const root = o.data && typeof o.data === "object" ? o.data : o;
  let avgPrice = 0;
  let avgPriceFormatted: string | undefined = undefined;
  if (typeof root.avgPrice === "number") {
    avgPrice = root.avgPrice;
  } else if (typeof root.avgPrice === "string") {
    avgPrice = Number(root.avgPrice) || 0;
  } else if (root.avgPrice && typeof root.avgPrice === "object") {
    avgPrice = Number(root.avgPrice.value ?? root.avgPrice.amount ?? 0);
    avgPriceFormatted = typeof root.avgPrice.formatted === "string" ? root.avgPrice.formatted : undefined;
  }
  return {
    ...root,
    avgPrice,
    avgPriceFormatted: avgPriceFormatted ?? root.avgPriceFormatted
  };
}, z
  .object({
    krafters: z.coerce.number().default(0),
    bookings: z.coerce.number().default(0),
    avgPrice: z.coerce.number().default(0),
    avgPriceFormatted: z.string().nullish(),
    completionRate: z.coerce.number().default(0)
  })
  .passthrough());

export type KraftMetrics = z.infer<typeof KraftMetricsSchema>;

export const TopPerformingKraftsResponseSchema = z.union([
  z.array(TopPerformingKraftSchema),
  z
    .object({
      data: z.array(TopPerformingKraftSchema).default([])
    })
    .transform((o) => o.data)
]);

export type TopPerformingKraftsResponse = TopPerformingKraft[];

// Registered Krafters under Kraft
export const RegisteredKrafterItemSchema = z
  .object({
    id: z.string().nullish(),
    krafterId: z.string().nullish(),
    userId: z.string().nullish(),
    name: z.string().default("Krafter"),
    displayName: z.string().nullish(),
    profilePhotoUrl: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    rating: z.coerce.number().nullish(),
    reviewCount: z.coerce.number().default(0),
    completedKrafts: z.coerce.number().default(0),
    pricingType: z.string().nullish(),
    hourlyRate: z.coerce.number().nullish(),
    lastActive: z.string().nullish(),
    status: z.string().default("ACTIVE")
  })
  .passthrough();

export type RegisteredKrafterItem = z.infer<typeof RegisteredKrafterItemSchema>;

export const RegisteredKraftersResponseSchema = z.union([
  z.array(RegisteredKrafterItemSchema),
  z
    .object({
      data: z.array(RegisteredKrafterItemSchema).default([]),
      meta: z
        .object({
          total: z.coerce.number().default(0),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(20),
          totalPages: z.coerce.number().default(1)
        })
        .passthrough()
        .nullish(),
      total: z.coerce.number().nullish()
    })
    .passthrough()
]);

export type RegisteredKraftersResponse = z.infer<
  typeof RegisteredKraftersResponseSchema
>;

// Kraft Logs
export const KraftLogItemSchema = z
  .object({
    id: z.string().nullish(),
    action: z.string().default("ACTION"),
    description: z.string().default(""),
    adminName: z.string().nullish(),
    createdAt: z.string().nullish(),
    occurredAt: z.string().nullish(),
    metadata: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type KraftLogItem = z.infer<typeof KraftLogItemSchema>;

export const KraftLogsResponseSchema = z.union([
  z.array(KraftLogItemSchema),
  z
    .object({
      data: z.array(KraftLogItemSchema).default([]),
      meta: z
        .object({
          total: z.coerce.number().default(0),
          page: z.coerce.number().default(1),
          limit: z.coerce.number().default(30),
          totalPages: z.coerce.number().default(1)
        })
        .passthrough()
        .nullish()
    })
    .passthrough()
]);

export type KraftLogsResponse = z.infer<typeof KraftLogsResponseSchema>;

