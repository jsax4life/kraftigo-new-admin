import { z } from "zod";

export const StaffRoleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATIONS",
  "SUPPORT",
  "ACCOUNTING"
]);

export type StaffRole = z.infer<typeof StaffRoleEnum>;

export const StaffRoleOptionSchema = z.object({
  value: StaffRoleEnum,
  label: z.string()
});

export type StaffRoleOption = z.infer<typeof StaffRoleOptionSchema>;

export const StaffRolesResponseSchema = z.object({
  roles: z.array(StaffRoleOptionSchema)
});

export type StaffRolesResponse = z.infer<typeof StaffRolesResponseSchema>;

export const StaffStatusEnum = z.enum([
  "all",
  "active",
  "inactive",
  "active_recently"
]);

export type StaffStatus = z.infer<typeof StaffStatusEnum>;

export const StaffPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);

export type StaffPeriod = z.infer<typeof StaffPeriodEnum>;

export const StaffMemberRowSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    userId: z.string().optional(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    staffRole: z.string().nullish(),
    role: z.string().nullish(),
    status: z.string().nullish(),
    profilePhotoUrl: z.string().nullish(),
    lastActiveAt: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish()
  })
  .passthrough();

export type StaffMemberRow = z.infer<typeof StaffMemberRowSchema>;

export type StaffListParams = {
  page?: number;
  limit?: number;
  search?: string;
  staffRole?: StaffRole | string;
  status?: StaffStatus | string;
  period?: StaffPeriod | string;
};

export const AdminStaffCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("A valid email is required"),
  staffRole: StaffRoleEnum,
  profilePhotoUrl: z.string().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal(""))
});

export type AdminStaffCreateDto = z.infer<typeof AdminStaffCreateSchema>;

export const AdminStaffUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  staffRole: StaffRoleEnum.optional(),
  profilePhotoUrl: z.string().optional()
});

export type AdminStaffUpdateDto = z.infer<typeof AdminStaffUpdateSchema>;

export const StaffDetailSchema = StaffMemberRowSchema.extend({
  phone: z.string().nullish(),
  activitiesCount: z.coerce.number().optional()
}).passthrough();

export type StaffDetail = z.infer<typeof StaffDetailSchema>;

export const StaffActivityLogSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    action: z.string().nullish(),
    description: z.string().nullish(),
    ipAddress: z.string().nullish(),
    createdAt: z.string().nullish()
  })
  .passthrough();

export type StaffActivityLog = z.infer<typeof StaffActivityLogSchema>;
