import { sectionLabel } from "@/data/exams";
import type { AnswerValue, ExamQuestion, ExamResult, PublicQuestion, QuestionKind, SectionScore } from "@/types/exam";

/**
 * Baholash mantig'i — sof funksiyalar (server route va scripts/check-content.ts ishlatadi).
 * Muhim: bu yerda savollar bazasi import qilinmaydi.
 */

/** Ochiq javobni solishtirish uchun: registr, apostrof, tinish belgilari va ortiqcha bo'shliqlar olib tashlanadi */
export function normalizeAnswer(value: string) {
  return value
    .toLowerCase()
    .replace(/[‘’'ʻʼ`"«»]/g, "")
    .replace(/[.,;:!?()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isCorrect(q: ExamQuestion, answer: AnswerValue): boolean {
  if (answer === null || answer === undefined) return false;
  if (q.kind === "O") {
    if (typeof answer !== "string") return false;
    const a = normalizeAnswer(answer);
    return a.length > 0 && q.accepted.some((v) => normalizeAnswer(v) === a);
  }
  return typeof answer === "number" && answer === q.correctIndex;
}

/** Klientga yuboriladigan ko'rinish: javob kaliti va izoh olib tashlanadi (oq ro'yxat orqali) */
export function toPublic(q: ExamQuestion): PublicQuestion {
  const base = { id: q.id, kind: q.kind, spec: q.spec, difficulty: q.difficulty, context: q.context, prompt: q.prompt, source: q.source };
  return q.kind === "O" ? { ...base, kind: "O", answerHint: q.answerHint } : { ...base, kind: q.kind, options: q.options };
}

function correctAnswerText(q: ExamQuestion) {
  return q.kind === "O" ? q.accepted[0] : `${"ABCD"[q.correctIndex]}) ${q.options[q.correctIndex]}`;
}

export function gradeAttempt(params: {
  attemptId: string;
  examId: string;
  examTitle: string;
  questions: ExamQuestion[];
  answers: Record<string, AnswerValue>;
  startedAt: number;
  finishedAt: number;
  autoSubmitted: boolean;
}): ExamResult {
  const { questions, answers } = params;
  const byKind: ExamResult["byKind"] = { "Y-1": { correct: 0, total: 0 }, "Y-2": { correct: 0, total: 0 }, O: { correct: 0, total: 0 } };
  const sections = new Map<string, SectionScore>();

  const items = questions.map((q) => {
    const answer = answers[q.id] ?? null;
    const correct = isCorrect(q, answer);
    byKind[q.kind as QuestionKind].total++;
    if (correct) byKind[q.kind as QuestionKind].correct++;
    const s = sections.get(q.spec) ?? { spec: q.spec, label: sectionLabel(q.spec), correct: 0, total: 0 };
    s.total++;
    if (correct) s.correct++;
    sections.set(q.spec, s);
    return { question: toPublic(q), answer, correct, correctAnswer: correctAnswerText(q), explanation: q.explanation };
  });

  return {
    attemptId: params.attemptId,
    examId: params.examId,
    examTitle: params.examTitle,
    startedAt: new Date(params.startedAt).toISOString(),
    finishedAt: new Date(params.finishedAt).toISOString(),
    durationSeconds: Math.max(0, Math.round((params.finishedAt - params.startedAt) / 1000)),
    autoSubmitted: params.autoSubmitted,
    correct: items.filter((i) => i.correct).length,
    total: items.length,
    byKind,
    bySection: [...sections.values()].sort((a, b) => a.spec.localeCompare(b.spec)),
    items,
  };
}

/** Javoblarni tozalash: faqat shu urinish savollari, to'g'ri tipdagi va cheklangan uzunlikdagi qiymatlar */
export function sanitizeAnswers(raw: unknown, questions: ExamQuestion[]): Record<string, AnswerValue> {
  const out: Record<string, AnswerValue> = {};
  if (!raw || typeof raw !== "object") return out;
  const src = raw as Record<string, unknown>;
  for (const q of questions) {
    const v = src[q.id];
    if (q.kind === "O") {
      if (typeof v === "string") out[q.id] = v.slice(0, 200);
    } else if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 3) {
      out[q.id] = v;
    }
  }
  return out;
}
