/**
 * DOKDODAO Lottery Verification System
 * Copyright (c) 2025 SELVEDGE LAB PTE. LTD.
 * 
 * This source code is licensed under the DOKDODAO Source Available License.
 * You may view and run this code solely to verify lottery results on DOKDODAO.
 * Commercial use, redistribution, and derivative works are prohibited.
 * 
 * See LICENSE.md for full terms.
 */
import type {
  z,
} from "zod";
import type {
  campaignInfoSchema,
  eventInfoSchema,
  participantSchema,
} from "./lottery-info.schema.js";

export type LotteryType = "campaigns" | "events";
export type ParseLotteryURLResult = {
  type: LotteryType;
  lotteryId: string;
};
export type Participant = z.infer<typeof participantSchema>;
export type CampaignInfo = z.infer<typeof campaignInfoSchema>;
export type EventInfo = z.infer<typeof eventInfoSchema>;
export type ParticipantWithTicketRanges = Participant & {
  ticketStart: number;
  ticketEnd: number;
};
export type ParticipantBuiltTicketRanges = {
  id: string;
  ticketStart: number;
  ticketEnd: number;
};
export type Winner = {
  participantId: string;
  prizeRank: number;
  selectedTicketIndex: number;
  drawIndex: number;
};
