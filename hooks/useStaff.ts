"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffService } from "@/services/staff.service";
import type {
  StaffRoleOption,
  StaffMemberRow,
  StaffListParams,
  AdminStaffCreateDto,
  AdminStaffUpdateDto,
  StaffDetail,
  StaffActivityLog
} from "@/types/staff";
import type { PaginatedResult } from "@/lib/admin-api";

export function useStaffRoles() {
  return useQuery<StaffRoleOption[], Error>({
    queryKey: ["admin", "staff", "roles"],
    queryFn: () => staffService.getRoles(),
    staleTime: 5 * 60_000 // 5 minutes cache
  });
}

export function useStaffList(params?: StaffListParams) {
  return useQuery<PaginatedResult<StaffMemberRow>, Error>({
    queryKey: ["admin", "staff", "list", params],
    queryFn: () => staffService.list(params),
    staleTime: 15_000,
    retry: 1
  });
}

export function useStaffDetail(id?: string) {
  return useQuery<StaffDetail, Error>({
    queryKey: ["admin", "staff", "detail", id],
    queryFn: () => staffService.getDetail(id!),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

export function useStaffActivityLogs(
  id?: string,
  params?: { page?: number; limit?: number }
) {
  return useQuery<PaginatedResult<StaffActivityLog>, Error>({
    queryKey: ["admin", "staff", id, "activity-logs", params],
    queryFn: () => staffService.getActivityLogs(id!, params),
    enabled: Boolean(id),
    staleTime: 15_000
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminStaffCreateDto) => staffService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    }
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdminStaffUpdateDto }) =>
      staffService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "staff", "detail", variables.id]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff", "list"] });
    }
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    }
  });
}

export function useActivateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.activate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "staff", "detail", id]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff", "list"] });
    }
  });
}

export function useDeactivateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => staffService.deactivate(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "staff", "detail", id]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "staff", "list"] });
    }
  });
}

export function useResetStaffPassword() {
  return useMutation({
    mutationFn: (id: string) => staffService.resetPassword(id)
  });
}
