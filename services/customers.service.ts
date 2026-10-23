import { apiClient } from "@/lib/api-client";
import { parseEntityResponse } from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  CustomerSummaryResponseSchema,
  CustomersListResponseSchema,
  CustomerDetailResponseSchema,
  CustomerActivityLogsResponseSchema,
  CustomerPaymentMethodsResponseSchema,
  HighValueCustomersResponseSchema,
  CustomerRestrictedSummarySchema,
  CustomerPaymentHistoryResponseSchema,
  type CustomerSummaryResponse,
  type CustomersListResponse,
  type CustomerListParams,
  type CustomerDetailResponse,
  type PatchCustomerDto,
  type RestrictCustomerPayload,
  type CustomerActivityLogsParams,
  type CustomerActivityLogsResponse,
  type CustomerPaymentMethodsResponse,
  type CustomerPaymentHistoryResponse,
  type HighValueCustomer,
  type CustomerRestrictedSummary
} from "@/types/customers";

export const customersService = {
  async getSummary(
    period?: string
  ): Promise<CustomerSummaryResponse> {
    const res = await apiClient.get("/api/admin/customers/summary", {
      params: period ? { period } : undefined
    });
    return parseEntityResponse(
      CustomerSummaryResponseSchema,
      res.data,
      "customer summary"
    );
  },

  async list(
    params: CustomerListParams = {}
  ): Promise<CustomersListResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.restricted !== undefined) {
      queryParams.restricted = params.restricted;
    }

    const res = await apiClient.get("/api/admin/customers", {
      params: queryParams
    });

    return parseEntityResponse(
      CustomersListResponseSchema,
      res.data,
      "customer list"
    );
  },

  async getCustomer(id: string): Promise<CustomerDetailResponse> {
    const res = await apiClient.get(`/api/admin/customers/${id}`);
    return parseEntityResponse(
      CustomerDetailResponseSchema,
      res.data,
      "customer detail"
    );
  },

  async patchCustomer(
    id: string,
    dto: PatchCustomerDto
  ): Promise<CustomerDetailResponse> {
    const res = await apiClient.patch(`/api/admin/customers/${id}`, dto);
    return parseEntityResponse(
      CustomerDetailResponseSchema,
      res.data,
      "patched customer"
    );
  },

  async sendPasswordReset(id: string): Promise<void> {
    await apiClient.post(`/api/admin/customers/${id}/actions/send-password-reset`);
  },

  async restrictCustomer(
    id: string,
    payload?: RestrictCustomerPayload
  ): Promise<void> {
    await apiClient.post(`/api/admin/customers/${id}/actions/restrict`, payload);
  },

  async liftCustomerRestriction(id: string): Promise<void> {
    await apiClient.post(`/api/admin/customers/${id}/actions/lift-restriction`);
  },

  async deleteCustomer(id: string): Promise<void> {
    await apiClient.delete(`/api/admin/users/${id}`);
  },

  async getActivityLogs(
    id: string,
    params: CustomerActivityLogsParams = {}
  ): Promise<CustomerActivityLogsResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.activityType && params.activityType !== "all") {
      queryParams.activityType = params.activityType;
    }
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.timeRange) queryParams.timeRange = params.timeRange;

    const res = await apiClient.get(`/api/admin/customers/${id}/activity-logs`, {
      params: queryParams
    });

    return parseEntityResponse(
      CustomerActivityLogsResponseSchema,
      res.data,
      "customer activity logs"
    );
  },

  async exportActivityLogs(
    id: string,
    params: CustomerActivityLogsParams = {}
  ): Promise<void> {
    const queryParams: Record<string, string | number> = {};
    if (params.activityType && params.activityType !== "all") {
      queryParams.activityType = params.activityType;
    }
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.timeRange) queryParams.timeRange = params.timeRange;

    await fetchCsvExport(
      `/api/admin/customers/${id}/activity-logs/export`,
      `customer-${id}-activity-logs.csv`,
      { params: queryParams }
    );
  },

  async getPaymentMethods(
    id: string
  ): Promise<CustomerPaymentMethodsResponse> {
    const res = await apiClient.get(`/api/admin/customers/${id}/payment-methods`);
    return parseEntityResponse(
      CustomerPaymentMethodsResponseSchema,
      res.data,
      "customer payment methods"
    );
  },

  async getHighValueCustomers(
    limit: number = 5
  ): Promise<HighValueCustomer[]> {
    try {
      const res = await apiClient.get("/api/admin/customers/high-value", {
        params: { limit }
      });
      return parseEntityResponse(
        HighValueCustomersResponseSchema,
        res.data,
        "high value customers"
      );
    } catch (err) {
      console.warn("High value customers endpoint unavailable or failed:", err);
      return [];
    }
  },

  async getRestrictedSummary(): Promise<CustomerRestrictedSummary> {
    const res = await apiClient.get(
      "/api/admin/customers/restricted/summary"
    );
    return parseEntityResponse(
      CustomerRestrictedSummarySchema,
      res.data,
      "customer restricted summary"
    );
  },

  async exportCustomers(params: CustomerListParams = {}): Promise<void> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.restricted !== undefined) {
      queryParams.restricted = params.restricted;
    }

    await fetchCsvExport(
      "/api/admin/customers/export",
      "customers-export.csv",
      { params: queryParams }
    );
  },

  async getPaymentHistory(
    id: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<CustomerPaymentHistoryResponse> {
    const res = await apiClient.get(
      `/api/admin/customers/${id}/payment-history`,
      { params }
    );
    return parseEntityResponse(
      CustomerPaymentHistoryResponseSchema,
      res.data,
      "customer payment history"
    );
  }
};

