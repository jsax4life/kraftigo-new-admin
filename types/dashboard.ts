import { z } from "zod";

export const DashboardStatsSchema = z.object({
  totalUsers: z.coerce.number(),
  activeKrafters: z.coerce.number(),
  openBookings: z.coerce.number(),
  allKrafters: z.coerce.number(),
  allCustomers: z.coerce.number(),
  totalBookings: z.coerce.number(),
  intentKrafters: z.coerce.number()
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
