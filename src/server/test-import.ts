import "server-only";
import readXlsxFile from "read-excel-file/node";
import { examCategoryLabel, exams as staticExams } from "@/data/exams";
import { normalizeAnswer } from "@/lib/grading";
import {
  autoMapping,
  decodeUtf8,
  detectFormat,
  headerRowIndex,
  KNOWN_COLUMNS,
  MAX_FILE_BYTES,
  MAX_ROWS,
  parseCsv,
  validateWorkbook,
  type Column,
  type ImportDefaults,
  type ImportIssue,
  type ImportPreview,
  type ImportSheet,
} from "@/lib/test-import";
import { DbError } from "./db";
import { questionBank } from "./questions";
import { getStore } from "./store";

/** Brauzerga yuboriladigan va qaytib keladigan ish kitobi: barcha katakchalar satr ko'rinishida */
export interface WorkbookInput {
  fileName: string;
  format: "xlsx" | "csv";
  sheets: ImportSheet[];
  mapping?: Record<number, (Column | "")[]>;
  defaults?: ImportDefaults;
  sheetAsTitle?: boolean;
}

function cellToString(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

/** Yuklangan fayl → varaqlar (har biri qatorlar × ustunlar, satrlar) */
export async function readUpload(file: File): Promise<{ format: "xlsx" | "csv"; sheets: ImportSheet[] } | { error: ImportIssue }> {
  const fail = (code: ImportIssue["code"], message: string) => ({ error: { row: null, code, message } });
  if (file.size === 0) return fail("file_format", "Fayl bo‘sh.");
  if (file.size > MAX_FILE_BYTES) return fail("file_format", `Fayl hajmi ${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)} MB dan oshmasligi kerak.`);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const format = detectFormat(bytes, file.name);
  if (format === "xls") return fail("file_format", "Eski .xls formati qo‘llab-quvvatlanmaydi. Excel’da «Saqlash → .xlsx» qiling.");
  if (format === "unknown") return fail("file_format", "Fayl formati aniqlanmadi. Faqat .xlsx yoki .csv yuklang.");

  if (format === "csv") {
    const decoded = decodeUtf8(bytes);
    if (!decoded.ok) return fail("encoding", "Kodirovka xatosi: CSV fayl UTF-8 da bo‘lishi kerak. Excel’da «CSV UTF-8 (vergul bilan ajratilgan)» sifatida saqlang.");
    return { format, sheets: [{ name: "", rows: parseCsv(decoded.text) }] };
  }
  try {
    const sheets = await readXlsxFile(Buffer.from(bytes));
    return {
      format,
      sheets: sheets
        .map((sh) => ({ name: sh.sheet, rows: sh.data.map((r) => r.map(cellToString)) }))
        .filter((sh) => headerRowIndex(sh.rows) >= 0),
    };
  } catch (e) {
    return fail("file_format", `Excel faylini o‘qib bo‘lmadi: ${e instanceof Error ? e.message : "buzilgan fayl"}`);
  }
}

/** Brauzerdan kelgan ish kitobini tekshirish (shakl va hajm) — validatsiyadan oldin */
export function sanitizeWorkbook(raw: unknown): WorkbookInput | null {
  const b = raw as Partial<WorkbookInput> | null;
  if (!b || !Array.isArray(b.sheets) || b.sheets.length === 0 || b.sheets.length > 100) return null;
  let rows = 0;
  const sheets: ImportSheet[] = [];
  for (const sh of b.sheets) {
    if (!sh || !Array.isArray(sh.rows)) return null;
    rows += sh.rows.length;
    if (rows > MAX_ROWS + 200) return null;
    sheets.push({
      name: String(sh.name ?? "").slice(0, 100),
      rows: sh.rows.map((r) => (Array.isArray(r) ? r.slice(0, 60).map((c) => cellToString(c).slice(0, 5000)) : [])),
    });
  }
  // Moslashtirish: faqat ma'lum maydon nomlari
  let mapping: WorkbookInput["mapping"];
  if (b.mapping && typeof b.mapping === "object") {
    mapping = {};
    for (const [k, v] of Object.entries(b.mapping)) {
      if (Array.isArray(v)) mapping[Number(k)] = v.slice(0, 60).map((c) => ((KNOWN_COLUMNS as readonly string[]).includes(String(c)) ? (c as Column) : ""));
    }
  }
  // Standart qiymatlar: har biri alohida tekshiriladi, noto'g'risi tashlab yuboriladi
  const d = (b.defaults ?? {}) as Record<string, unknown>;
  const int = (v: unknown, min: number, max: number) => (Number.isInteger(Number(v)) && Number(v) >= min && Number(v) <= max && v !== "" && v !== null ? Number(v) : undefined);
  const defaults: ImportDefaults = {
    category: String(d.category) in examCategoryLabel ? (d.category as ImportDefaults["category"]) : undefined,
    duration_minutes: int(d.duration_minutes, 1, 300),
    is_premium: typeof d.is_premium === "boolean" ? d.is_premium : undefined,
    price: d.price === null ? null : int(d.price, 0, 10_000_000),
    exam_type: ["mock", "topic", "practice", "attestation"].includes(String(d.exam_type)) ? (d.exam_type as ImportDefaults["exam_type"]) : undefined,
    author: typeof d.author === "string" ? d.author.slice(0, 120) : undefined,
  };
  return {
    fileName: String(b.fileName ?? "import").slice(0, 200),
    format: b.format === "csv" ? "csv" : "xlsx",
    sheets,
    mapping,
    defaults,
    sheetAsTitle: b.sheetAsTitle !== false,
  };
}

/** Har bir varaq uchun avtomatik ustun moslashtirish (UI'da boshlang'ich qiymat) */
export function autoMappings(sheets: ImportSheet[]) {
  return Object.fromEntries(sheets.map((sh, i) => [i, autoMapping(sh.rows[headerRowIndex(sh.rows)] ?? [])]));
}

/** Takrorlanishni aniqlash uchun mavjud test nomlari va savollar (kod ichidagi + bazadagi) */
async function existing(normalizedTexts: string[]) {
  const titles = new Set(staticExams.map((e) => normalizeAnswer(e.title)));
  const questions = new Map<string, string>();
  for (const [examId, qs] of Object.entries(questionBank)) {
    const title = staticExams.find((e) => e.id === examId)?.title ?? examId;
    for (const q of qs) questions.set(normalizeAnswer(q.prompt), title);
  }
  const store = await getStore();
  if (store) {
    for (const t of await store.allTitles()) titles.add(normalizeAnswer(t));
    // Katta fayllarda so'rovni bo'laklarga ajratamiz
    for (let i = 0; i < normalizedTexts.length; i += 500) {
      for (const r of await store.findDuplicates(normalizedTexts.slice(i, i + 500))) questions.set(r.normalized_text, r.test_title);
    }
  }
  return { titles, questions };
}

export async function previewWorkbook(input: WorkbookInput): Promise<ImportPreview> {
  const base = { format: input.format, fileName: input.fileName, mapping: input.mapping, defaults: input.defaults, sheetAsTitle: input.sheetAsTitle };
  // Avval bazasiz validatsiya — savollar matnini olish uchun, keyin mavjudlarga solishtirib qayta
  const draft = validateWorkbook(input.sheets, { ...base, existingTitles: new Set(), existingQuestions: new Map() });
  const texts = draft.tests.flatMap((t) => t.questions.map((q) => q.normalized_text));
  const { titles, questions } = await existing(texts);
  return validateWorkbook(input.sheets, { ...base, existingTitles: titles, existingQuestions: questions });
}

export async function previewImport(file: File, extra: Pick<WorkbookInput, "mapping" | "defaults" | "sheetAsTitle"> = {}): Promise<ImportPreview> {
  const read = await readUpload(file);
  if ("error" in read) return { format: "csv", fileName: file.name, totalRows: 0, tests: [], errors: [read.error], warnings: [], canImport: false };
  return previewWorkbook({ fileName: file.name, format: read.format, sheets: read.sheets, ...extra });
}

export interface ImportSummary {
  batchId: string;
  testsCreated: number;
  questionsImported: number;
  testIds: string[];
  durationMs: number;
  warnings: number;
}

/** Atomar import: import_tests() bitta tranzaksiyada — xato bo'lsa bazaga hech narsa yozilmaydi */
export async function commitImport(preview: ImportPreview, importedBy: string): Promise<ImportSummary> {
  const store = await getStore();
  if (!store) throw new DbError("Ma’lumotlar bazasi ulanmagan — import qilib bo‘lmaydi.", 503);
  if (!preview.canImport) throw new DbError("Faylda xatolar bor — avval ularni tuzating.", 400);
  const started = Date.now();
  // firstRow va row — faqat xato xabarlari uchun, bazaga yuborilmaydi
  const payload = preview.tests.map((t) => ({
    title: t.title,
    author: t.author,
    description: t.description,
    category: t.category,
    exam_type: t.exam_type,
    grade_or_audience: t.grade_or_audience,
    duration_minutes: t.duration_minutes,
    price: t.price,
    is_premium: t.is_premium,
    difficulty: t.difficulty,
    questions: t.questions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      topic: q.topic,
      difficulty: q.difficulty,
      explanation: q.explanation,
      source_title: q.source_title,
      source_url: q.source_url,
      legal_article: q.legal_article,
      normalized_text: q.normalized_text,
      options: q.options,
    })),
  }));
  const r = await store.importTests({
    tests: payload,
    fileName: preview.fileName.slice(0, 200),
    format: preview.format,
    importedBy,
    warnings: preview.warnings.slice(0, 200),
  });
  return {
    batchId: r.batch_id,
    testsCreated: r.tests_created,
    questionsImported: r.questions_imported,
    testIds: r.test_ids,
    durationMs: Date.now() - started,
    warnings: preview.warnings.length,
  };
}
