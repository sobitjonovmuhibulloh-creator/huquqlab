import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/server/admin";
import { handle, jsonError } from "@/server/http";
import { isDbConfigured } from "@/server/store";
import { autoMappings, commitImport, previewImport, previewWorkbook, readUpload } from "@/server/test-import";

export const dynamic = "force-dynamic";

/**
 * Bulk import — fayl yuklash (faqat admin, multipart).
 *   action=parse   — faylni o'qib, varaqlar, avtomatik ustun moslashtirish va preview qaytaradi
 *                    (keyingi qadamlar JSON bilan /api/admin/import/workbook orqali);
 *   action=preview — faylni avtomatik moslashtirish bilan tekshirish;
 *   action=commit  — o'sha faylni qayta tekshirib, xatosiz bo'lsa atomar import.
 * Hech bir qadam admin tasdiqlamaguncha bazaga yozmaydi.
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
  const action = form.get("action");

  if (action === "parse") {
    const read = await readUpload(file);
    if ("error" in read) return jsonError(read.error.message, 400);
    const workbook = { fileName: file.name, format: read.format, sheets: read.sheets, mapping: autoMappings(read.sheets) };
    return NextResponse.json({ workbook, preview: await previewWorkbook(workbook), dbConfigured: isDbConfigured() });
  }

  const preview = await previewImport(file);
  if (action !== "commit") return NextResponse.json({ ...preview, dbConfigured: isDbConfigured() });
  if (!preview.canImport) {
    return NextResponse.json({ ...preview, dbConfigured: isDbConfigured(), error: "Faylda xatolar bor — import bekor qilindi." }, { status: 400 });
  }
  return NextResponse.json({ summary: await commitImport(preview, "admin") });
});
