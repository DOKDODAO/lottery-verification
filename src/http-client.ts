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
import axios from "axios";
import {
  API_URL,
} from "./constants.js";

export const httpClient = axios.create({
  baseURL: API_URL,
  headers: {
    "User-Agent": "DOKDODAO Lottery Verification System",
  },
});
