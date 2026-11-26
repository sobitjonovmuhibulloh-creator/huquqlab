import { NextResponse, type NextRequest } from "next/server";
import { readAccess } from "@/server/access";
import { getExam } from "@/server/exam-repository";
import { handle, jsonError } from "@/server/http";
import { orderStore } from "@/server/orders";
import { isMockPaymentsAllowed } from "@/server/payments";
import { getProduct } from "@/server/pricing-store";

export const dynamic = "force-dynamic";

/** Buyurtma holati — faqat uni yaratgan brauzer ko'ra oladi */
export const GET = handle(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const order = await orderStore.get(id);
  if (!order || order.uid !== readAccess(request).uid) return jsonError("Buyurtma topilmadi", 404);
  const product = await getProduct(order.productId);
  const exam = order.examId ? await getExam(order.examId) : undefined;
  return NextResponse.json(
    {
      id: order.id,
      status: order.status,
      claimed: order.claimed,
      amount: order.amount,
      productTitle: product?.title ?? order.productId,
      credits: product?.credits ?? 1,
      exam: order.examId ? { id: order.examId, title: exam?.title } : null,
      createdAt: order.createdAt,
      mock: order.provider === "mock" && isMockPaymentsAllowed(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
