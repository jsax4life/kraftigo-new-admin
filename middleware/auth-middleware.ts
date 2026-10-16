import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AdminJwtSchema } from "@/lib/auth";
import { canAccess, type Permission } from "@/lib/permissions";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico"];

function requiredPermissionForPath(pathname: string): Permission | null {
  if (pathname.startsWith("/admin/analytics")) return "VIEW_ANALYTICS";
  if (pathname.startsWith("/admin/krafters")) return "MANAGE_USERS";
  if (pathname.startsWith("/admin/work-eligibility")) return "MANAGE_USERS";
  if (pathname.startsWith("/admin/customers")) return "VIEW_USERS";
  if (pathname.startsWith("/admin/bookings")) return "VIEW_BOOKINGS";
  if (pathname.startsWith("/admin/disputes")) return "VIEW_BOOKINGS";
  if (pathname.startsWith("/admin/risk")) return "MANAGE_USERS";
  if (pathname.startsWith("/admin/payment-operations")) return "VIEW_BOOKINGS";
  if (pathname.startsWith("/admin/services")) return "MANAGE_SERVICES";
  // dashboard, waitlist, settings – accessible to any authenticated admin
  return null;
}

export function authMiddleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    // Note: Currently using localStorage for accessToken (client-side)
    // Server-side cookie check is skipped - auth is handled client-side via AdminShell
    // TODO: When backend sets httpOnly cookies, re-enable server-side cookie check
    
    // For now, allow access and let client-side AdminShell handle auth redirect
    // This allows the page to load, then AdminShell will redirect if not authenticated
  }

  return NextResponse.next();
}

