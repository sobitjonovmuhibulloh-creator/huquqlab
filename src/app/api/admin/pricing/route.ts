import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { handle, jsonError, readBody } from "@/server/http";
import { getPricing, savePricing, validatePricing } from "@/server/pricing-store";

export const dynamic = "force-dynamic";

export const GET = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  return NextResponse.json(await getPricing(), { headers: { "Cache-Control": "no-store" } });
});

export const PUT = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const result = validatePricing(await readBody(request));
  if (!result.ok) return jsonError(result.error, 400);
  try {
    await savePricing(result.value);
  } catch {
    return jsonError("Narxlarni saqlab bo‘lmadi: server fayl tizimi faqat o‘qish uchun (masalan, Vercel). Narxlarni saqlash uchun ma’lumotlar bazasi ulanishi kerak.", 501);
  }
  return NextResponse.json(result.value);
});
