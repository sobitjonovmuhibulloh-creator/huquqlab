import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { handle, jsonError, readBody } from "@/server/http";
import { isDbConfigured } from "@/server/store";
import { commitImport, previewWorkbook, sanitizeWorkbook } from "@/server/test-import";

export const dynamic = "force-dynamic";

/**
 * Admin tahrirlagan ish kitobi (moslashtirish, standart qiymatlar, tuzatilgan qatorlar) — JSON.
 *   { workbook, commit: false } — qayta tekshirish va preview;
 *   { workbook, commit: true }  — serverda QAYTA tekshirib, xatosiz bo'lsa atomar import.
 */
export const POST = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const body = await readBody(request);
  const workbook = sanitizeWorkbook(body.workbook);
  if (!workbook) return jsonError("Ish kitobi noto‘g‘ri yoki juda katta", 400);
  const preview = await previewWorkbook(workbook);
  if (body.commit !== true) return NextResponse.json({ ...preview, dbConfigured: isDbConfigured() });
  if (!preview.canImport) return NextResponse.json({ ...preview, dbConfigured: isDbConfigured(), error: "Xatolar bor — import bekor qilindi." }, { status: 400 });
  return NextResponse.json({ summary: await commitImport(preview, "admin") });
});
