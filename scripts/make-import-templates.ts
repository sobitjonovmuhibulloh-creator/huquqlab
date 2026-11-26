/**
 * Admin import shablonlarini yaratadi: public/templates/huquqlab-test-import.{xlsx,csv}
 * Ishga tushirish: npm run templates
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import writeExcelFile from "write-excel-file/node";
import { parseCsv, templateCsv } from "../src/lib/test-import";

const dir = path.join(process.cwd(), "public", "templates");
mkdirSync(dir, { recursive: true });

const csv = templateCsv();
writeFileSync(path.join(dir, "huquqlab-test-import.csv"), csv, "utf8");

// Excel shablon — CSV bilan aynan bir xil mazmun, sarlavha qalin
async function main() {
  const rows = parseCsv(csv.replace(/^﻿/, ""));
  const sheet = rows.map((r, i) => r.map((value) => ({ value, fontWeight: i === 0 ? ("bold" as const) : undefined })));
  const columns = rows[0].map((h) => ({ width: h.includes("question") || h.includes("option") || h === "explanation" ? 40 : 18 }));
  const buffer = await writeExcelFile(sheet, { columns }).toBuffer();
  writeFileSync(path.join(dir, "huquqlab-test-import.xlsx"), buffer);
  console.log("✓ public/templates/huquqlab-test-import.csv va .xlsx yaratildi");
}

void main();
