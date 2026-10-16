"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  connectAdminEventsSocket,
  disconnectAdminEventsSocket
} from "@/lib/admin-events-socket";
import { hasFraudPreventionApiAccess } from "@/lib/fraud-prevention-auth";
import { useAuth } from "@/hooks/useAuth";

/** Subscribes to `/events` Socket.IO namespace and invalidates REST queries on fraud events. */
export function AdminEventsListener() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !hasFraudPreventionApiAccess(user)) return;

    connectAdminEventsSocket(queryClient);
    return () => {
      disconnectAdminEventsSocket();
    };
  }, [isAuthenticated, user, queryClient]);

  return null;
}
