import "server-only";
import type { ExamQuestion } from "@/types/exam";
import { diagnostika } from "./diagnostika";
import { milliyMock1 } from "./milliy-mock-1";
import { konstitutsiya1, nazariya1 } from "./topic-tests";

/**
 * Savollar bazasi: examId → savollar. Faqat server kodida import qilinadi
 * ("server-only" klient bundle'ga tushib qolishining oldini oladi).
 * Kelajakda: QuestionRepository (Prisma) bilan almashtiriladi — docs/ARCHITECTURE.md.
 */
export const questionBank: Record<string, ExamQuestion[]> = {
  diagnostika,
  "milliy-mock-1": milliyMock1,
  "nazariya-1": nazariya1,
  "konstitutsiya-1": konstitutsiya1,
};

export function getQuestions(examId: string): ExamQuestion[] | undefined {
  return questionBank[examId];
}
