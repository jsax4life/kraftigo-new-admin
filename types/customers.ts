import { z } from "zod";

export const CustomerPeriodEnum = z.enum([
  "this_month",
  "last_month",
  "last_7_days",
  "last_30_days",
  "all_time"
]);

export type CustomerPeriod = z.infer<typeof CustomerPeriodEnum>;

export const CustomerItemSchema = z
  .object({
    id: z.string(),
    displayUserId: z.string().nullish(),
    name: z.string().default("Unknown"),
    email: z.string().nullish(),
    emailVerified: z.boolean().default(false),
    country: z.string().nullish(),
    totalBookings: z.coerce.number().default(0),
    lastActive: z.string().nullish(),
    status: z.string().default("ACTIVE"),
    viewPath: z.string().nullish()
  })
  .passthrough();

export type CustomerItem = z.infer<typeof CustomerItemSchema>;

export const CustomersListResponseSchema = z.union([
  z
    .object({
      period: z.string().nullish(),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
      total: z.coerce.number().default(0),
      totalPages: z.coerce.number().default(1),
      data: z.array(CustomerItemSchema).default([])
    })
    .passthrough(),
  z.array(CustomerItemSchema).transform((arr) => ({
    period: null,
    page: 1,
    limit: arr.length || 10,
    total: arr.length,
    totalPages: 1,
    data: arr
  }))
]);

export type CustomersListResponse = z.infer<typeof CustomersListResponseSchema>;

export const CustomerSummaryMetricsSchema = z
  .object({
    totalUsers: z
      .object({
        value: z.coerce.number().default(0)
      })
      .passthrough()
      .default({ value: 0 }),
    newSignups: z
      .object({
        value: z.coerce.number().default(0),
        changePercent: z.coerce.number().nullish()
      })
      .passthrough()
      .default({ value: 0 }),
    activeUsers: z
      .object({
        value: z.coerce.number().default(0),
        changePercent: z.coerce.number().nullish(),
        definition: z.string().nullish()
      })
      .passthrough()
      .default({ value: 0 }),
    avgLifetimeValue: z
      .object({
        value: z.coerce.number().default(0),
        currency: z.string().default("GBP"),
        definition: z.string().nullish()
      })
      .passthrough()
      .default({ value: 0, currency: "GBP" })
  })
  .passthrough();

export const CustomerSummaryResponseSchema = z
  .object({
    period: z.string().nullish(),
    range: z
      .object({
        from: z.string().nullish(),
        to: z.string().nullish(),
        label: z.string().nullish()
      })
      .nullish(),
    metrics: CustomerSummaryMetricsSchema.default({}),
    restrictedProfiles: z
      .object({
        flaggedCount: z.coerce.number().default(0),
        definition: z.string().nullish(),
        listPath: z.string().default("/admin/restricted-users")
      })
      .passthrough()
      .default({ flaggedCount: 0, listPath: "/admin/restricted-users" })
  })
  .passthrough();

export type CustomerSummaryResponse = z.infer<
  typeof CustomerSummaryResponseSchema
>;

export interface CustomerListParams {
  period?: CustomerPeriod | string;
  page?: number;
  limit?: number;
  search?: string;
  restricted?: boolean;
}

export const CustomerDetailHeaderSchema = z
  .object({
    profilePhotoUrl: z.string().nullish(),
    name: z.string().default("Customer"),
    rating: z.coerce.number().nullish(),
    location: z.string().nullish(),
    verified: z.boolean().default(false),
    status: z.string().default("ACTIVE"),
    createdAt: z.string().nullish(),
    accountCreationDate: z.string().nullish(),
    lastActive: z.string().nullish()
  })
  .passthrough();

export const CustomerDetailAccountSchema = z
  .object({
    email: z
      .object({
        value: z.string().default(""),
        verified: z.boolean().default(false)
      })
      .passthrough()
      .default({ value: "", verified: false }),
    phone: z.string().nullish(),
    verifiedAddress: z.string().nullish(),
    userId: z.string().nullish(),
    stats: z
      .object({
        totalBookings: z.coerce.number().default(0),
        totalSpend: z
          .union([
            z.object({
              value: z.coerce.number().default(0),
              currency: z.string().default("GBP"),
              formatted: z.string().nullish()
            }),
            z.string(),
            z.number()
          ])
          .nullish(),
        bookingsAdminPath: z.string().nullish(),
        paymentsAdminPath: z.string().nullish()
      })
      .passthrough()
      .default({ totalBookings: 0 })
  })
  .passthrough();

export const CustomerDetailAdminActionsSchema = z
  .object({
    sendPasswordReset: z
      .object({
        endpoint: z.string().nullish(),
        available: z.boolean().nullish()
      })
      .passthrough()
      .nullish(),
    restrictAccount: z
      .object({
        endpoint: z.string().nullish(),
        available: z.boolean().nullish()
      })
      .passthrough()
      .nullish(),
    liftRestriction: z
      .object({
        endpoint: z.string().nullish(),
        available: z.boolean().nullish()
      })
      .passthrough()
      .nullish(),
    deleteAccount: z
      .object({
        endpoint: z.string().nullish(),
        legacyEndpoint: z.string().nullish(),
        available: z.boolean().nullish()
      })
      .passthrough()
      .nullish(),
    moveAccountData: z
      .object({
        available: z.boolean().nullish(),
        note: z.string().nullish()
      })
      .passthrough()
      .nullish()
  })
  .passthrough()
  .nullish();

export const CustomerDetailResponseSchema = z
  .object({
    id: z.string(),
    displayUserId: z.string().nullish(),
    header: CustomerDetailHeaderSchema.default({ name: "Customer" }),
    account: CustomerDetailAccountSchema.default({}),
    adminActions: CustomerDetailAdminActionsSchema
  })
  .passthrough();

export type CustomerDetailResponse = z.infer<
  typeof CustomerDetailResponseSchema
>;

export const PatchCustomerDtoSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  serviceAddress: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional()
    })
    .optional()
});

export type PatchCustomerDto = z.infer<typeof PatchCustomerDtoSchema>;

export const RestrictCustomerPayloadSchema = z.object({
  duration: z.string().default("1_month"),
  reason: z.string().default("terms_violation"),
  reasonDetail: z.string().optional(),
  adminNotes: z.string().optional(),
  notifyUser: z.boolean().default(true)
});

export type RestrictCustomerPayload = z.infer<
  typeof RestrictCustomerPayloadSchema
>;

export const CustomerActivityTypeEnum = z.enum([
  "all",
  "booking",
  "payment",
  "account",
  "review"
]);

export type CustomerActivityType = z.infer<typeof CustomerActivityTypeEnum>;

export const CustomerTimeRangeEnum = z.enum([
  "all_time",
  "this_month",
  "last_30_days",
  "last_7_days"
]);

export type CustomerTimeRange = z.infer<typeof CustomerTimeRangeEnum>;

export const CustomerActivityLogItemSchema = z
  .object({
    id: z.string(),
    type: z.string().default("account"),
    title: z.string().default("Activity"),
    description: z.string().default(""),
    occurredAt: z.string(),
    metadata: z.record(z.unknown()).nullish()
  })
  .passthrough();

export type CustomerActivityLogItem = z.infer<
  typeof CustomerActivityLogItemSchema
>;

export const CustomerActivityLogsResponseSchema = z.union([
  z
    .object({
      data: z.array(CustomerActivityLogItemSchema).default([]),
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
      total: z.coerce.number().default(0),
      totalPages: z.coerce.number().default(1)
    })
    .passthrough(),
  z.array(CustomerActivityLogItemSchema).transform((arr) => ({
    data: arr,
    page: 1,
    limit: arr.length || 10,
    total: arr.length,
    totalPages: 1
  }))
]);

export type CustomerActivityLogsResponse = z.infer<
  typeof CustomerActivityLogsResponseSchema
>;

export interface CustomerActivityLogsParams {
  page?: number;
  limit?: number;
  activityType?: CustomerActivityType | string;
  search?: string;
  timeRange?: CustomerTimeRange | string;
}

export const CustomerPaymentMethodItemSchema = z
  .object({
    id: z.string().nullish(),
    brand: z.string().nullish(),
    last4: z.string().nullish(),
    name: z.string().nullish(),
    isDefault: z.boolean().default(false),
    expMonth: z.coerce.number().nullish(),
    expYear: z.coerce.number().nullish()
  })
  .passthrough();

export type CustomerPaymentMethodItem = z.infer<
  typeof CustomerPaymentMethodItemSchema
>;

export const CustomerPaymentMethodsResponseSchema = z
  .object({
    items: z.array(CustomerPaymentMethodItemSchema).default([]),
    paymentHistoryPath: z.string().nullish()
  })
  .passthrough();

export type CustomerPaymentMethodsResponse = z.infer<
  typeof CustomerPaymentMethodsResponseSchema
>;

export const HighValueCustomerSchema = z
  .object({
    id: z.string().nullish(),
    userId: z.string().nullish(),
    displayUserId: z.string().nullish(),
    name: z.string().default("Customer"),
    email: z.string().nullish(),
    location: z.string().nullish(),
    country: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    image: z.string().nullish(),
    totalSpend: z
      .union([
        z.number(),
        z.string(),
        z.object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          formatted: z.string().nullish()
        })
      ])
      .nullish(),
    value: z.union([z.number(), z.string()]).nullish(),
    totalBookings: z.coerce.number().nullish(),
    bookingsCount: z.coerce.number().nullish(),
    viewPath: z.string().nullish()
  })
  .passthrough();

export type HighValueCustomer = z.infer<typeof HighValueCustomerSchema>;

export const HighValueCustomersResponseSchema = z.union([
  z.array(HighValueCustomerSchema),
  z
    .object({
      items: z.array(HighValueCustomerSchema).default([])
    })
    .transform((o) => o.items),
  z
    .object({
      data: z.array(HighValueCustomerSchema).default([])
    })
    .transform((o) => o.data)
]);

export type HighValueCustomersResponse = HighValueCustomer[];

export const CustomerRestrictedSummarySchema = z
  .object({
    flaggedCount: z.coerce.number().default(0),
    definition: z.string().nullish(),
    listPath: z.string().default("/admin/restricted-users")
  })
  .passthrough();

export type CustomerRestrictedSummary = z.infer<
  typeof CustomerRestrictedSummarySchema
>;

// Customer Payment History
export const CustomerPaymentHistoryItemSchema = z
  .object({
    id: z.string().nullish(),
    transactionId: z.string().nullish(),
    amount: z
      .union([
        z.number(),
        z.string(),
        z.object({
          value: z.coerce.number().default(0),
          currency: z.string().default("GBP"),
          formatted: z.string().nullish()
        })
      ])
      .nullish(),
    currency: z.string().default("GBP"),
    status: z.string().nullish(),
    type: z.string().nullish(),
    description: z.string().nullish(),
    date: z.string().nullish(),
    createdAt: z.string().nullish(),
    fee: z.union([z.number(), z.string()]).nullish(),
    netAmount: z.union([z.number(), z.string()]).nullish(),
    paymentMethod: z.string().nullish(),
    cardLast4: z.string().nullish()
  })
  .passthrough();

export type CustomerPaymentHistoryItem = z.infer<
  typeof CustomerPaymentHistoryItemSchema
>;

export const CustomerPaymentHistoryResponseSchema = z
  .object({
    data: z.array(CustomerPaymentHistoryItemSchema).default([]),
    items: z.array(CustomerPaymentHistoryItemSchema).optional(),
    total: z.coerce.number().default(0),
    page: z.coerce.number().default(1),
    limit: z.coerce.number().default(10),
    totalPages: z.coerce.number().default(1)
  })
  .passthrough()
  .transform((res) => ({
    ...res,
    data: res.data && res.data.length > 0 ? res.data : (res.items ?? [])
  }));

export type CustomerPaymentHistoryResponse = z.infer<
  typeof CustomerPaymentHistoryResponseSchema
>;




