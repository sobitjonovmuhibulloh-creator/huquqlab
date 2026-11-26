import { NextResponse, type NextRequest } from "next/server";
import { readAccess } from "@/server/access";
import { handle, jsonError, readBody } from "@/server/http";
import { orderStore } from "@/server/orders";
import { isMockPaymentsAllowed } from "@/server/payments";

/**
 * Mock to'lov natijasi — FAQAT development. Production'da 404 qaytaradi,
 * shuning uchun bu yo'l orqali hech qachon haqiqiy access ochilmaydi.
 */
export const POST = handle(async (request: NextRequest) => {
  if (!isMockPaymentsAllowed()) return jsonError("Topilmadi", 404);
  const body = await readBody(request);
  const order = await orderStore.get(String(body.orderId));
  if (!order || order.provider !== "mock" || order.uid !== readAccess(request).uid) return jsonError("Buyurtma topilmadi", 404);
  if (order.status !== "pending") return jsonError(`Buyurtma allaqachon yakunlangan: ${order.status}`, 409);
  const updated = await orderStore.setStatus(order.id, body.outcome === "paid" ? "paid" : "failed");
  return NextResponse.json({ status: updated?.status });
});
