"use client";

import { useQuery } from "@tanstack/react-query";
import { disputesAdminService } from "@/services/disputes-admin.service";
import type { AdminDispute, EvidencePacket } from "@/types/disputes-admin";

export function useAdminDisputes() {
  return useQuery<AdminDispute[], Error>({
    queryKey: ["admin", "disputes"],
    queryFn: () => disputesAdminService.list()
  });
}

export function useDisputeEvidencePacket(disputeId: string | undefined) {
  return useQuery<EvidencePacket, Error>({
    queryKey: ["admin", "disputes", disputeId, "evidence"],
    queryFn: () => disputesAdminService.getEvidencePacket(disputeId!),
    enabled: !!disputeId,
    staleTime: 0,
    gcTime: 5 * 60_000
  });
}
