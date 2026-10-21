"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { restrictedUsersService } from "@/services/restricted-users.service";
import type {
  RestrictedUsersSummary,
  RestrictedUserRow,
  RestrictedUsersListParams,
  ApplyAccountRestrictionDto,
  LiftRestrictionDto,
  AdminModerationNoteDto,
  ProfileLogItem
} from "@/types/restricted-users";
import type { PaginatedResult } from "@/lib/admin-api";

export function useRestrictedUsersSummary() {
  return useQuery<RestrictedUsersSummary, Error>({
    queryKey: ["admin", "restricted-users", "summary"],
    queryFn: () => restrictedUsersService.getSummary(),
    staleTime: 30_000
  });
}

export function useRestrictedUsers(params?: RestrictedUsersListParams) {
  return useQuery<PaginatedResult<RestrictedUserRow>, Error>({
    queryKey: ["admin", "restricted-users", "list", params],
    queryFn: () => restrictedUsersService.list(params),
    staleTime: 15_000
  });
}

export function useProfileLogs(
  userId?: string,
  params?: { page?: number; limit?: number; search?: string }
) {
  return useQuery<PaginatedResult<ProfileLogItem>, Error>({
    queryKey: ["admin", "restricted-users", userId, "profile-logs", params],
    queryFn: () => restrictedUsersService.getProfileLogs(userId!, params),
    enabled: Boolean(userId),
    staleTime: 10_000
  });
}

export function useRestrictUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data
    }: {
      userId: string;
      data: ApplyAccountRestrictionDto;
    }) => restrictedUsersService.restrictUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restricted-users"] });
    }
  });
}

export function useLiftRestriction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data
    }: {
      userId: string;
      data?: LiftRestrictionDto;
    }) => restrictedUsersService.liftRestriction(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restricted-users"] });
    }
  });
}

export function usePostModerationNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      data
    }: {
      userId: string;
      data: AdminModerationNoteDto;
    }) => restrictedUsersService.postModerationNote(userId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "restricted-users", variables.userId, "profile-logs"]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "restricted-users", "list"] });
    }
  });
}
