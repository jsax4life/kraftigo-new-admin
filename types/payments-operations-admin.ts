import { z } from "zod";

const LooseRecord = z.record(z.string(), z.unknown());

export const PaymentAlertStatusSchema = z.enum(["OPEN", "RESOLVED"]);

export type PaymentAlertStatus = z.infer<typeof PaymentAlertStatusSchema>;

export const PaymentAlertSchema = z
  .object({
    id: z.string(),
    type: z.string().nullish(),
    severity: z.string().nullish(),
    resourceType: z.string().nullish(),
    resourceId: z.string().nullish(),
    status: z.string().nullish(),
    details: LooseRecord.nullish(),
    detectedAt: z.string().nullish(),
    resolvedAt: z.string().nullish(),
    resolutionNote: z.string().nullish()
  })
  .passthrough();

export type PaymentAlert = z.infer<typeof PaymentAlertSchema>;

export const PaymentOpsDashboardSchema = LooseRecord;

export type PaymentOpsDashboard = z.infer<typeof PaymentOpsDashboardSchema>;

export type ResolvePaymentAlertDto = {
  note: string;
};

export type PaymentReconcileResult = Record<string, unknown>;
