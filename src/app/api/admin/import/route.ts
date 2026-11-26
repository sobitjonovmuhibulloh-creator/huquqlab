import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { isDbConfigured } from "@/server/store";
import { handle, jsonError } from "@/server/http";
import { commitImport, previewImport } from "@/server/test-import";

export const dynamic = "force-dynamic";

/**
 * Bulk import (faqat admin).
 *   action=preview — faylni o'qish, validatsiya, takrorlarni aniqlash; bazaga hech narsa yozilmaydi.
 *   action=commit  — o'sha faylni qayta tekshirib, xatosiz bo'lsa atomar import (import_tests).
 * Fayl har safar qayta tekshiriladi: preview'dan keyin baza o'zgargan bo'lsa ham xato o'tib ketmaydi.
 */
export const POST = handle(async (request: NextRequest) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Fayl yuborilmadi", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Fayl tanlanmagan", 400);

  const preview = await previewImport(file);
  if (form.get("action") !== "commit") return NextResponse.json({ ...preview, dbConfigured: isDbConfigured() });

  if (!preview.canImport) {
    return NextResponse.json({ ...preview, dbConfigured: isDbConfigured(), error: "Faylda xatolar bor — import bekor qilindi." }, { status: 400 });
  }
  const summary = await commitImport(preview, "admin");
  return NextResponse.json({ summary });
});
