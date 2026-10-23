"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kraftsService } from "@/services/krafts.service";
import type {
  KraftHubResponse,
  KraftCategoriesResponse,
  KraftCategoryItem,
  CategorySubKraft,
  CustomKraftsListResponse,
  KraftDetail,
  KraftMetrics,
  TopPerformingKraft,
  RegisteredKraftersResponse,
  KraftLogsResponse,
  CustomKraftQueueItem,
  CustomKraftsSummary,
  AdminCreateKraftCategoryDto,
  AdminUpdateKraftCategoryDto,
  AdminCreateCategoryKraftDto,
  AdminCustomKraftReviewDto,
  AdminUpdateKraftSkillDto
} from "@/types/krafts";

export function useKraftHub(search?: string) {
  return useQuery<KraftHubResponse, Error>({
    queryKey: ["admin", "krafts", "hub", search ?? ""],
    queryFn: () => kraftsService.getHub(search),
    staleTime: 30_000
  });
}

export function useKraftCategories(search?: string) {
  return useQuery<KraftCategoriesResponse, Error>({
    queryKey: ["admin", "krafts", "categories", search ?? ""],
    queryFn: () => kraftsService.listCategories(search),
    staleTime: 30_000
  });
}

export function useKraftCategory(categoryId: string) {
  return useQuery<KraftCategoryItem, Error>({
    queryKey: ["admin", "krafts", "category", categoryId],
    queryFn: () => kraftsService.getCategory(categoryId),
    enabled: Boolean(categoryId),
    staleTime: 30_000
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<KraftCategoryItem, Error, AdminCreateKraftCategoryDto>({
    mutationFn: (dto) => kraftsService.createCategory(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
    }
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<
    KraftCategoryItem,
    Error,
    { categoryId: string; dto: AdminUpdateKraftCategoryDto }
  >({
    mutationFn: ({ categoryId, dto }) =>
      kraftsService.updateCategory(categoryId, dto),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafts", "category", categoryId]
      });
    }
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (categoryId) => kraftsService.removeCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
    }
  });
}

export function useAddKraft() {
  const queryClient = useQueryClient();
  return useMutation<
    CategorySubKraft,
    Error,
    { categoryId: string; dto: AdminCreateCategoryKraftDto }
  >({
    mutationFn: ({ categoryId, dto }) =>
      kraftsService.addKraft(categoryId, dto),
    onSuccess: (_, { categoryId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafts", "category", categoryId]
      });
    }
  });
}

export function useCustomKrafts(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
} = {}) {
  const status = params.status ?? "NEW";
  const search = params.search ?? "";
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  return useQuery<CustomKraftsListResponse, Error>({
    queryKey: [
      "admin",
      "krafts",
      "custom-krafts",
      { status, search, page, limit }
    ],
    queryFn: () => kraftsService.listCustomKrafts(params),
    staleTime: 15_000
  });
}

export function useReviewCustomKraft() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { id: string; dto: AdminCustomKraftReviewDto }
  >({
    mutationFn: ({ id, dto }) => kraftsService.reviewCustomKraft(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafts", "custom-krafts"]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts", "hub"] });
    }
  });
}

export function useKraftDetail(skillId: string) {
  return useQuery<KraftDetail, Error>({
    queryKey: ["admin", "krafts", "detail", skillId],
    queryFn: () => kraftsService.getKraft(skillId),
    enabled: Boolean(skillId),
    staleTime: 30_000
  });
}

export function useToggleKillSwitch() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { skillId: string; killSwitchActive: boolean }
  >({
    mutationFn: ({ skillId, killSwitchActive }) =>
      kraftsService.toggleKillSwitch(skillId, killSwitchActive),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafts", "detail", skillId]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
    }
  });
}

export function useKraftMetrics(skillId: string, period?: string) {
  return useQuery<KraftMetrics, Error>({
    queryKey: ["admin", "krafts", "metrics", skillId, period ?? "this_month"],
    queryFn: () => kraftsService.getKraftMetrics(skillId, period),
    enabled: Boolean(skillId),
    staleTime: 30_000
  });
}

export function useTopPerformingKrafts(limit: number = 3) {
  return useQuery<TopPerformingKraft[], Error>({
    queryKey: ["admin", "krafts", "top-performing", limit],
    queryFn: () => kraftsService.getTopPerforming(limit),
    staleTime: 30_000
  });
}

export function useKraftKrafters(
  skillId: string,
  params: {
    search?: string;
    status?: "active_recently" | "all" | string;
    page?: number;
    limit?: number;
  } = {}
) {
  const search = params.search ?? "";
  const status = params.status ?? "active_recently";
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;

  return useQuery<RegisteredKraftersResponse, Error>({
    queryKey: [
      "admin",
      "krafts",
      "krafters",
      skillId,
      { search, status, page, limit }
    ],
    queryFn: () => kraftsService.listKrafters(skillId, params),
    enabled: Boolean(skillId),
    staleTime: 15_000
  });
}

export function useKraftLogs(
  skillId: string,
  params: { page?: number; limit?: number } = {}
) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 30;

  return useQuery<KraftLogsResponse, Error>({
    queryKey: ["admin", "krafts", "logs", skillId, { page, limit }],
    queryFn: () => kraftsService.listLogs(skillId, params),
    enabled: Boolean(skillId),
    staleTime: 15_000
  });
}

export function useCustomKraft(id: string) {
  return useQuery<CustomKraftQueueItem, Error>({
    queryKey: ["admin", "krafts", "custom-kraft", id],
    queryFn: () => kraftsService.getCustomKraft(id),
    enabled: Boolean(id),
    staleTime: 30_000
  });
}

export function useCustomKraftsSummary() {
  return useQuery<CustomKraftsSummary, Error>({
    queryKey: ["admin", "krafts", "custom-krafts", "summary"],
    queryFn: () => kraftsService.getCustomKraftsSummary(),
    staleTime: 30_000
  });
}

export function useUpdateKraft() {
  const queryClient = useQueryClient();
  return useMutation<
    KraftDetail,
    Error,
    { skillId: string; dto: AdminUpdateKraftSkillDto }
  >({
    mutationFn: ({ skillId, dto }) => kraftsService.updateKraft(skillId, dto),
    onSuccess: (_, { skillId }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "krafts", "detail", skillId]
      });
      queryClient.invalidateQueries({ queryKey: ["admin", "krafts"] });
    }
  });
}


