import { NextResponse } from "next/server";
import { toPublic } from "@/lib/grading";
import { handle, jsonError } from "@/server/http";
import { getExam, getExamQuestions } from "@/server/exam-repository";

/** Test preview: birinchi bir nechta savol — javob va izohlarsiz */
export const GET = handle(async (_request: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const exam = await getExam(id);
  const questions = exam && (await getExamQuestions(exam));
  if (!exam || exam.status !== "available" || !questions) return jsonError("Test topilmadi", 404);
  return NextResponse.json({
    questions: questions.slice(0, exam.previewCount).map(toPublic),
    total: questions.length,
  });
});
