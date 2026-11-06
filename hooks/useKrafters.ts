"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kraftersService } from "@/services/krafters.service";
import type { PaginatedResult } from "@/lib/admin-api";
import type {
  KrafterSummaryResponse,
  TopKrafterItem,
  KrafterDirectoryResponse,
  KrafterDirectoryParams,
  KrafterVerificationQueueResponse,
  KrafterRestrictedSummary,
  KrafterDetailResponse,
  AdminKrafterUpdateDto,
  AdminKrafterRejectApplicationDto,
  RestrictKrafterPayload,
  KrafterActivityLogsResponse,
  KrafterPaymentMethodsResponse,
  KrafterPaymentHistoryResponse,
  KrafterPeriod,
  RestrictedUserRow,
  RestrictedUsersListParams,
  ApplyAccountRestrictionDto,
  LiftRestrictionDto,
  AdminModerationNoteDto,
  ProfileLogItem
} from "@/types/krafters";

export function useKrafterSummary(period?: KrafterPeriod | string) {
  return useQuery<KrafterSummaryResponse, Error>({
    queryKey: ["admin", "krafters", "summary", period ?? "this_month"],
    queryFn: () => kraftersService.getSummary(period),
    staleTime: 30_000
  });
}

export function useTopKrafters(limit: number = 3) {
  return useQuery<TopKrafterItem[], Error>({
    queryKey: ["admin", "krafters", "top", limit],
    queryFn: () => kraftersService.getTop(limit),
    staleTime: 30_000
  });
}

export function useKrafterDirectory(params: KrafterDirectoryParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search ?? "";
  const period = params.period ?? "this_month";
  const status = params.status ?? "all";
  const category = params.category ?? "all";
  const restricted = params.restricted;

  return useQuery<KrafterDirectoryResponse, Error>({
    queryKey: [
      "admin",
      "krafters",
      "directory",
      { page, limit, search, period, status, category, restricted }
    ],
    queryFn: () => kraftersService.listDirectory(params),
    staleTime: 15_000
  });
}

export function useKrafterVerificationQueue(
  params: KrafterDirectoryParams = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const search = params.search ?? "";
  const status = params.status ?? "all";

  return useQuery<KrafterVerificationQueueResponse, Error>({
    queryKey: [
      "admin",
      "krafters",
      "verification-queue",
      { page, limit, search, status }
    ],
    queryFn: () => kraftersService.getVerificationQueue(params),
    staleTime: 15_000
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { krafterId: string; documentId: string }
  >({
    mutationFn: ({ krafterId, documentId }) =>
      kraftersService.approveVerification(krafterId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "verification-queue"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "directory"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { krafterId: string; dto: AdminKrafterRejectApplicationDto }
  >({
    mutationFn: ({ krafterId, dto }) =>
      kraftersService.rejectVerification(krafterId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "verification-queue"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "directory"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useKrafterRestrictedSummary() {
  return useQuery<KrafterRestrictedSummary, Error>({
    queryKey: ["admin", "krafters", "restricted", "summary"],
    queryFn: () => kraftersService.getRestrictedSummary(),
    staleTime: 30_000
  });
}

export function useKrafterDetail(id: string) {
  return useQuery<KrafterDetailResponse, Error>({
    queryKey: ["admin", "krafters", "detail", id],
    queryFn: () => kraftersService.getDetail(id),
    enabled: Boolean(id),
    staleTime: 15_000
  });
}

export function usePatchKrafter() {
  const queryClient = useQueryClient();
  return useMutation<
    KrafterDetailResponse,
    Error,
    { id: string; dto: AdminKrafterUpdateDto }
  >({
    mutationFn: ({ id, dto }) => kraftersService.patchKrafter(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "directory"]
      });
    }
  });
}

export function useSendKrafterPasswordReset() {
  return useMutation<void, Error, string>({
    mutationFn: (id) => kraftersService.sendPasswordReset(id)
  });
}

export function useRestrictKrafter() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; payload?: RestrictKrafterPayload }
  >({
    mutationFn: ({ id, payload }) =>
      kraftersService.restrictKrafter(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "directory"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useLiftKrafterRestriction() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => kraftersService.liftRestriction(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "detail", id]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "directory"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useKrafterPaymentMethods(id: string) {
  return useQuery<KrafterPaymentMethodsResponse, Error>({
    queryKey: ["admin", "krafters", "payment-methods", id],
    queryFn: () => kraftersService.getPaymentMethods(id),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

export function useKrafterActivityLogs(
  id: string,
  params: {
    page?: number;
    limit?: number;
    activityType?: string;
    search?: string;
    timeRange?: string;
  } = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const activityType = params.activityType ?? "all";
  const search = params.search ?? "";
  const timeRange = params.timeRange ?? "all_time";

  return useQuery<KrafterActivityLogsResponse, Error>({
    queryKey: [
      "admin",
      "krafters",
      "activity-logs",
      id,
      { page, limit, activityType, search, timeRange }
    ],
    queryFn: () => kraftersService.getActivityLogs(id, params),
    enabled: Boolean(id),
    staleTime: 15_000
  });
}

export function useKrafterPaymentHistory(
  id: string,
  params: { page?: number; limit?: number } = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  return useQuery<KrafterPaymentHistoryResponse, Error>({
    queryKey: ["admin", "krafters", "payment-history", id, { page, limit }],
    queryFn: () => kraftersService.getPaymentHistory(id, params),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

export function useMoveKrafterAccountData() {
  return useMutation<unknown, Error, string>({
    mutationFn: (id: string) => kraftersService.moveAccountData(id)
  });
}

export function useKrafterRestrictedList(params?: RestrictedUsersListParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";
  const userType = params?.userType ?? "all";
  const period = params?.period ?? "this_month";

  return useQuery<PaginatedResult<RestrictedUserRow>, Error>({
    queryKey: [
      "admin",
      "krafters",
      "restricted",
      "list",
      { page, limit, search, userType, period }
    ],
    queryFn: () => kraftersService.listRestricted(params),
    staleTime: 30_000
  });
}

export function useLiftKrafterRestrictedUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { userId: string; data?: LiftRestrictionDto }>({
    mutationFn: ({ userId, data }) =>
      kraftersService.liftRestrictedUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "restricted"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useRestrictKrafterRestrictedUser() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { userId: string; data: ApplyAccountRestrictionDto }
  >({
    mutationFn: ({ userId, data }) =>
      kraftersService.restrictRestrictedUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "restricted"]
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "summary"]
      });
    }
  });
}

export function useKrafterRestrictedProfileLogs(
  userId: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 10;
  const search = params?.search ?? "";

  return useQuery<PaginatedResult<ProfileLogItem>, Error>({
    queryKey: [
      "admin",
      "krafters",
      "restricted",
      "profile-logs",
      userId,
      { page, limit, search }
    ],
    queryFn: () => kraftersService.getRestrictedProfileLogs(userId, params),
    enabled: Boolean(userId),
    staleTime: 15_000
  });
}

export function usePostKrafterRestrictedProfileLogNote() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { userId: string; data: AdminModerationNoteDto }
  >({
    mutationFn: ({ userId, data }) =>
      kraftersService.postRestrictedProfileLogNote(userId, data),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafters", "restricted", "profile-logs", userId]
      });
    }
  });
}

