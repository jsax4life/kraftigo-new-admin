import { z } from "zod";

const NullableRecord = z.record(z.string(), z.unknown()).nullish();

export const AdminBookingSchema = z
  .object({
    id: z.string(),
    status: z.string().nullish(),
    jobTitle: z.string().nullish(),
    jobDescription: z.string().nullish(),
    customerId: z.string().nullish(),
    artisanId: z.string().nullish(),
    serviceCategoryId: z.string().nullish(),
    categoryId: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
    preferredDate: z.string().nullish(),
    preferredTime: z.string().nullish(),
    address: z.string().nullish(),
    customer: NullableRecord,
    artisan: NullableRecord,
    krafter: NullableRecord,
    serviceCategory: NullableRecord,
    category: NullableRecord,
    serviceListing: NullableRecord
  })
  .passthrough();

export type AdminBooking = z.infer<typeof AdminBookingSchema>;

export type AdminBookingsListParams = {
  page?: number;
  limit?: number;
  status?: string;
  customerId?: string;
  artisanId?: string;
  categoryId?: string;
};
