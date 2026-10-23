import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  type PaginatedResult
} from "@/lib/admin-api";
import { fetchCsvExport } from "@/lib/download-csv";
import {
  KrafterSummaryResponseSchema,
  TopKraftersResponseSchema,
  KrafterDirectoryResponseSchema,
  KrafterVerificationQueueResponseSchema,
  KrafterRestrictedSummarySchema,
  KrafterDetailResponseSchema,
  KrafterActivityLogsResponseSchema,
  KrafterPaymentMethodsResponseSchema,
  KrafterPaymentHistoryResponseSchema,
  type KrafterSummaryResponse,
  type TopKrafterItem,
  type KrafterDirectoryResponse,
  type KrafterDirectoryParams,
  type KrafterVerificationQueueResponse,
  type KrafterRestrictedSummary,
  type KrafterDetailResponse,
  type AdminKrafterUpdateDto,
  type AdminKrafterRejectApplicationDto,
  type RestrictKrafterPayload,
  type KrafterActivityLogsResponse,
  type KrafterPaymentMethodsResponse,
  type KrafterPaymentHistoryResponse
} from "@/types/krafters";
import {
  RestrictedUserRowSchema,
  ProfileLogItemSchema,
  type RestrictedUserRow,
  type RestrictedUsersListParams,
  type ApplyAccountRestrictionDto,
  type LiftRestrictionDto,
  type AdminModerationNoteDto,
  type ProfileLogItem
} from "@/types/restricted-users";

export const kraftersService = {
  /**
   * Krafter headline metrics
   */
  async getSummary(period?: string): Promise<KrafterSummaryResponse> {
    const res = await apiClient.get("/api/admin/krafters/summary", {
      params: period ? { period } : undefined
    });
    return parseEntityResponse(
      KrafterSummaryResponseSchema,
      res.data,
      "krafter summary"
    );
  },

  /**
   * Export KPI CSV report
   */
  async exportReport(period?: string): Promise<void> {
    await fetchCsvExport(
      "/api/admin/krafters/summary/export",
      "krafters-report.csv",
      { params: period ? { period } : undefined }
    );
  },

  /**
   * Top Krafters row (earnings + completed krafts)
   */
  async getTop(limit: number = 3): Promise<TopKrafterItem[]> {
    const res = await apiClient.get("/api/admin/krafters/top", {
      params: { limit }
    });
    return parseEntityResponse(
      TopKraftersResponseSchema,
      res.data,
      "top krafters"
    );
  },

  /**
   * Krafter Directory table (paginated, searchable, filterable)
   */
  async listDirectory(
    params: KrafterDirectoryParams = {}
  ): Promise<KrafterDirectoryResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }
    if (params.category && params.category !== "all") {
      queryParams.category = params.category;
    }
    if (params.restricted !== undefined) {
      queryParams.restricted = params.restricted;
    }

    const res = await apiClient.get("/api/admin/krafters", {
      params: queryParams
    });

    return parseEntityResponse(
      KrafterDirectoryResponseSchema,
      res.data,
      "krafter directory"
    );
  },

  /**
   * Export Krafter Directory (CSV)
   */
  async exportDirectory(params: KrafterDirectoryParams = {}): Promise<void> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }
    if (params.category && params.category !== "all") {
      queryParams.category = params.category;
    }
    if (params.restricted !== undefined) {
      queryParams.restricted = params.restricted;
    }

    await fetchCsvExport(
      "/api/admin/krafters/export",
      "krafters-directory.csv",
      { params: queryParams }
    );
  },

  /**
   * Krafter Verification Queue
   */
  async getVerificationQueue(
    params: KrafterDirectoryParams = {}
  ): Promise<KrafterVerificationQueueResponse> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }
    if (params.status && params.status !== "all") {
      queryParams.status = params.status;
    }

    const res = await apiClient.get("/api/admin/krafters/verification-queue", {
      params: queryParams
    });

    return parseEntityResponse(
      KrafterVerificationQueueResponseSchema,
      res.data,
      "verification queue"
    );
  },

  /**
   * Export verification queue (CSV)
   */
  async exportVerificationQueue(
    params: KrafterDirectoryParams = {}
  ): Promise<void> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.period) queryParams.period = params.period;
    if (params.search && params.search.trim()) {
      queryParams.search = params.search.trim();
    }

    await fetchCsvExport(
      "/api/admin/krafters/verification-queue/export",
      "krafters-verification-queue.csv",
      { params: queryParams }
    );
  },

  /**
   * Approve work-eligibility document
   */
  async approveVerification(
    krafterId: string,
    documentId: string
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/krafters/verification-queue/${krafterId}/approve`,
      null,
      { params: { documentId } }
    );
  },

  /**
   * Reject registration / work-eligibility
   */
  async rejectVerification(
    krafterId: string,
    dto: AdminKrafterRejectApplicationDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/krafters/verification-queue/${krafterId}/reject`,
      dto
    );
  },

  /**
   * Restricted List summary
   */
  async getRestrictedSummary(): Promise<KrafterRestrictedSummary> {
    const res = await apiClient.get("/api/admin/krafters/restricted/summary");
    return parseEntityResponse(
      KrafterRestrictedSummarySchema,
      res.data,
      "krafter restricted summary"
    );
  },

  /**
   * Krafter profile detail
   */
  async getDetail(id: string): Promise<KrafterDetailResponse> {
    const res = await apiClient.get(`/api/admin/krafters/${id}`);
    return parseEntityResponse(
      KrafterDetailResponseSchema,
      res.data,
      "krafter detail"
    );
  },

  /**
   * Update Krafter account + work fields + skill offerings
   */
  async patchKrafter(
    id: string,
    dto: AdminKrafterUpdateDto
  ): Promise<KrafterDetailResponse> {
    const res = await apiClient.patch(`/api/admin/krafters/${id}`, dto);
    return parseEntityResponse(
      KrafterDetailResponseSchema,
      res.data,
      "updated krafter"
    );
  },

  /**
   * Send password reset email
   */
  async sendPasswordReset(id: string): Promise<void> {
    await apiClient.post(`/api/admin/krafters/${id}/actions/send-password-reset`);
  },

  /**
   * Restrict Krafter
   */
  async restrictKrafter(
    id: string,
    payload?: RestrictKrafterPayload
  ): Promise<void> {
    await apiClient.post(`/api/admin/krafters/${id}/actions/restrict`, payload);
  },

  /**
   * Lift restriction
   */
  async liftRestriction(id: string): Promise<void> {
    await apiClient.post(`/api/admin/krafters/${id}/actions/lift-restriction`);
  },

  /**
   * Krafter Payment Methods
   */
  async getPaymentMethods(id: string): Promise<KrafterPaymentMethodsResponse> {
    const res = await apiClient.get(`/api/admin/krafters/${id}/payment-methods`);
    return parseEntityResponse(
      KrafterPaymentMethodsResponseSchema,
      res.data,
      "krafter payment methods"
    );
  },

  /**
   * Krafter Activity Logs
   */
  async getActivityLogs(
    id: string,
    params: {
      page?: number;
      limit?: number;
      activityType?: string;
      search?: string;
      timeRange?: string;
    } = {}
  ): Promise<KrafterActivityLogsResponse> {
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

    const res = await apiClient.get(`/api/admin/krafters/${id}/activity-logs`, {
      params: queryParams
    });

    return parseEntityResponse(
      KrafterActivityLogsResponseSchema,
      res.data,
      "krafter activity logs"
    );
  },

  /**
   * Export Krafter Activity Logs (CSV)
   */
  async exportActivityLogs(
    id: string,
    params: {
      activityType?: string;
      search?: string;
      timeRange?: string;
    } = {}
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
      `/api/admin/krafters/${id}/activity-logs/export`,
      `krafter-${id}-activity-logs.csv`,
      { params: queryParams }
    );
  },

  /**
   * Move account data (placeholder / data migration action)
   */
  async moveAccountData(id: string): Promise<unknown> {
    const res = await apiClient.post(
      `/api/admin/krafters/${id}/actions/move-account-data`
    );
    return res.data;
  },

  /**
   * Krafter Payment / Payout History
   */
  async getPaymentHistory(
    id: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<KrafterPaymentHistoryResponse> {
    const res = await apiClient.get(
      `/api/admin/krafters/${id}/payment-history`,
      { params }
    );
    return parseEntityResponse(
      KrafterPaymentHistoryResponseSchema,
      res.data,
      "krafter payment history"
    );
  },

  /**
   * Krafters Restricted List (alias of GET /admin/restricted-users)
   */
  async listRestricted(
    params?: RestrictedUsersListParams
  ): Promise<PaginatedResult<RestrictedUserRow>> {
    const res = await apiClient.get("/api/admin/krafters/restricted", {
      params
    });
    return parsePaginatedResponse(
      RestrictedUserRowSchema,
      res.data,
      "krafters restricted list"
    );
  },

  /**
   * Export Krafters Restricted List (CSV)
   */
  async exportRestricted(params?: RestrictedUsersListParams): Promise<void> {
    await fetchCsvExport(
      "/api/admin/krafters/restricted/export",
      "krafters-restricted.csv",
      { params }
    );
  },

  /**
   * Lift restriction for a user via krafters endpoint
   */
  async liftRestrictedUser(
    userId: string,
    data?: LiftRestrictionDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/krafters/restricted/${userId}/lift`,
      data ?? {}
    );
  },

  /**
   * Restrict user via krafters endpoint
   */
  async restrictRestrictedUser(
    userId: string,
    data: ApplyAccountRestrictionDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/krafters/restricted/${userId}/restrict`,
      data
    );
  },

  /**
   * Get restricted profile moderation logs
   */
  async getRestrictedProfileLogs(
    userId: string,
    params?: { page?: number; limit?: number; search?: string }
  ): Promise<PaginatedResult<ProfileLogItem>> {
    const res = await apiClient.get(
      `/api/admin/krafters/restricted/${userId}/profile-logs`,
      { params }
    );
    return parsePaginatedResponse(
      ProfileLogItemSchema,
      res.data,
      "krafter restricted profile logs"
    );
  },

  /**
   * Post moderation note on restricted profile
   */
  async postRestrictedProfileLogNote(
    userId: string,
    data: AdminModerationNoteDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/krafters/restricted/${userId}/profile-logs`,
      data
    );
  }
};
