import { z } from "zod";

export const MarketingPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);

export type MarketingPeriod = z.infer<typeof MarketingPeriodEnum>;

export const MarketingSummaryResponseSchema = z
  .object({
    period: z.string().optional(),
    range: z
      .object({
        from: z.string().nullish(),
        to: z.string().nullish(),
        label: z.string().nullish()
      })
      .nullish(),
    metrics: z
      .object({
        totalDailyRevenue: z
          .object({
            value: z.coerce.number().default(0),
            currency: z.string().default("GBP"),
            date: z.string().nullish()
          })
          .passthrough()
          .default({ value: 0, currency: "GBP" }),
        newKrafterRegistrations: z
          .object({
            value: z.coerce.number().default(0)
          })
          .passthrough()
          .default({ value: 0 }),
        totalActiveKrafts: z
          .object({
            value: z.coerce.number().default(0),
            utilizationPercent: z.coerce.number().nullish().default(0),
            registeredKrafters: z.coerce.number().nullish().default(0)
          })
          .passthrough()
          .default({ value: 0 }),
        pendingApprovals: z
          .object({
            value: z.coerce.number().default(0)
          })
          .passthrough()
          .default({ value: 0 })
      })
      .passthrough()
  })
  .passthrough();

export type MarketingSummaryResponse = z.infer<
  typeof MarketingSummaryResponseSchema
>;

export const CarouselBannerSchema = z
  .object({
    id: z.string(),
    title: z.string().default(""),
    imageUrl: z.string().default(""),
    scheduleStart: z.string().nullish(),
    scheduleEnd: z.string().nullish(),
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
    startsAt: z.string().nullish(),
    expiresAt: z.string().nullish(),
    startAt: z.string().nullish(),
    endAt: z.string().nullish(),
    schedule_start: z.string().nullish(),
    schedule_end: z.string().nullish(),
    ctaLabel: z.string().nullish(),
    ctaUrl: z.string().nullish(),
    isEnabled: z.coerce.boolean().default(true),
    sortOrder: z.coerce.number().default(0),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
  .passthrough()
  .transform((val) => {
    const rawStart =
      val.scheduleStart ||
      val.startDate ||
      val.startsAt ||
      val.startAt ||
      val.schedule_start ||
      val.createdAt ||
      new Date().toISOString();
    const rawEnd =
      val.scheduleEnd ||
      val.endDate ||
      val.expiresAt ||
      val.endAt ||
      val.schedule_end ||
      null;

    return {
      ...val,
      scheduleStart: String(rawStart),
      scheduleEnd: rawEnd ? String(rawEnd) : null
    };
  });

export type CarouselBanner = z.infer<typeof CarouselBannerSchema>;

export const CarouselListResponseSchema = z
  .object({
    maxBanners: z.coerce.number().default(8),
    uploadHint: z
      .string()
      .default("Upload up to 8 images (3MB max each)."),
    banners: z.array(CarouselBannerSchema).default([])
  })
  .passthrough();

export type CarouselListResponse = z.infer<typeof CarouselListResponseSchema>;

export const CreateCarouselBannerDtoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  imageUrl: z.string().min(1, "Image URL is required"),
  scheduleStart: z.string().min(1, "Start date is required"),
  scheduleEnd: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaUrl: z.string().optional().nullable(),
  isEnabled: z.boolean().default(true),
  sortOrder: z.number().default(0)
});

export type CreateCarouselBannerDto = z.infer<
  typeof CreateCarouselBannerDtoSchema
>;

export const UpdateCarouselBannerDtoSchema = CreateCarouselBannerDtoSchema.partial();
export type UpdateCarouselBannerDto = z.infer<
  typeof UpdateCarouselBannerDtoSchema
>;

export const CouponSchema = z
  .object({
    id: z.string(),
    code: z.string(),
    discountPercent: z.coerce.number().default(0),
    startsAt: z.string().nullish(),
    expiresAt: z.string().nullish(),
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
    startAt: z.string().nullish(),
    endAt: z.string().nullish(),
    validFrom: z.string().nullish(),
    validUntil: z.string().nullish(),
    maxUses: z.coerce.number().nullish(),
    usedCount: z.coerce.number().nullish(),
    currentUses: z.coerce.number().nullish(),
    redemptions: z.coerce.number().nullish(),
    isActive: z.coerce.boolean().default(true),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
  .passthrough()
  .transform((val) => {
    const rawStart =
      val.startsAt ||
      val.startDate ||
      val.startAt ||
      val.validFrom ||
      val.createdAt ||
      new Date().toISOString();
    const rawEnd =
      val.expiresAt ||
      val.endDate ||
      val.endAt ||
      val.validUntil ||
      new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    return {
      ...val,
      startsAt: String(rawStart),
      expiresAt: String(rawEnd)
    };
  });

export type Coupon = z.infer<typeof CouponSchema>;

export const CouponsListResponseSchema = z
  .object({
    coupons: z.array(CouponSchema).default([])
  })
  .passthrough();

export type CouponsListResponse = z.infer<typeof CouponsListResponseSchema>;

export const CreateCouponDtoSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required")
    .transform((val) => val.toUpperCase().trim()),
  discountPercent: z
    .coerce
    .number()
    .min(1, "Discount must be at least 1%")
    .max(100, "Discount cannot exceed 100%"),
  startsAt: z.string().min(1, "Start date is required"),
  expiresAt: z.string().min(1, "Expiry date is required"),
  maxUses: z.coerce.number().optional().nullable()
});

export type CreateCouponDto = z.infer<typeof CreateCouponDtoSchema>;

export const UpdateCouponDtoSchema = z.object({
  discountPercent: z.coerce.number().min(1).max(100).optional(),
  startsAt: z.string().optional(),
  expiresAt: z.string().optional(),
  maxUses: z.coerce.number().optional().nullable(),
  isActive: z.boolean().optional()
});

export type UpdateCouponDto = z.infer<typeof UpdateCouponDtoSchema>;
