import "server-only";
import { examById, exams as staticExams } from "@/data/exams";
import type { ExamMeta, ExamQuestion, ExamResult } from "@/types/exam";
import { DbError, UUID_RE } from "./db";
import { questionBank } from "./questions";
import { getStore, type TestStore } from "./store";
import type { DbQuestionRow, DbTestRow } from "./store/types";

/**
 * Testlar manbai: kod ichidagi savollar bazasi (src/server/questions) +
 * Supabase'dagi e'lon qilingan testlar. Baza ulanmagan yoki vaqtincha
 * ishlamay qolsa — sayt kod ichidagi testlar bilan ishlashda davom etadi.
 */

export type { DbOptionRow, DbQuestionRow, DbTestRow } from "./store/types";

export function toExamMeta(t: DbTestRow): ExamMeta {
  return {
    id: t.id,
    title: t.title,
    category: t.category,
    description: t.description,
    access: t.is_premium ? "premium" : "free",
    status: t.status === "published" ? "available" : "coming_soon",
    durationMinutes: t.duration_minutes,
    difficulty: t.difficulty,
    questionCount: t.question_count,
    author: t.author,
    updatedAt: t.updated_at.slice(0, 10),
    previewCount: Math.min(2, t.question_count),
    audience: t.grade_or_audience,
    price: t.is_premium ? t.price : 0,
    source: "db",
  };
}

/** Bazadagi savol → engine formati. Variantlar A–D tartibida; ochiq savolda — qabul qilinadigan javoblar */
export function toExamQuestion(q: DbQuestionRow): ExamQuestion {
  const opts = [...q.question_options].sort((a, b) => a.option_label.localeCompare(b.option_label, "en", { numeric: true }));
  const base = {
    id: q.id,
    spec: q.topic ?? "",
    difficulty: q.difficulty,
    prompt: q.question_text,
    explanation: q.explanation,
    source: { document: q.source_title ?? "Manba ko‘rsatilmagan", article: q.legal_article ?? undefined, url: q.source_url ?? undefined },
  };
  if (q.question_type === "O") return { ...base, kind: "O", accepted: opts.map((o) => o.option_text), answerHint: "Qisqa javob" };
  return {
    ...base,
    kind: q.question_type,
    options: opts.map((o) => o.option_text) as [string, string, string, string],
    correctIndex: Math.max(0, opts.findIndex((o) => o.is_correct)) as 0 | 1 | 2 | 3,
  };
}

async function safe<T>(fn: (store: TestStore) => Promise<T>, fallback: T): Promise<T> {
  const store = await getStore().catch((e) => {
    console.error("[exam-repository]", e);
    return null;
  });
  if (!store) return fallback;
  try {
    return await fn(store);
  } catch (e) {
    console.error("[exam-repository]", e instanceof DbError ? `${e.status} ${e.message}` : e);
    return fallback;
  }
}

/** Ochiq katalog: kod ichidagi testlar + bazadagi e'lon qilinganlar */
export async function listCatalog(): Promise<ExamMeta[]> {
  const dbExams = await safe(async (store) => (await store.listTests({ publishedOnly: true })).map(toExamMeta), [] as ExamMeta[]);
  return [...staticExams.map((e) => ({ ...e, source: "static" as const })), ...dbExams];
}

/** Ochiq foydalanish uchun test: faqat e'lon qilingan (draft/archived — topilmadi) */
export async function getExam(id: string): Promise<ExamMeta | undefined> {
  if (examById[id]) return { ...examById[id], source: "static" };
  if (!UUID_RE.test(id)) return undefined;
  return safe(async (store) => {
    const row = await store.getTest(id, { publishedOnly: true });
    return row ? toExamMeta(row) : undefined;
  }, undefined);
}

export async function getExamQuestions(exam: ExamMeta): Promise<ExamQuestion[] | undefined> {
  if (exam.source !== "db") return questionBank[exam.id];
  return safe(async (store) => (await store.getQuestions(exam.id)).map(toExamQuestion), undefined);
}

/**
 * Bazadagi test bo'yicha urinishni yozib qo'yish (Question Intelligence statistikasi uchun).
 * Xato natija qaytarishga xalaqit bermaydi — faqat log.
 */
export async function recordAttempt(exam: ExamMeta, uid: string, result: ExamResult) {
  if (exam.source !== "db") return;
  await safe(
    (store) =>
      store.recordAttempt({
        testId: exam.id,
        userId: uid,
        startedAt: result.startedAt,
        finishedAt: result.finishedAt,
        score: result.correct,
        total: result.total,
        status: result.autoSubmitted ? "auto_submitted" : "submitted",
        answers: result.items.map((i) => ({
          questionId: i.question.id,
          optionIndex: typeof i.answer === "number" ? i.answer : null,
          answerText: typeof i.answer === "string" ? i.answer : null,
          isCorrect: i.correct,
        })),
      }),
    undefined,
  );
}
