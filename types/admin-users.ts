import { z } from "zod";

import type { AdminProfileRow } from "@/types/admin-profiles";

export const OnboardingMissingSectionSchema = z.object({
  label: z.string(),
  status: z.string()
});

export type OnboardingMissingSection = z.infer<
  typeof OnboardingMissingSectionSchema
>;

export const KrafterOnboardingSchema = z
  .object({
    allComplete: z.boolean().optional(),
    completionPercent: z.coerce.number().optional(),
    hoursSinceSignup: z.coerce.number().optional(),
    kycStatus: z.string().nullish(),
    missingSections: z.array(OnboardingMissingSectionSchema).optional(),
    profileReminder1hSentAt: z.string().nullable().optional(),
    profileReminder48hSentAt: z.string().nullable().optional()
  })
  .passthrough();

export type KrafterOnboarding = z.infer<typeof KrafterOnboardingSchema>;

export const KrafterLocationSchema = z
  .object({
    street: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    postalCode: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    latitude: z.coerce.number().nullable().optional(),
    longitude: z.coerce.number().nullable().optional(),
    addressCompleted: z.boolean().optional(),
    formattedAddress: z.string().nullable().optional()
  })
  .passthrough();

export type KrafterLocation = z.infer<typeof KrafterLocationSchema>;

export const ProfileReminderTemplateSchema = z.enum(["auto", "1h", "48h"]);

export type ProfileReminderTemplate = z.infer<
  typeof ProfileReminderTemplateSchema
>;

export const SendProfileReminderResponseSchema = z
  .object({
    sent: z.boolean(),
    template: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    missingSections: z.array(OnboardingMissingSectionSchema).optional(),
    onboarding: KrafterOnboardingSchema.nullish(),
    location: KrafterLocationSchema.nullish()
  })
  .passthrough();

export type SendProfileReminderResponse = z.infer<
  typeof SendProfileReminderResponseSchema
>;

export const AdminUserRowSchema = z
  .object({
    id: z.string(),
    email: z.string().optional(),
    status: z.string().optional(),
    roles: z.array(z.string()).optional(),
    phone: z.string().nullable().optional(),
    nationality: z.string().nullable().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    hasStartedArtisanOnboarding: z.boolean().optional(),
    onboarding: KrafterOnboardingSchema.nullish(),
    location: KrafterLocationSchema.nullish()
  })
  .passthrough();

export type AdminUserRow = z.infer<typeof AdminUserRowSchema>;

export type AdminUserWithProfile = AdminUserRow & {
  profile?: AdminProfileRow;
};

export type AdminUsersListParams = {
  page?: number;
  limit?: number;
  locationCity?: string;
  locationCountry?: string;
  city?: string;
};

export const KrafterLocationSummarySchema = z
  .object({
    city: z.string(),
    country: z.string().nullable().optional(),
    label: z.string().optional(),
    count: z.coerce.number().optional(),
    krafterCount: z.coerce.number().optional()
  })
  .passthrough();

export type KrafterLocationSummary = z.infer<
  typeof KrafterLocationSummarySchema
>;

export type SendProfileReminderDto = {
  template?: ProfileReminderTemplate;
};
