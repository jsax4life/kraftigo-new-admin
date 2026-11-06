import { apiClient } from "@/lib/api-client";
import { parseEntityResponse } from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  KraftHubResponseSchema,
  KraftCategoriesResponseSchema,
  KraftCategoryItemSchema,
  CategorySubKraftSchema,
  CustomKraftsListResponseSchema,
  KraftDetailSchema,
  KraftMetricsSchema,
  TopPerformingKraftsResponseSchema,
  RegisteredKraftersResponseSchema,
  KraftLogsResponseSchema,
  CustomKraftQueueItemSchema,
  CustomKraftsSummarySchema,
  type KraftHubResponse,
  type KraftCategoriesResponse,
  type KraftCategoryItem,
  type CategorySubKraft,
  type CustomKraftsListResponse,
  type CustomKraftQueueItem,
  type CustomKraftsSummary,
  type KraftDetail,
  type KraftMetrics,
  type TopPerformingKraft,
  type RegisteredKraftersResponse,
  type KraftLogsResponse,
  type AdminCreateKraftCategoryDto,
  type AdminUpdateKraftCategoryDto,
  type AdminCreateCategoryKraftDto,
  type AdminCustomKraftReviewDto,
  type AdminUpdateKraftSkillDto
} from "@/types/krafts";

export const kraftsService = {
  /**
   * Kraft Management landing (top performers, categories, custom queue counts)
   */
  async getHub(search?: string): Promise<KraftHubResponse> {
    const res = await apiClient.get("/api/admin/kraft-management/hub", {
      params: search && search.trim() ? { search: search.trim() } : undefined
    });
    return parseEntityResponse(
      KraftHubResponseSchema,
      res.data,
      "kraft hub"
    );
  },

  /**
   * Kraft categories list with nested Krafts and Custom Krafts entry
   */
  async listCategories(search?: string): Promise<KraftCategoriesResponse> {
    const res = await apiClient.get("/api/admin/kraft-management/categories", {
      params: search && search.trim() ? { search: search.trim() } : undefined
    });
    return parseEntityResponse(
      KraftCategoriesResponseSchema,
      res.data,
      "kraft categories"
    );
  },

  /**
   * View single Kraft category with nested Krafts
   */
  async getCategory(categoryId: string): Promise<KraftCategoryItem> {
    const res = await apiClient.get(
      `/api/admin/kraft-management/categories/${categoryId}`
    );
    return parseEntityResponse(
      KraftCategoryItemSchema,
      res.data,
      "category detail"
    );
  },

  /**
   * Create a new Kraft category
   */
  async createCategory(
    dto: AdminCreateKraftCategoryDto
  ): Promise<KraftCategoryItem> {
    const res = await apiClient.post(
      "/api/admin/kraft-management/categories",
      dto
    );
    return parseEntityResponse(
      KraftCategoryItemSchema,
      res.data,
      "created category"
    );
  },

  /**
   * Update category (rename, description, cover, active toggle)
   */
  async updateCategory(
    categoryId: string,
    dto: AdminUpdateKraftCategoryDto
  ): Promise<KraftCategoryItem> {
    const res = await apiClient.patch(
      `/api/admin/kraft-management/categories/${categoryId}`,
      dto
    );
    return parseEntityResponse(
      KraftCategoryItemSchema,
      res.data,
      "updated category"
    );
  },

  /**
   * Remove Kraft category
   */
  async removeCategory(categoryId: string): Promise<void> {
    await apiClient.delete(
      `/api/admin/kraft-management/categories/${categoryId}`
    );
  },

  /**
   * Add a Kraft under a category (+ Add new)
   */
  async addKraft(
    categoryId: string,
    dto: AdminCreateCategoryKraftDto
  ): Promise<CategorySubKraft> {
    const res = await apiClient.post(
      `/api/admin/kraft-management/categories/${categoryId}/krafts`,
      dto
    );
    return parseEntityResponse(
      CategorySubKraftSchema,
      res.data,
      "created sub-kraft"
    );
  },

  /**
   * Custom Krafts queue list
   */
  async listCustomKrafts(params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<CustomKraftsListResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.status) queryParams.status = params.status;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const res = await apiClient.get("/api/admin/kraft-management/custom-krafts", {
      params: queryParams
    });

    return parseEntityResponse(
      CustomKraftsListResponseSchema,
      res.data,
      "custom krafts list"
    );
  },

  /**
   * Custom Kraft detail (View link)
   */
  async getCustomKraft(id: string): Promise<CustomKraftQueueItem> {
    const res = await apiClient.get(
      `/api/admin/kraft-management/custom-krafts/${id}`
    );
    return parseEntityResponse(
      CustomKraftQueueItemSchema,
      res.data,
      "custom kraft detail"
    );
  },

  /**
   * Custom Krafts tab counts (New / Under Review / Rejected)
   */
  async getCustomKraftsSummary(): Promise<CustomKraftsSummary> {
    const res = await apiClient.get(
      "/api/admin/kraft-management/custom-krafts/summary"
    );
    return parseEntityResponse(
      CustomKraftsSummarySchema,
      res.data,
      "custom krafts summary"
    );
  },

  /**
   * Review Custom Kraft (NEW, UNDER_REVIEW, REJECTED)
   */
  async reviewCustomKraft(
    id: string,
    dto: AdminCustomKraftReviewDto
  ): Promise<void> {
    await apiClient.patch(
      `/api/admin/kraft-management/custom-krafts/${id}/review`,
      dto
    );
  },

  /**
   * Single Kraft detail
   */
  async getKraft(skillId: string): Promise<KraftDetail> {
    const res = await apiClient.get(
      `/api/admin/kraft-management/krafts/${skillId}`
    );
    return parseEntityResponse(
      KraftDetailSchema,
      res.data,
      "kraft detail"
    );
  },

  /**
   * Update Kraft profile fields (name, description, iconUrl, killSwitchActive)
   */
  async updateKraft(
    skillId: string,
    dto: AdminUpdateKraftSkillDto
  ): Promise<KraftDetail> {
    const res = await apiClient.patch(
      `/api/admin/kraft-management/krafts/${skillId}`,
      dto
    );
    return parseEntityResponse(
      KraftDetailSchema,
      res.data,
      "updated kraft"
    );
  },

  /**
   * Toggle Kraft kill switch
   */
  async toggleKillSwitch(
    skillId: string,
    killSwitchActive: boolean
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/kraft-management/krafts/${skillId}/kill-switch`,
      { killSwitchActive }
    );
  },

  /**
   * Kraft KPI bar (Krafters, Bookings, Avg Price, Completion Rate)
   */
  async getKraftMetrics(
    skillId: string,
    period?: string
  ): Promise<KraftMetrics> {
    const res = await apiClient.get(
      `/api/admin/kraft-management/krafts/${skillId}/metrics`,
      { params: period ? { period } : undefined }
    );
    return parseEntityResponse(
      KraftMetricsSchema,
      res.data,
      "kraft metrics"
    );
  },

  /**
   * Top performing Kraft category cards
   */
  async getTopPerforming(limit: number = 3): Promise<TopPerformingKraft[]> {
    const res = await apiClient.get("/api/admin/kraft-management/top-performing", {
      params: { limit }
    });
    return parseEntityResponse(
      TopPerformingKraftsResponseSchema,
      res.data,
      "top performing krafts"
    );
  },

  /**
   * Registered Krafters tab for a Kraft
   */
  async listKrafters(
    skillId: string,
    params: {
      search?: string;
      status?: "active_recently" | "all" | string;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<RegisteredKraftersResponse> {
    const queryParams: Record<string, string | number> = {};
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.status) queryParams.status = params.status;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const res = await apiClient.get(
      `/api/admin/kraft-management/krafts/${skillId}/krafters`,
      { params: queryParams }
    );
    return parseEntityResponse(
      RegisteredKraftersResponseSchema,
      res.data,
      "registered krafters"
    );
  },

  /**
   * Kraft Logs tab (admin audit trail)
   */
  async listLogs(
    skillId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<KraftLogsResponse> {
    const queryParams: Record<string, number> = {};
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    const res = await apiClient.get(
      `/api/admin/kraft-management/krafts/${skillId}/logs`,
      { params: queryParams }
    );
    return parseEntityResponse(
      KraftLogsResponseSchema,
      res.data,
      "kraft logs"
    );
  },

  /**
   * Export registered Krafters list for a Kraft
   */
  async exportKrafters(
    skillId: string,
    params: { search?: string; status?: string } = {}
  ): Promise<void> {
    await fetchCsvExport(
      `/api/admin/kraft-management/krafts/${skillId}/krafters/export`,
      `kraft-${skillId}-krafters.csv`,
      { params }
    );
  }
};

