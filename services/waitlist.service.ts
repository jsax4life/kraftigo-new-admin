import { apiClient } from "@/lib/api-client";
import { fetchCsvExport } from "@/lib/download-csv";
import { WaitlistListSchema, type WaitlistEntry } from "@/types/waitlist";

export const waitlistService = {
  async getAll(): Promise<WaitlistEntry[]> {
    const res = await apiClient.get("/api/admin/waitlist");
    const parsed = WaitlistListSchema.safeParse(res.data);
    if (!parsed.success) {
      console.error("Waitlist response validation error", parsed.error);
      throw new Error("Unexpected waitlist response shape");
    }
    return parsed.data;
  },

  async exportCsv(): Promise<void> {
    await fetchCsvExport("/api/admin/waitlist/export", "kraftigo-waitlist.csv");
  }
};

