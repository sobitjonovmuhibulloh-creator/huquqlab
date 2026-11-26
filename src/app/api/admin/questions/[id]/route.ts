import { NextResponse, type NextRequest } from "next/server";
import { normalizeAnswer } from "@/lib/grading";
import { isAdmin } from "@/server/admin";
import { DbError, UUID_RE } from "@/server/db";
import { handle, jsonError, readBody } from "@/server/http";
import { getStore } from "@/server/store";

async function store() {
  const s = await getStore();
  if (!s) throw new DbError("Ma’lumotlar bazasi ulanmagan.", 503);
  return s;
}

type Ctx = { params: Promise<{ id: string }> };

/** Savolni tahrirlash (variantlar bilan) — update_question() bitta tranzaksiyada */
export const PATCH = handle(async (request: NextRequest, { params }: Ctx) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Savol topilmadi", 404);
  const body = await readBody(request);
  const patch: Record<string, unknown> = {};
  const str = (k: string, max: number) => {
    if (body[k] !== undefined) patch[k] = String(body[k] ?? "").trim().slice(0, max);
  };
  str("question_text", 4000);
  str("explanation", 4000);
  str("topic", 200);
  str("source_title", 300);
  str("source_url", 500);
  str("legal_article", 200);
  if (patch.question_text !== undefined) {
    if (!patch.question_text) return jsonError("Savol matni bo‘sh bo‘lmasligi kerak", 400);
    patch.normalized_text = normalizeAnswer(String(patch.question_text));
  }
  if (patch.source_url && !/^https?:\/\//i.test(String(patch.source_url))) return jsonError("Manba havolasi http(s):// bilan boshlanishi kerak", 400);
  if (body.difficulty !== undefined) {
    if (!["oson", "o'rta", "murakkab"].includes(String(body.difficulty))) return jsonError("Noto‘g‘ri qiyinlik", 400);
    patch.difficulty = body.difficulty;
  }
  if (body.options !== undefined) {
    if (!Array.isArray(body.options)) return jsonError("Variantlar ro‘yxati noto‘g‘ri", 400);
    patch.options = (body.options as { label?: unknown; text?: unknown; is_correct?: unknown }[]).map((o) => ({
      label: String(o.label ?? ""),
      text: String(o.text ?? "").trim().slice(0, 1000),
      is_correct: o.is_correct === true,
    }));
  }
  await (await store()).updateQuestion(id, patch);
  return NextResponse.json({ ok: true });
});

export const DELETE = handle(async (request: NextRequest, { params }: Ctx) => {
  if (!(await isAdmin(request))) return jsonError("Ruxsat yo‘q", 401);
  const { id } = await params;
  if (!UUID_RE.test(id)) return jsonError("Savol topilmadi", 404);
  await (await store()).deleteQuestion(id);
  return NextResponse.json({ ok: true });
});
