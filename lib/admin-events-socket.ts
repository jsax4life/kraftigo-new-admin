"use client";

import type { QueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/api-client";
import { getAccessToken } from "@/lib/token-storage";

export type AdminSocketEvent = {
  type?: string;
  timestamp?: string;
  source?: string;
  bookingId?: string;
  disputeId?: string;
  [key: string]: unknown;
};

function getSocketBaseUrl(): string {
  return process.env.NEXT_PUBLIC_WS_BASE_URL ?? getApiBaseUrl();
}

function invalidateForEvent(queryClient: QueryClient, event: AdminSocketEvent) {
  const type = event.type ?? "";

  if (type.includes("DISPUTE")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
    if (event.disputeId) {
      queryClient.invalidateQueries({
        queryKey: ["admin", "disputes", event.disputeId]
      });
    }
  }

  if (
    type.includes("PAYMENT") ||
    type.includes("ALERT") ||
    type.includes("RECONCILE")
  ) {
    queryClient.invalidateQueries({ queryKey: ["admin", "payments-ops"] });
  }

  if (type.includes("RISK")) {
    queryClient.invalidateQueries({ queryKey: ["admin", "risk"] });
  }

  if (event.bookingId) {
    queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
  }
}

let socket: Socket | null = null;

export function connectAdminEventsSocket(queryClient: QueryClient): Socket {
  if (socket?.connected) return socket;

  const token = getAccessToken();
  socket = io(`${getSocketBaseUrl()}/events`, {
    auth: token ? { token } : undefined,
    transports: ["websocket", "polling"],
    autoConnect: true
  });

  socket.on("event", (payload: AdminSocketEvent) => {
    invalidateForEvent(queryClient, payload);
  });

  return socket;
}

export function disconnectAdminEventsSocket() {
  socket?.disconnect();
  socket = null;
}
