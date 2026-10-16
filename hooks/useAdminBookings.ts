"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingsAdminService } from "@/services/bookings-admin.service";
import type { PaginatedResult } from "@/lib/admin-api";
import type {
  AdminBooking,
  AdminBookingsListParams
} from "@/types/admin-bookings";

export function useAdminBookings(params: AdminBookingsListParams) {
  return useQuery<PaginatedResult<AdminBooking>, Error>({
    queryKey: ["admin", "bookings", params],
    queryFn: () => bookingsAdminService.listAll(params)
  });
}

export function useAdminOpenBookings(
  params?: Pick<AdminBookingsListParams, "page" | "limit">
) {
  return useQuery<PaginatedResult<AdminBooking>, Error>({
    queryKey: ["admin", "bookings", "open", params?.page ?? 1, params?.limit ?? 25],
    queryFn: () => bookingsAdminService.listOpen(params)
  });
}
