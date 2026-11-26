import "server-only";
import { readSheet } from "read-excel-file/node";
import { exams as staticExams } from "@/data/exams";
import { normalizeAnswer } from "@/lib/grading";
import { decodeUtf8, detectFormat, MAX_FILE_BYTES, parseCsv, validateImport, type ImportIssue, type ImportPreview } from "@/lib/test-import";
import { DbError } from "./db";
import { questionBank } from "./questions";
import { getStore } from "./store";

/** Yuklangan faylni o'qish → jadval (qatorlar × ustunlar) */
export async function readUpload(file: File): Promise<{ format: "xlsx" | "csv"; matrix: unknown[][] } | { error: ImportIssue }> {
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
    return { format, matrix: parseCsv(decoded.text) };
  }
  try {
    return { format, matrix: (await readSheet(Buffer.from(bytes))) as unknown[][] };
  } catch (e) {
    return fail("file_format", `Excel faylini o‘qib bo‘lmadi: ${e instanceof Error ? e.message : "buzilgan fayl"}`);
  }
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

export async function previewImport(file: File): Promise<ImportPreview> {
  const read = await readUpload(file);
  if ("error" in read) return { format: "csv", fileName: file.name, totalRows: 0, tests: [], errors: [read.error], warnings: [], canImport: false };

  // Avval bazasiz validatsiya — savollar matnini olish uchun, keyin mavjudlarga solishtirib qayta
  const draft = validateImport(read.matrix, { format: read.format, fileName: file.name, existingTitles: new Set(), existingQuestions: new Map() });
  const texts = draft.tests.flatMap((t) => t.questions.map((q) => q.normalized_text));
  const { titles, questions } = await existing(texts);
  return validateImport(read.matrix, { format: read.format, fileName: file.name, existingTitles: titles, existingQuestions: questions });
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
