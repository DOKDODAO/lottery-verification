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
import {
  z,
} from "zod";

export const participantSchema = z.object({
  id: z.string(),
  ticketCount: z.number(),
});

export const prizeSchema = z.object({
  id: z.string(),
  name: z.string(),
  count: z.number(),
})

export const eventInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  randomSeed: z.string(),
  prizes: z.array(prizeSchema),
  participants: z.array(participantSchema),
});

export const campaignInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  randomSeed: z.string(),
  prizes: z.array(prizeSchema),
  participants: z.array(participantSchema),
});
