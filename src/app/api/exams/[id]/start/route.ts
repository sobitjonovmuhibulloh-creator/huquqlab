import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { toPublic } from "@/lib/grading";
import { hasAccess, readAccess, writeAccess } from "@/server/access";
import { handle, jsonError } from "@/server/http";
import { getExam, getExamQuestions } from "@/server/exam-repository";
import { sign } from "@/server/signing";

export interface AttemptToken {
  aid: string;
  examId: string;
  uid: string;
  startedAt: number;
  deadline: number;
}

/** Urinishni boshlash: access tekshiriladi, savollar javobsiz qaytadi, vaqt serverda belgilanadi */
export const POST = handle(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const exam = await getExam(id);
  const questions = exam && (await getExamQuestions(exam));
  if (!exam || exam.status !== "available" || !questions) return jsonError("Test topilmadi yoki hali tayyor emas", 404);

  const hadCookie = request.cookies.has("huquqlab_access");
  const state = readAccess(request);
  if (!hasAccess(state, exam)) return jsonError("Bu premium test. Uni ochish uchun sotib oling yoki paket kreditidan foydalaning.", 402);

  const now = Date.now();
  const token: AttemptToken = { aid: randomUUID(), examId: exam.id, uid: state.uid, startedAt: now, deadline: now + exam.durationMinutes * 60_000 };

  const response = NextResponse.json(
    { attemptToken: sign(token), attemptId: token.aid, startedAt: now, deadline: token.deadline, serverNow: now, questions: questions.map(toPublic) },
    { headers: { "Cache-Control": "no-store" } },
  );
  // Birinchi tashrifda uid'ni saqlaymiz — aks holda submit'da urinish egasini tekshirib bo'lmaydi
  if (!hadCookie) writeAccess(response, state);
  return response;
});
