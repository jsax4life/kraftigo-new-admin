import axios from "axios";
import { apiClient, getApiBaseUrl } from "@/lib/api-client";
import {
  LoginResponseSchema,
  RefreshResponseSchema,
  AdminUserSchema,
  type AdminUser,
  hasAdminRole,
} from "@/types/auth";
import {
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  getAdminUser,
  setAdminUser,
  clearAuthStorage,
} from "@/lib/token-storage";

export type LoginInput = {
  email: string;
  password: string;
};

// Transform API user to AdminUser (filter roles to admin roles only)
function transformToAdminUser(apiUser: any): AdminUser | null {
  const adminRoles = ["SUPER_ADMIN", "ADMIN", "SUPPORT", "ANALYST"];
  const userRoles = apiUser.roles || [];
  const adminUserRoles = userRoles.filter((role: string) =>
    adminRoles.includes(role),
  );

  if (adminUserRoles.length === 0) {
    return null; // Not an admin
  }

  const parsed = AdminUserSchema.safeParse({
    id: apiUser.id,
    email: apiUser.email,
    roles: adminUserRoles,
    status: apiUser.status,
    phone: apiUser.phone || null,
    createdAt: apiUser.createdAt,
    updatedAt: apiUser.updatedAt,
  });

  if (!parsed.success) {
    console.error("AdminUserSchema validation error", parsed.error);
    console.error("Input data:", {
      id: apiUser.id,
      email: apiUser.email,
      roles: adminUserRoles,
      status: apiUser.status,
      phone: apiUser.phone || null,
      createdAt: apiUser.createdAt,
      updatedAt: apiUser.updatedAt,
    });
    return null;
  }

  return parsed.data;
}

export const authService = {
  /**
   * Login:
   * - POSTs credentials to backend
   * - stores accessToken in localStorage
   * - validates user has admin role
   * - returns the authenticated admin user
   */
  async login(payload: LoginInput): Promise<AdminUser> {
    console.log("authService.login: Starting login", { email: payload.email });
    const res = await apiClient.post("/api/auth/login", payload);
    console.log("authService.login: API response received", res.data);

    const parsed = LoginResponseSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error(
        "authService.login: Login response validation error",
        parsed.error,
      );
      console.error("authService.login: Response data", res.data);
      throw new Error("Unexpected login response structure");
    }

    const { user, accessToken, refreshToken } = parsed.data;
    console.log("authService.login: Parsed user", user);

    // Check if user has admin role
    const hasAdmin = hasAdminRole(user);
    console.log("authService.login: hasAdminRole check", {
      roles: user.roles,
      hasAdmin,
    });
    if (!hasAdmin) {
      console.error(
        "authService.login: User does not have admin role",
        user.roles,
      );
      throw new Error("Access denied: Admin role required");
    }

    // Transform to AdminUser
    const adminUser = transformToAdminUser(user);
    console.log("authService.login: transformToAdminUser result", adminUser);
    if (!adminUser) {
      console.error("authService.login: transformToAdminUser returned null");
      throw new Error("Access denied: Admin role required");
    }

    // Store tokens and user info
    setAccessToken(accessToken);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setAdminUser(adminUser);
    console.log("authService.login: Tokens and user stored");

    console.log(
      "authService.login: Login successful, returning adminUser",
      adminUser,
    );
    return adminUser;
  },

  /**
   * Logout:
   * - calls backend to clear session
   * - clears tokens and user info from storage
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post("/api/auth/logout");
    } catch {
      // Continue even if logout endpoint fails
    } finally {
      clearAuthStorage();
    }
  },

  /**
   * getCurrentUser:
   * - Placeholder implementation while /api/auth/me is not available.
   * - For now, returns null (user state is managed via login mutation cache).
   */
  async getCurrentUser(): Promise<AdminUser | null> {
    // Read the user from local storage to prevent losing session on HMR/reloads
    return getAdminUser();
  },

  /**
   * refreshToken:
   * - calls backend to refresh accessToken using stored refreshToken
   * - updates stored tokens
   */
  async refreshToken(): Promise<string | null> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthStorage();
      return null;
    }

    try {
      const res = await axios.post(
        `${getApiBaseUrl().replace(/\/$/, "")}/api/auth/refresh`,
        { refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      const parsed = RefreshResponseSchema.safeParse(res.data);
      if (parsed.success && parsed.data.accessToken) {
        setAccessToken(parsed.data.accessToken);
        if (parsed.data.refreshToken) {
          setRefreshToken(parsed.data.refreshToken);
        }
        return parsed.data.accessToken;
      }
      return null;
    } catch (err) {
      console.error("authService.refreshToken failed", err);
      clearAuthStorage();
      return null;
    }
  },

  /**
   * Stored token getters
   */
  getAccessToken,
  getRefreshToken,
};
