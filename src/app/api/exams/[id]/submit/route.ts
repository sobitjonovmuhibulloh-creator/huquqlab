import { NextResponse, type NextRequest } from "next/server";
import { gradeAttempt, sanitizeAnswers } from "@/lib/grading";
import { hasAccess, readAccess } from "@/server/access";
import { handle, jsonError, readBody } from "@/server/http";
import { getExam, getExamQuestions, recordAttempt } from "@/server/exam-repository";
import { verify } from "@/server/signing";
import type { AttemptToken } from "../start/route";

/** Tarmoq kechikishi uchun qo'shimcha vaqt */
const GRACE_MS = 2 * 60_000;

/** Javoblarni serverda baholash. To'g'ri javoblar faqat shu yerda (topshirilgandan keyin) qaytadi. */
export const POST = handle(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const exam = await getExam(id);
  const questions = exam && (await getExamQuestions(exam));
  if (!exam || !questions) return jsonError("Test topilmadi", 404);

  const body = await readBody(request);
  const token = verify<AttemptToken>(typeof body.attemptToken === "string" ? body.attemptToken : null);
  if (!token || token.examId !== id) return jsonError("Urinish tokeni yaroqsiz. Testni qaytadan boshlang.", 400);

  const state = readAccess(request);
  if (token.uid !== state.uid || !hasAccess(state, exam)) return jsonError("Bu urinish sizga tegishli emas", 403);

  const now = Date.now();
  const late = now > token.deadline + GRACE_MS;
  const result = gradeAttempt({
    attemptId: token.aid,
    examId: exam.id,
    examTitle: exam.title,
    questions,
    answers: sanitizeAnswers(body.answers, questions),
    startedAt: token.startedAt,
    finishedAt: Math.min(now, token.deadline),
    autoSubmitted: body.auto === true || late,
  });
  await recordAttempt(exam, state.uid, result);
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
});
