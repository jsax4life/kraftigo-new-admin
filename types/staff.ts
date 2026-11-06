import { z } from "zod";

export const StaffRoleEnum = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "OPERATIONS",
  "SUPPORT",
  "ACCOUNTING"
]);

export type StaffRole = z.infer<typeof StaffRoleEnum>;

export const StaffRoleOptionSchema = z
  .object({
    value: z.string(),
    label: z.string().optional()
  })
  .passthrough()
  .transform((item) => ({
    value: (item.value || item.label || "") as StaffRole,
    label: item.label || item.value || ""
  }));

export type StaffRoleOption = z.infer<typeof StaffRoleOptionSchema>;

export const StaffRolesResponseSchema = z.preprocess((val) => {
  if (Array.isArray(val)) {
    return {
      roles: val.map((r) =>
        typeof r === "string" ? { value: r, label: r.replace(/_/g, " ") } : r
      )
    };
  }
  if (val && typeof val === "object") {
    const o = val as Record<string, unknown>;
    const list = Array.isArray(o.roles)
      ? o.roles
      : Array.isArray(o.data)
      ? o.data
      : Array.isArray(o.items)
      ? o.items
      : [];
    return {
      ...o,
      roles: list.map((r: any) =>
        typeof r === "string" ? { value: r, label: r.replace(/_/g, " ") } : r
      )
    };
  }
  return { roles: [] };
}, z.object({
  roles: z.array(StaffRoleOptionSchema)
}));

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

export function normalizeStaffPayload(val: unknown): unknown {
  if (!val || typeof val !== "object" || Array.isArray(val)) {
    return val;
  }
  const obj = val as Record<string, unknown>;
  const cards = (obj.cards && typeof obj.cards === "object" ? obj.cards : {}) as Record<string, unknown>;
  const header = (obj.header && typeof obj.header === "object" ? obj.header : {}) as Record<string, unknown>;
  const user = (obj.user && typeof obj.user === "object" ? obj.user : {}) as Record<string, unknown>;
  const account = (obj.account && typeof obj.account === "object" ? obj.account : {}) as Record<string, unknown>;
  const profile = (obj.profile && typeof obj.profile === "object" ? obj.profile : {}) as Record<string, unknown>;
  const staffMember = (obj.staff && typeof obj.staff === "object" ? obj.staff : {}) as Record<string, unknown>;

  const email =
    obj.email ||
    cards.email ||
    obj.emailAddress ||
    user.email ||
    user.emailAddress ||
    account.email ||
    account.emailAddress ||
    staffMember.email ||
    null;

  const name =
    obj.name ||
    header.name ||
    user.name ||
    account.name ||
    profile.name ||
    staffMember.name ||
    obj.fullName ||
    user.fullName ||
    null;

  let firstName =
    obj.firstName ||
    user.firstName ||
    account.firstName ||
    profile.firstName ||
    staffMember.firstName ||
    null;

  let lastName =
    obj.lastName ||
    user.lastName ||
    account.lastName ||
    profile.lastName ||
    staffMember.lastName ||
    null;

  if (!firstName && !lastName && typeof name === "string" && name.trim()) {
    const parts = name.trim().split(/\s+/);
    firstName = parts[0] || null;
    lastName = parts.slice(1).join(" ") || null;
  }

  const profilePhotoUrl =
    obj.profilePhotoUrl ||
    header.profilePhotoUrl ||
    obj.avatarUrl ||
    obj.avatar ||
    obj.photoUrl ||
    user.profilePhotoUrl ||
    user.avatarUrl ||
    null;

  const staffRole =
    obj.staffRole ||
    cards.staffRole ||
    obj.role ||
    user.role ||
    user.staffRole ||
    staffMember.staffRole ||
    "ADMIN";

  const status =
    obj.status ||
    obj.accountStatus ||
    user.status ||
    (cards.lastActive && typeof cards.lastActive === "object" ? (cards.lastActive as any).label : undefined) ||
    "active";

  const displayStaffId =
    obj.displayStaffId ||
    cards.displayStaffId ||
    header.displayStaffId ||
    obj.staffId ||
    null;

  return {
    ...obj,
    email,
    name,
    firstName,
    lastName,
    profilePhotoUrl,
    staffRole,
    status,
    displayStaffId
  };
}

const StaffMemberRawSchema = z
  .object({
    id: z.union([z.string(), z.number()]).transform((v) => String(v)),
    userId: z.string().optional(),
    displayStaffId: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    name: z.string().nullish(),
    email: z.string().nullish(),
    staffRole: z.string().nullish(),
    role: z.string().nullish(),
    status: z.string().nullish(),
    accountStatus: z.string().nullish(),
    profilePhotoUrl: z.string().nullish(),
    lastActiveAt: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
    phone: z.string().nullish(),
    header: z.any().optional(),
    cards: z.any().optional(),
    primaryActions: z.any().optional()
  })
  .passthrough();

export const StaffMemberRowSchema = z.preprocess(
  normalizeStaffPayload,
  StaffMemberRawSchema
);

export type StaffMemberRow = z.infer<typeof StaffMemberRawSchema>;

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
  staffRole: z.union([StaffRoleEnum, z.string()]),
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
  staffRole: z.union([StaffRoleEnum, z.string()]).optional(),
  profilePhotoUrl: z.string().optional()
});

export type AdminStaffUpdateDto = z.infer<typeof AdminStaffUpdateSchema>;

export const StaffDetailSchema = StaffMemberRowSchema;

export type StaffDetail = z.infer<typeof StaffMemberRawSchema>;

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
