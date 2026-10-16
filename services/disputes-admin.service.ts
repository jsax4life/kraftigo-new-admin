import { apiClient } from "@/lib/api-client";
import {
  parseEntityResponse,
  unwrapListPayload
} from "@/lib/admin-api";
import {
  AdminDisputeSchema,
  EvidencePacketSchema,
  type AdminDispute,
  type EvidencePacket,
  type ResolveDisputeDto,
  type ReverseNoShowStrikeDto
} from "@/types/disputes-admin";
import { z } from "zod";

const AdminDisputeListSchema = z.array(AdminDisputeSchema);

export const disputesAdminService = {
  async list(): Promise<AdminDispute[]> {
    const res = await apiClient.get("/api/admin/disputes");
    const rows = unwrapListPayload(res.data);
    const parsed = AdminDisputeListSchema.safeParse(rows);
    if (!parsed.success) {
      console.error("disputes list validation error", parsed.error);
      throw new Error("Unexpected disputes list response shape");
    }
    return parsed.data;
  },

  async getEvidencePacket(disputeId: string): Promise<EvidencePacket> {
    const res = await apiClient.get(
      `/api/admin/disputes/${disputeId}/evidence-packet`
    );
    return parseEntityResponse(
      EvidencePacketSchema,
      res.data,
      "evidence packet"
    );
  },

  async review(disputeId: string): Promise<void> {
    await apiClient.post(`/api/admin/disputes/${disputeId}/review`);
  },

  async resolve(disputeId: string, body: ResolveDisputeDto): Promise<void> {
    await apiClient.post(`/api/admin/disputes/${disputeId}/resolve`, body);
  },

  async confirmBookingCompletion(bookingId: string): Promise<void> {
    await apiClient.post(
      `/api/admin/bookings/${bookingId}/confirm-completion`
    );
  },

  async reverseNoShowStrike(
    eventId: string,
    body: ReverseNoShowStrikeDto
  ): Promise<void> {
    await apiClient.post(
      `/api/admin/bookings/no-show-strikes/${eventId}/reverse`,
      body
    );
  }
};
