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
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import {
  program,
} from "commander";
import {
  logger,
} from "./logger.js";
import {
  calculateMerkleRoot,
  calculateWinners,
  parseLotteryUrl,
} from "./lottery-raffle.js";
import type {
  CampaignInfo,
  EventInfo,
  Participant,
} from "./types.js";
import {
  httpClient
} from "./http-client.js";
import {
  campaignInfoSchema,
  eventInfoSchema,
} from "./lottery-info.schema.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

program
  .name("lottery-verification")
  .description("DOKDODAO Lottery Verification System")
  .version(pkg.version)
  .argument(
    "<url>",
    "DOKDODAO campaign or event URL (e.g. https://www.dokdodao.io/events/{145076508687994880})"
  )
  .showHelpAfterError()
  .action(async (url: string) => {
    try {
      const { type, lotteryId } = parseLotteryUrl(url);
      logger.info(`Verifying lottery: ${type} ${lotteryId}`);
      const lotteryInfo = await httpClient
        .get<EventInfo | CampaignInfo>(`/api/v1/${type}/${lotteryId}/lottery/verification`)
        .then(({ data }) => {
          if (type === "events") {
            return eventInfoSchema.parse(data) as EventInfo;
          } else {
            return campaignInfoSchema.parse(data) as CampaignInfo;
          }
        });
      const randomSeed = lotteryInfo.randomSeed;
      const prizeNames = lotteryInfo.prizes.map((prize) => prize.name);
      const prizeConfig = lotteryInfo.prizes.map((prize) => prize.count);
      const participants: Participant[] = lotteryInfo.participants;
      const merkleRoot = calculateMerkleRoot(participants);
      logger.info(`Merkle root: ${merkleRoot}`);
      const winners = calculateWinners(randomSeed, participants, prizeConfig);
      for (const winner of winners) {
        logger.info(`${prizeNames[winner.prizeRank]}: ${winner.participantId} (ticket #${winner.selectedTicketIndex})`);
      }
    } catch (error) {
      logger.error((error as Error).message);
      process.exit(1);
    }
  });

program
  .parse();
