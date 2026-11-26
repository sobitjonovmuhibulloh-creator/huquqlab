import { NextResponse, type NextRequest } from "next/server";
import { publicAccess, readAccess, writeAccess } from "@/server/access";
import { handle, jsonError } from "@/server/http";
import { orderStore } from "@/server/orders";
import { getProduct } from "@/server/pricing-store";

/**
 * To'langan buyurtma bo'yicha access berish. Faqat:
 *  - buyurtma shu brauzerga tegishli bo'lsa,
 *  - status "paid" bo'lsa (provayder tasdiqlagan),
 *  - va hali berilmagan bo'lsa (markClaimed atomar belgilaydi).
 */
export const POST = handle(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const state = readAccess(request);
  const order = await orderStore.get(id);
  if (!order || order.uid !== state.uid) return jsonError("Buyurtma topilmadi", 404);
  if (order.status !== "paid") return jsonError("To‘lov hali tasdiqlanmagan", 409);
  if (!(await orderStore.markClaimed(id))) return NextResponse.json(publicAccess(state));

  const product = await getProduct(order.productId);
  if (order.examId) {
    if (!state.exams.includes(order.examId)) state.exams.push(order.examId);
  } else {
    state.credits[order.productId] = (state.credits[order.productId] ?? 0) + (product?.credits ?? 1);
  }
  state.purchases.push({ orderId: order.id, productId: order.productId, examId: order.examId, amount: order.amount, at: new Date().toISOString() });

  const response = NextResponse.json(publicAccess(state));
  writeAccess(response, state);
  return response;
});
