import type { AdminUser } from "@/types/auth";

const ACCESS_TOKEN_KEY = "kraftigo_access_token";
const REFRESH_TOKEN_KEY = "kraftigo_refresh_token";
const ADMIN_USER_KEY = "kraftigo_admin_user";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch {}
  }
}

export function removeAccessToken(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    } catch {}
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setRefreshToken(token: string): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {}
  }
}

export function removeRefreshToken(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {}
  }
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = window.localStorage.getItem(ADMIN_USER_KEY);
    if (!userStr) return null;
    return JSON.parse(userStr) as AdminUser;
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    } catch {}
  }
}

export function removeAdminUser(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(ADMIN_USER_KEY);
    } catch {}
  }
}

export function clearAuthStorage(): void {
  removeAccessToken();
  removeRefreshToken();
  removeAdminUser();
}

/**
 * Checks if a JWT token has expired based on its `exp` claim.
 * Adds a 5-second buffer to handle boundary conditions.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && typeof payload.exp === "number") {
      return Date.now() >= payload.exp * 1000 - 5000;
    }
    return false;
  } catch {
    return false;
  }
}
