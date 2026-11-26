import { examCategoryLabel } from "@/data/exams";
import { normalizeAnswer } from "@/lib/grading";
import type { Audience, Difficulty, ExamCategory, QuestionKind } from "@/types/exam";

/**
 * Excel/CSV orqali testlarni import qilish: formatni aniqlash, CSV parse,
 * qatorlarni test → savollarga birlashtirish va validatsiya.
 * Sof funksiyalar — server route ham, scripts/check-content.ts ham ishlatadi.
 * Qator raqamlari fayldagidek (sarlavha = 1-qator).
 */

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_ROWS = 5000;

export const REQUIRED_COLUMNS = ["test_title", "question_text", "correct_answer"] as const;
export const KNOWN_COLUMNS = [
  "test_title",
  "test_author",
  "test_category",
  "test_description",
  "duration_minutes",
  "price",
  "is_premium",
  "question_text",
  "question_type",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_answer",
  "explanation",
  "topic",
  "difficulty",
  "source_title",
  "source_url",
  "legal_article",
  "exam_type",
  "grade_or_audience",
] as const;
export type Column = (typeof KNOWN_COLUMNS)[number];

/** Sarlavha sinonimlari (o'zbek / rus / ingliz). Avtomatik moslashtirish uchun; normalizeAnswer + «_» ko'rinishida solishtiriladi */
export const HEADER_ALIASES: Record<Column, string[]> = {
  test_title: ["test", "test nomi", "testning nomi", "variant", "название теста", "тест", "вариант", "test name", "title"],
  test_author: ["muallif", "автор", "author"],
  test_category: ["kategoriya", "toifa", "bo‘lim", "категория", "раздел", "category"],
  test_description: ["tavsif", "описание", "description"],
  duration_minutes: ["vaqt", "davomiylik", "daqiqa", "время", "длительность", "минуты", "duration", "time", "minutes"],
  price: ["narx", "narxi", "цена", "стоимость", "price", "cost"],
  is_premium: ["premium", "pullik", "платный", "премиум", "paid"],
  question_text: ["savol", "savol matni", "вопрос", "текст вопроса", "question", "text"],
  question_type: ["savol turi", "tur", "тип", "тип вопроса", "type"],
  option_a: ["a", "a variant", "variant a", "javob a", "вариант a", "ответ a", "answer a", "а", "вариант а", "ответ а"],
  option_b: ["b", "b variant", "variant b", "javob b", "вариант b", "ответ b", "answer b", "б", "вариант б", "ответ б"],
  option_c: ["c", "c variant", "variant c", "javob c", "вариант c", "ответ c", "answer c", "с", "вариант в", "ответ в"],
  option_d: ["d", "d variant", "variant d", "javob d", "вариант d", "ответ d", "answer d", "д", "вариант г", "ответ г"],
  correct_answer: ["to‘g‘ri javob", "javob", "kalit", "to‘g‘ri", "правильный ответ", "ответ", "ключ", "answer", "correct", "key"],
  explanation: ["izoh", "tushuntirish", "пояснение", "объяснение", "комментарий", "explanation", "comment"],
  topic: ["mavzu", "тема", "topic"],
  difficulty: ["qiyinlik", "daraja", "сложность", "уровень", "difficulty", "level"],
  source_title: ["manba", "источник", "source"],
  source_url: ["havola", "link", "ссылка", "url"],
  legal_article: ["modda", "статья", "article"],
  exam_type: ["test turi", "тип теста"],
  grade_or_audience: ["auditoriya", "sinf", "kim uchun", "аудитория", "класс", "audience", "grade"],
};

const headerKey = (h: unknown) => normalizeAnswer(cellText(h)).replace(/\s+/g, "_");

/** Sarlavha qatoridan ustunlarni avtomatik aniqlash: aniq nom → sinonim; har bir maydon faqat bir marta */
export function autoMapping(headerRow: unknown[]): (Column | "")[] {
  const used = new Set<Column>();
  return headerRow.map((h) => {
    const k = headerKey(h);
    if (!k) return "";
    const exact = (KNOWN_COLUMNS as readonly string[]).includes(k) ? (k as Column) : undefined;
    const found = exact ?? (Object.keys(HEADER_ALIASES) as Column[]).find((c) => HEADER_ALIASES[c].some((a) => headerKey(a) === k));
    if (!found || used.has(found)) return "";
    used.add(found);
    return found;
  });
}

/** Birinchi bo'sh bo'lmagan qator — sarlavha */
export function headerRowIndex(rows: unknown[][]) {
  return rows.findIndex((r) => r.some((c) => cellText(c)));
}

export interface ImportSheet {
  name: string;
  rows: unknown[][];
}

/** Faylda bo'lmagan test maydonlari uchun admin tanlaydigan standart qiymatlar */
export interface ImportDefaults {
  category?: ExamCategory;
  duration_minutes?: number;
  is_premium?: boolean;
  /** null — standart narx */
  price?: number | null;
  exam_type?: ImportTest["exam_type"];
  author?: string;
}

export type IssueCode =
  | "file_format"
  | "encoding"
  | "missing_column"
  | "unknown_column"
  | "too_many_rows"
  | "empty_row"
  | "missing_title"
  | "missing_question"
  | "missing_options"
  | "invalid_correct"
  | "duplicate_option"
  | "duplicate_in_file"
  | "duplicate_in_db"
  | "title_exists"
  | "invalid_price"
  | "invalid_duration"
  | "invalid_category"
  | "invalid_bool"
  | "invalid_difficulty"
  | "invalid_url"
  | "unsupported_type"
  | "conflicting_test_field"
  | "no_questions";

export interface ImportIssue {
  /** Fayldagi qator raqami; null — butun faylga oid */
  row: number | null;
  /** Excel varag'i (bir nechta varaqli faylda) */
  sheet?: string;
  column?: string;
  code: IssueCode;
  message: string;
}

export interface ImportOption {
  label: string;
  text: string;
  is_correct: boolean;
}

export interface ImportQuestion {
  row: number;
  sheet?: string;
  question_text: string;
  question_type: QuestionKind;
  topic: string | null;
  difficulty: Difficulty;
  explanation: string;
  source_title: string | null;
  source_url: string | null;
  legal_article: string | null;
  normalized_text: string;
  options: ImportOption[];
}

export interface ImportTest {
  title: string;
  /** Muallif (kitob, to'plam) — bo'sh bo'lsa «HuquqLab tahririyati» */
  author: string;
  description: string;
  category: ExamCategory;
  exam_type: "mock" | "topic" | "practice" | "attestation";
  grade_or_audience: Audience[];
  duration_minutes: number;
  /** null — standart narx */
  price: number | null;
  is_premium: boolean;
  difficulty: Difficulty;
  firstRow: number;
  questions: ImportQuestion[];
}

export interface ImportPreview {
  format: "xlsx" | "csv";
  fileName: string;
  totalRows: number;
  tests: ImportTest[];
  errors: ImportIssue[];
  warnings: ImportIssue[];
  /** Xato bo'lmasa — importga tayyor */
  canImport: boolean;
}

/* ---------------- Format va CSV ---------------- */

export type DetectedFormat = "xlsx" | "csv" | "xls" | "unknown";

/** Fayl kengaytmasiga emas, mazmuniga qarab: xlsx — ZIP (PK\x03\x04), eski .xls — OLE2 */
export function detectFormat(bytes: Uint8Array, fileName: string): DetectedFormat {
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return "xlsx";
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return "xls";
  if (/\.(csv|txt)$/i.test(fileName)) return "csv";
  // Kengaytmasiz matn fayli: ichida nol bayt bo'lmasa CSV deb qaraymiz
  return bytes.subarray(0, 4096).includes(0) ? "unknown" : "csv";
}

/** UTF-8 (BOM bilan yoki bo'lmasdan). Boshqa kodirovka — aniq xato (sirli harflar bazaga tushmasin) */
export function decodeUtf8(bytes: Uint8Array): { ok: true; text: string } | { ok: false } {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return { ok: true, text: text.replace(/^﻿/, "") };
  } catch {
    return { ok: false };
  }
}

/** RFC 4180 CSV: qo'shtirnoq ichida vergul/yangi qator, "" — qochirilgan qo'shtirnoq. Ajratuvchi: , ; yoki tab */
export function parseCsv(text: string): string[][] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  const counts = { ",": 0, ";": 0, "\t": 0 } as Record<string, number>;
  let inQ = false;
  for (const ch of firstLine) {
    if (ch === '"') inQ = !inQ;
    else if (!inQ && ch in counts) counts[ch]++;
  }
  const delim = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0 ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"' && field === "") quoted = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/* ---------------- Validatsiya ---------------- */

const CATEGORY_ALIASES: Record<string, ExamCategory> = Object.fromEntries(
  (Object.entries(examCategoryLabel) as [ExamCategory, string][]).flatMap(([id, label]) => [
    [normalizeAnswer(id), id],
    [normalizeAnswer(label), id],
  ]),
);

const DIFFICULTY_ALIASES: Record<string, Difficulty> = {
  oson: "oson",
  easy: "oson",
  orta: "o'rta",
  medium: "o'rta",
  murakkab: "murakkab",
  qiyin: "murakkab",
  hard: "murakkab",
};

const AUDIENCE_ALIASES: Record<string, Audience> = {
  abituriyent: "abituriyent",
  oqituvchi: "oqituvchi",
  repetitor: "repetitor",
  talaba: "talaba",
  oquvchi: "oquvchi",
};

const EXAM_TYPES = ["mock", "topic", "practice", "attestation"] as const;

function cellText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).replace(/ /g, " ").trim();
}

function parseBool(v: string): boolean | null {
  const n = normalizeAnswer(v);
  if (["1", "true", "ha", "yes", "premium", "pullik"].includes(n)) return true;
  if (["0", "false", "yoq", "no", "bepul", "free"].includes(n)) return false;
  return null;
}

/** "45 000", "45000", "45 000 so'm" → 45000 */
function parseInteger(v: string): number | null {
  const cleaned = v.replace(/so[‘’'ʻ]?m|uzs|daqiqa|min/gi, "").replace(/[\s ]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

export interface ValidateOptions {
  format: "xlsx" | "csv";
  fileName: string;
  /** Bazadagi va kod ichidagi test nomlari (normalizeAnswer ko'rinishida) */
  existingTitles: Set<string>;
  /** Bazadagi va kod ichidagi savollar: normalized_text → qaysi testda */
  existingQuestions: Map<string, string>;
  /** Varaq indeksi → har bir ustun uchun maydon ("" — e'tiborsiz). Berilmasa — avtomatik */
  mapping?: Record<number, (Column | "")[]>;
  defaults?: ImportDefaults;
  /** test_title ustuni bo'lmasa, varaq nomini test nomi sifatida olish (standart: ha) */
  sheetAsTitle?: boolean;
}

export function validateImport(matrix: unknown[][], opts: ValidateOptions): ImportPreview {
  return validateWorkbook([{ name: "", rows: matrix }], opts);
}

export function validateWorkbook(sheets: ImportSheet[], opts: ValidateOptions): ImportPreview {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];
  const result = (tests: ImportTest[], totalRows: number): ImportPreview => ({
    format: opts.format,
    fileName: opts.fileName,
    totalRows,
    tests,
    errors,
    warnings,
    canImport: errors.length === 0 && tests.length > 0,
  });

  const tests = new Map<string, ImportTest>();
  /** Test darajasidagi qiymatlar qayerdan olinganini eslab qolamiz (ziddiyat xabari uchun) */
  const testFieldRow = new Map<string, Record<string, { value: string; row: number }>>();
  /** normalized_text → test kaliti → birinchi qator (bir test ichidagi takror — xato, testlararo — ogohlantirish) */
  const seenInFile = new Map<string, { row: number; title: string; key: string }[]>();
  let totalRows = 0;
  if (!sheets.some((sh) => headerRowIndex(sh.rows) >= 0)) {
    errors.push({ row: null, code: "file_format", message: "Fayl bo‘sh: sarlavha qatori topilmadi." });
    return result([], 0);
  }
  const rowCount = sheets.reduce((n, sh) => n + Math.max(0, sh.rows.length - headerRowIndex(sh.rows) - 1), 0);
  if (rowCount > MAX_ROWS) {
    errors.push({ row: null, code: "too_many_rows", message: `Faylda ${rowCount} qator bor — bir martada ko‘pi bilan ${MAX_ROWS} ta.` });
    return result([], rowCount);
  }

  sheets.forEach((sheet, si) => {
  const sheetName = sheet.name.trim();
  const matrix = sheet.rows;
  const errStart = errors.length;
  const warnStart = warnings.length;
  const headerIdx = headerRowIndex(matrix);
  if (headerIdx < 0) return;
  const mapping = opts.mapping?.[si] ?? autoMapping(matrix[headerIdx]);
  const col = new Map<Column, number>();
  matrix[headerIdx].forEach((h, i) => {
    const m = mapping[i];
    if (m) {
      if (!col.has(m)) col.set(m, i);
    } else if (cellText(h)) warnings.push({ row: headerIdx + 1, column: cellText(h), code: "unknown_column", message: `Ustun e’tiborsiz qoldirildi: «${cellText(h)}»` });
  });
  const titleFromSheet = !col.has("test_title") && (opts.sheetAsTitle ?? true) && sheetName.length >= 3;
  for (const c of REQUIRED_COLUMNS) {
    if (col.has(c) || (c === "test_title" && titleFromSheet)) continue;
    errors.push({ row: headerIdx + 1, column: c, code: "missing_column", message: `Majburiy ustun yo‘q: «${c}» — ustunlarni moslashtiring` });
  }
  if (errors.length > errStart) {
    for (const e of errors.slice(errStart)) e.sheet = sheetName || undefined;
    return;
  }
  const dataRows = matrix.slice(headerIdx + 1);

  dataRows.forEach((raw, i) => {
    const row = headerIdx + 2 + i;
    const get = (c: Column) => (col.has(c) ? cellText(raw[col.get(c)!]) : "");
    if (!raw.some((c) => cellText(c))) {
      warnings.push({ row, code: "empty_row", message: "Bo‘sh qator o‘tkazib yuborildi" });
      return;
    }
    totalRows++;
    const err = (code: IssueCode, message: string, column?: string) => errors.push({ row, column, code, message });

    const title = titleFromSheet ? sheetName : get("test_title");
    if (!title) return err("missing_title", "Test nomi (test_title) ko‘rsatilmagan", "test_title");
    if (title.length < 3 || title.length > 200) return err("missing_title", "Test nomi 3–200 belgi bo‘lishi kerak", "test_title");
    const titleKey = normalizeAnswer(title);

    // --- Test darajasidagi maydonlar: birinchi to'ldirilgan qiymat olinadi, farqli qiymat — xato
    const fields = testFieldRow.get(titleKey) ?? {};
    testFieldRow.set(titleKey, fields);
    const testField = (c: Column) => {
      const v = get(c);
      if (!v) return;
      const prev = fields[c];
      if (!prev) fields[c] = { value: v, row };
      else if (normalizeAnswer(prev.value) !== normalizeAnswer(v))
        err("conflicting_test_field", `«${c}» qiymati shu testning ${prev.row}-qatoridagidan farq qiladi («${prev.value}» va «${v}»)`, c);
    };
    (["test_author", "test_category", "test_description", "duration_minutes", "price", "is_premium", "exam_type", "grade_or_audience"] as Column[]).forEach(testField);

    if (!tests.has(titleKey)) {
      if (opts.existingTitles.has(titleKey)) err("title_exists", `«${title}» nomli test allaqachon mavjud. Import faqat yangi test yaratadi — nomni o‘zgartiring.`, "test_title");
      tests.set(titleKey, {
        title,
        author: "",
        description: "",
        category: "mavzulashtirilgan",
        exam_type: "practice",
        grade_or_audience: [],
        duration_minutes: 0,
        price: null,
        is_premium: true,
        difficulty: "o'rta",
        firstRow: row,
        questions: [],
      });
    }

    // --- Savol
    const text = get("question_text");
    if (!text) return err("missing_question", "Savol matni (question_text) bo‘sh", "question_text");

    const typeRaw = get("question_type").toUpperCase().replace(/\s/g, "") || "Y-1";
    const type = ({ "Y-1": "Y-1", Y1: "Y-1", "Y-2": "Y-2", Y2: "Y-2", O: "O", OCHIQ: "O" } as Record<string, QuestionKind>)[typeRaw];
    if (!type) return err("unsupported_type", `Qo‘llab-quvvatlanmaydigan savol turi: «${get("question_type")}». Mumkin: Y-1, Y-2, O`, "question_type");

    const difficultyRaw = get("difficulty");
    const difficulty = difficultyRaw ? DIFFICULTY_ALIASES[normalizeAnswer(difficultyRaw)] : "o'rta";
    if (!difficulty) err("invalid_difficulty", `Qiyinlik noto‘g‘ri: «${difficultyRaw}». Mumkin: oson, o‘rta, murakkab`, "difficulty");

    const url = get("source_url");
    if (url && !/^https?:\/\/[^\s]+$/i.test(url)) err("invalid_url", `Manba havolasi http(s):// bilan boshlanishi kerak: «${url}»`, "source_url");

    const correctRaw = get("correct_answer");
    const letters = ["a", "b", "c", "d"] as const;
    const optionTexts = letters.map((l) => get(`option_${l}` as Column));
    let options: ImportOption[] = [];

    if (type === "O") {
      const accepted = correctRaw.split("|").map((s) => s.trim()).filter(Boolean);
      if (!accepted.length) err("invalid_correct", "Ochiq savol uchun to‘g‘ri javob (correct_answer) kerak; bir nechta variantni «|» bilan ajrating", "correct_answer");
      if (optionTexts.some(Boolean)) warnings.push({ row, code: "missing_options", message: "Ochiq (O) savolda option_a–d e’tiborsiz qoldirildi" });
      options = accepted.map((t, k) => ({ label: `O${k + 1}`, text: t, is_correct: true }));
    } else {
      const missing = letters.filter((_, k) => !optionTexts[k]);
      if (missing.length) err("missing_options", `Javob variantlari yetishmaydi: ${missing.map((m) => `option_${m}`).join(", ")}`, `option_${missing[0]}`);
      else if (new Set(optionTexts.map(normalizeAnswer)).size < 4) err("duplicate_option", "Javob variantlari takrorlanmasligi kerak", "option_a");
      const letter = correctRaw.toUpperCase().replace(/[^A-D]/g, "");
      const idx = correctRaw && /^[A-D][).]?$/i.test(correctRaw.trim()) ? "ABCD".indexOf(letter) : -1;
      if (idx < 0) err("invalid_correct", `To‘g‘ri javob A, B, C yoki D bo‘lishi kerak, berilgan: «${correctRaw || "bo‘sh"}»`, "correct_answer");
      options = optionTexts.map((t, k) => ({ label: "ABCD"[k], text: t, is_correct: k === idx }));
    }

    const normalized = normalizeAnswer(text);
    const seen = seenInFile.get(normalized) ?? [];
    const sameTest = seen.find((s) => s.key === titleKey);
    if (sameTest) err("duplicate_in_file", `Takroriy savol: shu testning ${sameTest.row}-qatoridagi savol bilan bir xil`, "question_text");
    else if (seen.length)
      warnings.push({ row, column: "question_text", code: "duplicate_in_file", message: `Bu savol «${seen[0].title}» testida ham bor (${seen[0].row}-qator)` });
    seenInFile.set(normalized, [...seen, { row, title, key: titleKey }]);
    const inDb = opts.existingQuestions.get(normalized);
    if (inDb) warnings.push({ row, column: "question_text", code: "duplicate_in_db", message: `Bu savol allaqachon «${inDb}» testida bor` });

    tests.get(titleKey)!.questions.push({
      row,
      sheet: sheetName || undefined,
      question_text: text,
      question_type: type,
      topic: get("topic") || null,
      difficulty: difficulty ?? "o'rta",
      explanation: get("explanation"),
      source_title: get("source_title") || null,
      source_url: url || null,
      legal_article: get("legal_article") || null,
      normalized_text: normalized,
      options,
    });
  });
  for (const e of errors.slice(errStart)) e.sheet ??= sheetName || undefined;
  for (const w of warnings.slice(warnStart)) w.sheet ??= sheetName || undefined;
  });

  // --- Test darajasidagi maydonlarni yakunlash
  for (const [key, t] of tests) {
    const f = testFieldRow.get(key) ?? {};
    const at = (c: string) => f[c]?.row ?? t.firstRow;

    const d = opts.defaults ?? {};
    const sheetOf = t.questions[0]?.sheet;
    const push = (issue: ImportIssue) => errors.push({ ...issue, sheet: issue.sheet ?? sheetOf });

    // Fayldagi qiymat ustun; bo'lmasa — admin tanlagan standart qiymat
    const cat = f.test_category?.value;
    const category = cat ? CATEGORY_ALIASES[normalizeAnswer(cat)] : d.category;
    if (!category)
      push({
        row: at("test_category"),
        column: "test_category",
        code: "invalid_category",
        message: cat ? `Noma’lum kategoriya: «${cat}». Mumkin: ${Object.keys(examCategoryLabel).join(", ")}` : `«${t.title}» uchun kategoriya ko‘rsatilmagan — faylga qo‘shing yoki import sozlamalarida tanlang`,
      });
    else t.category = category;

    t.description = f.test_description?.value ?? "";
    t.author = (f.test_author?.value ?? d.author ?? "").slice(0, 120);

    const dur = f.duration_minutes?.value;
    const duration = dur ? parseInteger(dur) : d.duration_minutes ?? null;
    if (!duration || duration < 1 || duration > 300)
      push({ row: at("duration_minutes"), column: "duration_minutes", code: "invalid_duration", message: dur ? `Davomiylik 1–300 daqiqa oralig‘idagi butun son bo‘lishi kerak: «${dur}»` : `«${t.title}» uchun davomiylik ko‘rsatilmagan — faylga qo‘shing yoki import sozlamalarida kiriting` });
    else t.duration_minutes = duration;

    const priceRaw = f.price?.value;
    const price = priceRaw ? parseInteger(priceRaw) : d.price ?? null;
    if (priceRaw && (price === null || price > 10_000_000))
      push({ row: at("price"), column: "price", code: "invalid_price", message: `Narx 0 – 10 000 000 so‘m oralig‘idagi butun son bo‘lishi kerak: «${priceRaw}»` });

    const premRaw = f.is_premium?.value;
    const prem = premRaw ? parseBool(premRaw) : d.is_premium ?? null;
    if (premRaw && prem === null) push({ row: at("is_premium"), column: "is_premium", code: "invalid_bool", message: `is_premium: «${premRaw}» — ha/yo‘q, true/false yoki 1/0 bo‘lishi kerak` });
    t.is_premium = prem ?? (price ?? 1) > 0;
    if (!f.exam_type && d.exam_type) t.exam_type = d.exam_type;
    if (!t.is_premium && price) errors.push({ row: at("price"), column: "price", code: "invalid_price", message: "Bepul (is_premium = yo‘q) testga narx qo‘yib bo‘lmaydi" });
    if (t.is_premium && price !== null && price > 0 && price < 1000) errors.push({ row: at("price"), column: "price", code: "invalid_price", message: "Premium test narxi kamida 1 000 so‘m" });
    t.price = t.is_premium ? (price || null) : 0;

    const et = f.exam_type?.value;
    if (et) {
      const v = normalizeAnswer(et) as (typeof EXAM_TYPES)[number];
      if (EXAM_TYPES.includes(v)) t.exam_type = v;
      else errors.push({ row: at("exam_type"), column: "exam_type", code: "unsupported_type", message: `exam_type: «${et}». Mumkin: ${EXAM_TYPES.join(", ")}` });
    }
    const aud = f.grade_or_audience?.value;
    if (aud) t.grade_or_audience = [...new Set(aud.split(/[,;]/).map((a) => AUDIENCE_ALIASES[normalizeAnswer(a)]).filter(Boolean))];

    if (t.questions.length === 0) errors.push({ row: t.firstRow, code: "no_questions", message: `«${t.title}» testida yaroqli savol yo‘q` });
  }

  // Varaqlar tartibida, keyin qator bo'yicha
  const order = new Map(sheets.map((sh, i) => [sh.name.trim() || undefined, i]));
  errors.sort((a, b) => (order.get(a.sheet) ?? 0) - (order.get(b.sheet) ?? 0) || (a.row ?? 0) - (b.row ?? 0));
  return result([...tests.values()], totalRows);
}

/** Admin uchun shablon (CSV, UTF-8 BOM bilan — Excel o'zbekcha harflarni to'g'ri ochadi) */
export function templateCsv() {
  const head = KNOWN_COLUMNS.filter((c) => c !== "exam_type" && c !== "grade_or_audience").join(",");
  const rows = [
    [
      "Konstitutsiya: namunaviy test", "HuquqLab tahririyati", "konstitutsiya", "Oliy Majlis va Prezident", "20", "11000", "ha",
      "Oliy Majlis qanday palatalardan iborat?", "Y-1", "Qonunchilik palatasi va Senat", "Senat va Vazirlar Mahkamasi",
      "Qonunchilik palatasi va Konstitutsiyaviy sud", "Xalq deputatlari kengashi va Senat", "A",
      "Oliy Majlis ikki palatadan iborat.", "2.4", "oson", "O‘zbekiston Respublikasi Konstitutsiyasi", "https://lex.uz/uz/docs/6445145", "",
    ],
    [
      "Konstitutsiya: namunaviy test", "", "", "", "", "", "",
      "Qonunchilik palatasi necha nafar deputatdan iborat?", "O", "", "", "", "", "150",
      "Qonunchilik palatasi 150 nafar deputatdan iborat.", "2.4", "o‘rta", "O‘zbekiston Respublikasi Konstitutsiyasi", "https://lex.uz/uz/docs/6445145", "",
    ],
  ];
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return "﻿" + [head, ...rows.map((r) => r.map(esc).join(","))].join("\r\n") + "\r\n";
}
