import { z } from "zod";

export const AdminProfileRowSchema = z
  .object({
    id: z.string().optional(),
    userId: z.string().optional(),
    displayName: z.string().nullable().optional(),
    fullName: z.string().nullable().optional(),
    firstName: z.string().nullable().optional(),
    lastName: z.string().nullable().optional(),
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional()
  })
  .passthrough();

export type AdminProfileRow = z.infer<typeof AdminProfileRowSchema>;
