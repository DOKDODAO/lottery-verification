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
import pino from "pino";
import pinoPretty from "pino-pretty";

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
  },
  pinoPretty({
    colorize: true,
    ignore: "pid,hostname",
  }),
);
