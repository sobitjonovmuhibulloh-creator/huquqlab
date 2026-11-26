import { NextResponse, type NextRequest } from "next/server";
import { examCategoryLabel } from "@/data/exams";
import { isAdmin } from "@/server/admin";
import { DbError, UUID_RE } from "@/server/db";
import { handle, jsonError, readBody } from "@/server/http";
import { getStore, type DbTestRow, type TestPatch } from "@/server/store";

async function store() {
  const s = await getStore();
  if (!s) throw new DbError("Ma’lumotlar bazasi ulanmagan.", 503);
  return s;
}

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Admin preview: test + savollar + to'g'ri javoblar (faqat admin) */
export const GET = handle(async (request: NextRequest, { params }: Ctx) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Test topilmadi", 404);
  const s = await store();
  const test = await s.getTest(id, { publishedOnly: false });
  if (!test) return jsonError("Test topilmadi", 404);
  const questions = await s.getQuestions(id);
  return NextResponse.json({ test, questions });
});

/** Tahrirlash: nom, tavsif, holat (publish/unpublish), premium/bepul, narx, davomiylik, kategoriya, qiyinlik */
export const PATCH = handle(async (request: NextRequest, { params }: Ctx) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Test topilmadi", 404);
  const body = await readBody(request);
  const patch: TestPatch = {};

  if (body.title !== undefined) {
    const t = String(body.title).trim();
    if (t.length < 3 || t.length > 200) return jsonError("Nom 3–200 belgi bo‘lishi kerak", 400);
    patch.title = t;
  }
  if (body.description !== undefined) patch.description = String(body.description).slice(0, 1000);
  if (body.status !== undefined) {
    if (!["draft", "published", "archived"].includes(String(body.status))) return jsonError("Noto‘g‘ri holat", 400);
    patch.status = body.status as DbTestRow["status"];
  }
  if (body.is_premium !== undefined) patch.is_premium = Boolean(body.is_premium);
  if (body.price !== undefined) {
    if (body.price === null || body.price === "") patch.price = null;
    else {
      const p = Number(body.price);
      if (!Number.isInteger(p) || p < 0 || p > 10_000_000) return jsonError("Narx 0 – 10 000 000 oralig‘idagi butun son bo‘lishi kerak", 400);
      patch.price = p;
    }
  }
  if (patch.is_premium === false) patch.price = 0;
  if (body.duration_minutes !== undefined) {
    const d = Number(body.duration_minutes);
    if (!Number.isInteger(d) || d < 1 || d > 300) return jsonError("Davomiylik 1–300 daqiqa bo‘lishi kerak", 400);
    patch.duration_minutes = d;
  }
  if (body.category !== undefined) {
    if (!(String(body.category) in examCategoryLabel)) return jsonError("Noma’lum kategoriya", 400);
    patch.category = body.category as DbTestRow["category"];
  }
  if (body.difficulty !== undefined) {
    if (!["oson", "o'rta", "murakkab"].includes(String(body.difficulty))) return jsonError("Noto‘g‘ri qiyinlik", 400);
    patch.difficulty = body.difficulty as DbTestRow["difficulty"];
  }
  if (Object.keys(patch).length === 0) return jsonError("O‘zgarish yo‘q", 400);

  const test = await (await store()).updateTest(id, patch);
  if (!test) return jsonError("Test topilmadi", 404);
  return NextResponse.json(test);
});

/** O'chirish — faqat e'lon qilinmagan testlar (e'lon qilinganini avval nashrdan oling) */
export const DELETE = handle(async (request: NextRequest, { params }: Ctx) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Test topilmadi", 404);
  const s = await store();
  const test = await s.getTest(id, { publishedOnly: false });
  if (!test) return jsonError("Test topilmadi", 404);
  if (test.status === "published") return jsonError("E’lon qilingan testni o‘chirib bo‘lmaydi — avval nashrdan oling.", 409);
  await s.deleteTest(id);
  return NextResponse.json({ ok: true });
});
