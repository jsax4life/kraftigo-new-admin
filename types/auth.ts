import { z } from "zod";

export const AdminRoleSchema = z.enum([
  "SUPER_ADMIN",
  "ADMIN",
  "SUPPORT",
  "ANALYST"
]);

export type AdminRole = z.infer<typeof AdminRoleSchema>;

// API User response schema (matches actual backend response)
export const ApiUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  roles: z.array(z.string()),
  status: z.string(),
  phone: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  hasAcceptedTerms: z.boolean().optional(),
  isSubscribedToNewsletter: z.boolean().optional(),
  isSubscribedToProductUpdates: z.boolean().optional(),
  emailVerifiedAt: z.string().nullable().optional(),
  deletedAt: z.string().nullable().optional()
});

export type ApiUser = z.infer<typeof ApiUserSchema>;

// Login response schema
export const LoginResponseSchema = z.object({
  user: ApiUserSchema,
  accessToken: z.string(),
  refreshToken: z.string()
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Refresh response schema
export const RefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  user: ApiUserSchema.optional()
});

export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// Admin user (normalized from API user)
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  roles: z.array(AdminRoleSchema),
  status: z.string(),
  phone: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// Helper to check if user has admin role
export function hasAdminRole(user: ApiUser | AdminUser): boolean {
  const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "ANALYST"];
  return user.roles.some((role) => adminRoles.includes(role));
}

