import { NextResponse, type NextRequest } from "next/server";
import { productCovers, publicAccess, readAccess, writeAccess } from "@/server/access";
import { getExam } from "@/server/exam-repository";
import { handle, jsonError, readBody } from "@/server/http";
import { getProduct } from "@/server/pricing-store";

/** Paket kreditini sarflab premium testni ochish */
export const POST = handle(async (request: NextRequest) => {
  const body = await readBody(request);
  const exam = await getExam(String(body.examId));
  if (!exam || exam.status !== "available") return jsonError("Test topilmadi yoki hali tayyor emas", 404);
  if (exam.access === "free") return jsonError("Bu test bepul", 400);

  const state = readAccess(request);
  if (state.exams.includes(exam.id)) return NextResponse.json(publicAccess(state));

  // Mos keladigan kreditli paketlardan birinchisini ishlatamiz (avval tor kategoriyali paketlar)
  const candidates = await Promise.all(
    Object.entries(state.credits)
      .filter(([, n]) => n > 0)
      .map(async ([productId]) => ({ productId, product: await getProduct(productId) })),
  );
  const usable = candidates
    .filter((c) => c.product && productCovers(c.product, exam))
    .sort((a, b) => b.product!.categories.length - a.product!.categories.length)[0];
  if (!usable) return jsonError("Bu test uchun mos kredit yo‘q. Test yoki paket sotib oling.", 402);

  state.credits[usable.productId] -= 1;
  if (state.credits[usable.productId] <= 0) delete state.credits[usable.productId];
  state.exams.push(exam.id);

  const response = NextResponse.json(publicAccess(state));
  writeAccess(response, state);
  return response;
});
