import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  unwrapEntityPayload,
  type PaginatedResult
} from "@/lib/admin-api";
import {
  AdminBookingSchema,
  type AdminBooking,
  type AdminBookingsListParams
} from "@/types/admin-bookings";
import {
  ExpireOverdueSweepResultSchema,
  type ExpireOverdueSweepResult
} from "@/types/bookings-admin";

function bookingsQueryParams(params?: AdminBookingsListParams) {
  return {
    ...(params?.page != null ? { page: params.page } : {}),
    ...(params?.limit != null ? { limit: params.limit } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.customerId ? { customerId: params.customerId } : {}),
    ...(params?.artisanId ? { artisanId: params.artisanId } : {}),
    ...(params?.categoryId ? { categoryId: params.categoryId } : {})
  };
}

export const bookingsAdminService = {
  async listOpen(
    params?: Pick<AdminBookingsListParams, "page" | "limit">
  ): Promise<PaginatedResult<AdminBooking>> {
    const res = await apiClient.get("/api/admin/bookings/open", {
      params: bookingsQueryParams(params)
    });
    return parsePaginatedResponse(AdminBookingSchema, res.data, "open bookings");
  },

  async listAll(
    params?: AdminBookingsListParams
  ): Promise<PaginatedResult<AdminBooking>> {
    const res = await apiClient.get("/api/admin/bookings", {
      params: bookingsQueryParams(params)
    });
    return parsePaginatedResponse(AdminBookingSchema, res.data, "bookings");
  },

  async runExpireOverdueSweep(): Promise<ExpireOverdueSweepResult> {
    const res = await apiClient.post(
      "/api/admin/bookings/expire-overdue/run"
    );
    const raw = unwrapEntityPayload(res.data);
    return parseEntityResponse(
      ExpireOverdueSweepResultSchema,
      raw,
      "expire-overdue sweep"
    );
  }
};
