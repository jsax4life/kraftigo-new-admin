import { z } from "zod";

const LooseRecord = z.record(z.string(), z.unknown());
const NullableRecord = LooseRecord.nullish();

export const DisputeResolutionTypeSchema = z.enum([
  "REFUND_CUSTOMER",
  "PAY_ARTISAN",
  "SPLIT"
]);

export type DisputeResolutionType = z.infer<typeof DisputeResolutionTypeSchema>;

export const AdminDisputeSchema = z
  .object({
    id: z.string(),
    status: z.string().nullish(),
    bookingId: z.string().nullish(),
    createdAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
    reason: z.string().nullish(),
    openedById: z.string().nullish()
  })
  .passthrough();

export type AdminDispute = z.infer<typeof AdminDisputeSchema>;

export type ResolveDisputeDto = {
  resolutionType: DisputeResolutionType;
  refundAmount: number;
  artisanAmount: number;
  adminNote: string;
};

export const EvidenceAttachmentSchema = z
  .object({
    url: z.string().nullish()
  })
  .passthrough();

export const EvidenceSubmissionSchema = z
  .object({
    attachments: z.array(EvidenceAttachmentSchema).nullish()
  })
  .passthrough();

export const ChatMessageSchema = z
  .object({
    id: z.string().nullish(),
    senderId: z.string().nullish(),
    content: z.string().nullish(),
    type: z.string().nullish(),
    createdAt: z.string().nullish()
  })
  .passthrough();

export const NoShowEventSchema = z
  .object({
    id: z.string().nullish(),
    eventId: z.string().nullish(),
    reversalId: z.string().nullish(),
    reversalReason: z.string().nullish(),
    reversedAt: z.string().nullish(),
    reversedById: z.string().nullish()
  })
  .passthrough();

export type NoShowEvent = z.infer<typeof NoShowEventSchema>;

export const ParticipantSchema = z
  .object({
    id: z.string(),
    email: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    roles: z.array(z.string()).nullish()
  })
  .passthrough();

export const IntegritySchema = z
  .object({
    startPinVerified: z.boolean().nullish(),
    startLocationVerified: z.boolean().nullish(),
    completionLocationVerified: z.boolean().nullish(),
    workDurationSeconds: z.coerce.number().nullish(),
    beforeMedia: z.array(EvidenceAttachmentSchema).nullish(),
    afterMedia: z.array(EvidenceAttachmentSchema).nullish(),
    anomalyFlags: z.array(z.unknown()).nullish()
  })
  .passthrough();

export const EvidencePacketSchema = z
  .object({
    generatedAt: z.string().nullish(),
    dispute: NullableRecord,
    booking: NullableRecord,
    payment: NullableRecord,
    payouts: z.array(LooseRecord).nullish(),
    escrow: z.array(LooseRecord).nullish(),
    transactions: z.array(LooseRecord).nullish(),
    verificationEvents: z.array(LooseRecord).nullish(),
    evidenceSubmissions: z.array(EvidenceSubmissionSchema).nullish(),
    chat: z
      .object({
        conversation: NullableRecord,
        messages: z.array(ChatMessageSchema).nullish()
      })
      .nullish(),
    noShowEvents: z.array(NoShowEventSchema).nullish(),
    participants: z.array(ParticipantSchema).nullish(),
    integrity: IntegritySchema.nullish()
  })
  .passthrough();

export type EvidencePacket = z.infer<typeof EvidencePacketSchema>;

export type ReverseNoShowStrikeDto = {
  reason: string;
};
