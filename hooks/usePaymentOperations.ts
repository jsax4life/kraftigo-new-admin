"use client";

import { useQuery } from "@tanstack/react-query";
import { paymentsOperationsAdminService } from "@/services/payments-operations-admin.service";
import type {
  PaymentAlert,
  PaymentAlertStatus,
  PaymentOpsDashboard
} from "@/types/payments-operations-admin";

export function usePaymentOpsDashboard() {
  return useQuery<PaymentOpsDashboard, Error>({
    queryKey: ["admin", "payments-ops", "dashboard"],
    queryFn: () => paymentsOperationsAdminService.getDashboard()
  });
}

export function usePaymentAlerts(status: PaymentAlertStatus | "ALL") {
  return useQuery<PaymentAlert[], Error>({
    queryKey: ["admin", "payments-ops", "alerts", status],
    queryFn: () =>
      paymentsOperationsAdminService.listAlerts(
        status === "ALL" ? undefined : status
      )
  });
}
