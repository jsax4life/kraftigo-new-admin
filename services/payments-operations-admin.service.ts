import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  parsePaginatedResponse,
  unwrapEntityPayload
} from "@/lib/admin-api";
import {
  PaymentAlertSchema,
  PaymentOpsDashboardSchema,
  type PaymentAlert,
  type PaymentAlertStatus,
  type PaymentOpsDashboard,
  type PaymentReconcileResult,
  type ResolvePaymentAlertDto
} from "@/types/payments-operations-admin";
import { z } from "zod";

const LooseRecord = z.record(z.string(), z.unknown());

export const paymentsOperationsAdminService = {
  async getDashboard(): Promise<PaymentOpsDashboard> {
    const res = await apiClient.get("/api/admin/payments/operations/dashboard");
    return parseEntityResponse(
      PaymentOpsDashboardSchema,
      res.data,
      "payments operations dashboard"
    );
  },

  async listAlerts(status?: PaymentAlertStatus): Promise<PaymentAlert[]> {
    const res = await apiClient.get("/api/admin/payments/operations/alerts", {
      params: status ? { status } : undefined
    });
    const parsed = parsePaginatedResponse(
      PaymentAlertSchema,
      res.data,
      "payment alerts"
    );
    return parsed.items;
  },

  async reconcile(): Promise<PaymentReconcileResult> {
    const res = await apiClient.post(
      "/api/admin/payments/operations/reconcile"
    );
    const raw = unwrapEntityPayload(res.data);
    const parsed = LooseRecord.safeParse(raw);
    if (!parsed.success) {
      return typeof raw === "object" && raw ? (raw as PaymentReconcileResult) : {};
    }
    return parsed.data;
  },

  async resolveAlert(
    alertId: string,
    body: ResolvePaymentAlertDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/payments/operations/alerts/${alertId}/resolve`,
      body
    );
  }
};
