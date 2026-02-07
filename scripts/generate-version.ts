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

const __dirname = import.meta.dirname;
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

const content = `/**
 * DOKDODAO Lottery Verification System
 * Copyright (c) 2025 SELVEDGE LAB PTE. LTD.
 *
 * This source code is licensed under the DOKDODAO Source Available License.
 * You may view and run this code solely to verify lottery results on DOKDODAO.
 * Commercial use, redistribution, and derivative works are prohibited.
 *
 * See LICENSE.md for full terms.
 */

// Auto-generated from package.json - do not edit manually
export const VERSION = "${pkg.version}";
`;

fs.writeFileSync(path.join(__dirname, "../src/version.ts"), content);
console.log(`Generated version.ts with version ${pkg.version}`);
