import { NextResponse, type NextRequest } from "next/server";
import { productCovers, readAccess, writeAccess } from "@/server/access";
import { priceForExam, singlePrice } from "@/lib/market";
import { getExam } from "@/server/exam-repository";
import { handle, jsonError, readBody } from "@/server/http";
import { orderStore } from "@/server/orders";
import { getPaymentProvider } from "@/server/payments";
import { getPricing, getProduct } from "@/server/pricing-store";

/**
 * Checkout: buyurtma yaratadi va to'lov sahifasiga yo'naltiradi.
 * Narx har doim serverdagi pricing'dan olinadi — klient yuborgan summa ishlatilmaydi.
 */
export const POST = handle(async (request: NextRequest) => {
  const payment = getPaymentProvider();
  if (!payment.provider) return jsonError(payment.reason, 503);

  const body = await readBody(request);
  const product = await getProduct(String(body.productId));
  if (!product || !product.active) return jsonError("Mahsulot topilmadi", 404);

  let examId: string | undefined;
  let amount = product.price;
  if (product.kind === "single") {
    const exam = await getExam(String(body.examId));
    if (!exam || exam.access !== "premium" || exam.status !== "available") return jsonError("Sotib olinadigan test topilmadi", 404);
    if (!productCovers(product, exam)) return jsonError("Bu mahsulot tanlangan testga mos emas", 400);
    // Faqat shu test uchun belgilangan mahsulot (masalan, mock uchun «single-milliy»)
    if (singlePrice((await getPricing()).products, exam)?.id !== product.id) return jsonError("Bu test uchun boshqa narx belgilangan — sahifani yangilang", 409);
    examId = exam.id;
    amount = priceForExam(product, exam);
  }

  const hadCookie = request.cookies.has("huquqlab_access");
  const state = readAccess(request);
  if (examId && state.exams.includes(examId)) return jsonError("Bu test sizda allaqachon ochilgan", 409);

  const order = await orderStore.create({ uid: state.uid, productId: product.id, examId, amount, provider: payment.provider.id });
  const { redirectUrl } = await payment.provider.createPayment(order);

  const response = NextResponse.json({ orderId: order.id, redirectUrl });
  if (!hadCookie) writeAccess(response, state);
  return response;
});
