import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { AdminEventsListener } from "@/components/fraud/admin-events-listener";

export default function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  // Note: Auth check is handled client-side via useAuth hook
  // Server-side cookie check is skipped since we're using localStorage for accessToken
  // TODO: When backend sets httpOnly cookies, re-enable server-side check with getAdminFromRequest()
  
  return (
    <AdminShell>
      <AdminEventsListener />
      {children}
    </AdminShell>
  );
}

