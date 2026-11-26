import { NextResponse, type NextRequest } from "next/server";
import { exams } from "@/data/exams";
import { isAdmin } from "@/server/admin";
import { handle, jsonError } from "@/server/http";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

/** Barcha testlar: bazadagilar (har qanday holatda) + kod ichidagilar (faqat o'qish uchun) */
export const GET = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const store = await getStore();
  const dbTests = store ? await store.listTests({ publishedOnly: false }) : [];
  return NextResponse.json({ dbConfigured: Boolean(store), storeLabel: store?.label ?? null, dbTests, staticTests: exams });
});
