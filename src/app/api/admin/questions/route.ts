import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { UUID_RE } from "@/server/db";
import { handle, jsonError } from "@/server/http";
import { getStore } from "@/server/store";

export const dynamic = "force-dynamic";

/** Savollar banki: matn bo'yicha qidiruv (?q=), test bo'yicha filtr (?test=) */
export const GET = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const store = await getStore();
  if (!store) return NextResponse.json({ dbConfigured: false, questions: [] });
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  const test = request.nextUrl.searchParams.get("test") ?? "";
  return NextResponse.json({ dbConfigured: true, questions: await store.searchQuestions(q, UUID_RE.test(test) ? test : undefined) });
});
