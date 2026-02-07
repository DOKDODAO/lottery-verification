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
  keccak256,
  solidityPacked,
} from "ethers";
import type {
  LotteryType,
  ParseLotteryURLResult,
  Participant,
  ParticipantBuiltTicketRanges,
  ParticipantWithTicketRanges,
  Winner,
} from "./types.js";

/**
 * Parse the lottery URL and return the type and lottery ID.
 * @param url - The URL to parse.
 * @returns The parsed result.
 * @throws An error if the URL is invalid.
 */
export function parseLotteryUrl(
  url: string,
): ParseLotteryURLResult {
  const pattern = /^https:\/\/www\.dokdodao\.io\/(campaigns|events)\/(\d+)$/;
  const match = url.match(pattern);
  if (!match) {
    throw new Error("Invalid URL format. Expected: https://www.dokdodao.io/campaigns/{id} or https://www.dokdodao.io/events/{id}");
  }
  const result: ParseLotteryURLResult = {
    type: match[1] as LotteryType,
    lotteryId: match[2]!,
  };
  return result;
}

/**
 * To ensure consistency, sort participants by ID and assign ticket ranges sequentially.
 * @param participants - The participants to assign ticket ranges to.
 * @returns The participants with ticket ranges assigned.
 */
export function assignTicketRanges(
  participants: Participant[],
): ParticipantWithTicketRanges[] {
  const sortedParticipants = [...participants].sort((a, b) => a.id.localeCompare(b.id));
  let currentTicket = 0;
  const participantWithTicketRanges: ParticipantWithTicketRanges[] = sortedParticipants.map((participant) => {
    const ticketStart = currentTicket;
    const ticketEnd = ticketStart + participant.ticketCount - 1;
    currentTicket += participant.ticketCount;
    const range: ParticipantWithTicketRanges = {
      ...participant,
      ticketStart,
      ticketEnd,
    };
    return range;
  });
  return participantWithTicketRanges;
}

/**
 * Calculate the Merkle root for a given set of participants.
 * @param participants - The participants to calculate the Merkle root for.
 * @returns The Merkle root.
 * @throws An error if the participants array is empty.
 * @throws An error if the Merkle root calculation fails.
 */
export function calculateMerkleRoot(
  participants: Participant[],
): string {
  if (participants.length === 0) {
    throw new Error("Participants array is empty");
  }
  const participantWithTicketRanges: ParticipantWithTicketRanges[] = assignTicketRanges(participants);

  let leaves: string[] = participantWithTicketRanges.map((participant) => {
    const packed: string = solidityPacked(
      ["string", "uint256", "uint256"],
      [participant.id, participant.ticketStart, participant.ticketEnd],
    );
    return keccak256(packed);
  });

  while (leaves.length > 1) {
    let nextLevel: string[] = [];
    for (let i = 0; i < leaves.length; i += 2) {
      if (i + 1 < leaves.length) {
        const [left, right] = [leaves[i], leaves[i + 1]].sort();
        const packed: string = solidityPacked(["bytes32", "bytes32"], [left, right]);
        nextLevel.push(keccak256(packed));
      } else {
        const leaf = leaves[i];
        if (leaf) {
          nextLevel.push(leaf);
        }
      }
    }
    leaves = nextLevel;
  }
  const root = leaves[0];
  if (!root) {
    throw new Error("Failed to calculate Merkle root");
  }
  return root;
}

/**
 * Build ticket ranges for participants.
 * @param participants - The participants to build ticket ranges for.
 * @returns The participants with ticket ranges built.
 */
export function buildTicketRanges(
  participants: Participant[],
): ParticipantBuiltTicketRanges[] {
  let participantWithTicketRanges: ParticipantBuiltTicketRanges[] = [];
  let currentIndex: number = 0;
  for (const participant of participants) {
    if (participant.ticketCount <= 0) {
      throw new Error("Invalid ticket count for participant");
    }
    const ticketStart = currentIndex;
    const ticketEnd = ticketStart + participant.ticketCount - 1;
    currentIndex += participant.ticketCount;
    participantWithTicketRanges.push({
      id: participant.id,
      ticketStart,
      ticketEnd,
    });
  }
  return participantWithTicketRanges;
}

/**
 * Derive a ticket index from a seed and draw index.
 * @param seed - VRF seed
 * @param drawIndex - Draw index
 * @param totalTickets - Total number of tickets
 * @returns The ticket index
 */
export function deriveTicketIndex(
  seed: bigint,
  drawIndex: number,
  totalTickets: number,
): number {
  const packed: string = solidityPacked(["uint256", "uint256"], [seed, drawIndex]);
  const hash: string = keccak256(packed);
  const hashBigInt: bigint = BigInt(hash);
  return Number(hashBigInt % BigInt(totalTickets));
}

/**
 * Find the participant by ticket index.
 * @param ranges - The ranges to find the participant in.
 * @param ticketIndex - The ticket index to find the participant by.
 * @returns The participant ID.
 * @throws An error if the range is invalid.
 * @throws An error if the ticket index is invalid.
 */
export function findParticipantByTicketIndex(
  ranges: ParticipantBuiltTicketRanges[],
  ticketIndex: number,
): string {
  let left: number = 0;
  let right: number = ranges.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const range = ranges[mid];
    if (range == null) {
      throw new Error("Invalid range");
    }
    if (ticketIndex < range.ticketStart) {
      right = mid - 1;
    } else if (ticketIndex > range.ticketEnd) {
      left = mid + 1;
    } else {
      return range.id;
    }
  }
  throw new Error("Invalid ticket index");
}

/**
 * Get the prize rank for a given winner index.
 * @param winnerIndex - The index of the winner.
 * @param prizeConfig - The prize configuration.
 * @returns The prize rank.
 * @throws An error if the prize rank is invalid.
 */
export function getPrizeRank(
  winnerIndex: number,
  prizeConfig: number[],
): number {
  let cumulative: number = 0;
  for (let i = 0; i < prizeConfig.length; i++) {
    cumulative += prizeConfig[i]!;
    if (winnerIndex < cumulative) {
      return i;
    }
  }
  return prizeConfig.length - 1;
}

/**
 * Calculate the winners for a given set of participants.
 * @param randomSeed - The random seed.
 * @param participants - The participants to calculate the winners for.
 * @param prizeConfig - The prize configuration.
 * @returns The winners.
 * @throws An error if the winners calculation fails.
 */
export function calculateWinners(
  randomSeed: bigint | string,
  participants: Participant[],
  prizeConfig: number[],
) {
  const seed = BigInt(randomSeed)
  const totalTickets = participants.reduce((acc, participant) => acc + participant.ticketCount, 0);
  const totalWinners = prizeConfig.reduce((acc, prizeCount) => acc + prizeCount, 0);

  if (totalWinners > participants.length) {
    throw new Error("Total winners is cannot exceed the number of participants");
  }
  if (totalWinners > totalTickets) {
    throw new Error("Total winners is cannot exceed the total number of tickets");
  }
  const ranges: ParticipantBuiltTicketRanges[] = buildTicketRanges(participants);
  const winners: Winner[] = [];
  const wonParticipantIds = new Set<string>();
  let drawIndex: number = 0;
  // To prevent infinite loops
  const maxDrawAttempts: number = totalTickets * 10;

  while (winners.length < totalWinners && drawIndex < maxDrawAttempts) {
    const ticketIndex = deriveTicketIndex(seed, drawIndex, totalTickets);
    const participantId = findParticipantByTicketIndex(ranges, ticketIndex);
    if (!wonParticipantIds.has(participantId)) {
      wonParticipantIds.add(participantId);
      winners.push({
        participantId,
        prizeRank: getPrizeRank(winners.length, prizeConfig),
        selectedTicketIndex: ticketIndex,
        drawIndex,
      });
    }
    drawIndex++;
  }
  if (winners.length < totalWinners) {
    throw new Error("Failed to calculate winners");
  }
  return winners;
}
