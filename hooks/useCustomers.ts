"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersService } from "@/services/customers.service";
import type {
  CustomerSummaryResponse,
  CustomersListResponse,
  CustomerListParams,
  CustomerPeriod,
  CustomerDetailResponse,
  PatchCustomerDto,
  RestrictCustomerPayload,
  CustomerActivityLogsParams,
  CustomerActivityLogsResponse,
  CustomerPaymentMethodsResponse,
  CustomerPaymentHistoryResponse,
  HighValueCustomer,
  CustomerRestrictedSummary
} from "@/types/customers";

export function useCustomerSummary(period?: CustomerPeriod | string) {
  return useQuery<CustomerSummaryResponse, Error>({
    queryKey: ["admin", "customers", "summary", period ?? "this_month"],
    queryFn: () => customersService.getSummary(period),
    staleTime: 30_000
  });
}

export function useCustomersList(params: CustomerListParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search ?? "";
  const period = params.period ?? "this_month";
  const restricted = params.restricted;

  return useQuery<CustomersListResponse, Error>({
    queryKey: [
      "admin",
      "customers",
      "list",
      { page, limit, search, period, restricted }
    ],
    queryFn: () => customersService.list(params),
    staleTime: 15_000
  });
}

export function useCustomerDetail(id: string) {
  return useQuery<CustomerDetailResponse, Error>({
    queryKey: ["admin", "customers", "detail", id],
    queryFn: () => customersService.getCustomer(id),
    enabled: Boolean(id),
    staleTime: 15_000
  });
}

export function usePatchCustomer() {
  const queryClient = useQueryClient();
  return useMutation<
    CustomerDetailResponse,
    Error,
    { id: string; dto: PatchCustomerDto }
  >({
    mutationFn: ({ id, dto }) => customersService.patchCustomer(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "list"]
      });
    }
  });
}

export function useSendCustomerPasswordReset() {
  return useMutation<void, Error, string>({
    mutationFn: (id) => customersService.sendPasswordReset(id)
  });
}

export function useRestrictCustomer() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; payload?: RestrictCustomerPayload }
  >({
    mutationFn: ({ id, payload }) =>
      customersService.restrictCustomer(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "list"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "summary"]
      });
    }
  });
}

export function useLiftCustomerRestriction() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => customersService.liftCustomerRestriction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "list"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "summary"]
      });
    }
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => customersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "list"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "customers", "summary"]
      });
    }
  });
}

export function useCustomerActivityLogs(
  id: string,
  params: CustomerActivityLogsParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const activityType = params.activityType ?? "all";
  const search = params.search ?? "";
  const timeRange = params.timeRange ?? "all_time";

  return useQuery<CustomerActivityLogsResponse, Error>({
    queryKey: [
      "admin",
      "customers",
      "activity-logs",
      id,
      { page, limit, activityType, search, timeRange }
    ],
    queryFn: () => customersService.getActivityLogs(id, params),
    enabled: Boolean(id),
    staleTime: 15_000
  });
}

export function useCustomerPaymentMethods(id: string) {
  return useQuery<CustomerPaymentMethodsResponse, Error>({
    queryKey: ["admin", "customers", "payment-methods", id],
    queryFn: () => customersService.getPaymentMethods(id),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

export function useHighValueCustomers(limit: number = 5) {
  return useQuery<HighValueCustomer[], Error>({
    queryKey: ["admin", "customers", "high-value", limit],
    queryFn: () => customersService.getHighValueCustomers(limit),
    retry: false,
    staleTime: 30_000
  });
}

export function useCustomerRestrictedSummary() {
  return useQuery<CustomerRestrictedSummary, Error>({
    queryKey: ["admin", "customers", "restricted", "summary"],
    queryFn: () => customersService.getRestrictedSummary(),
    staleTime: 30_000
  });
}

export function useCustomerPaymentHistory(
  id: string,
  params: { page?: number; limit?: number } = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  return useQuery<CustomerPaymentHistoryResponse, Error>({
    queryKey: ["admin", "customers", "payment-history", id, { page, limit }],
    queryFn: () => customersService.getPaymentHistory(id, params),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

