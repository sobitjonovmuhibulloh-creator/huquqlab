import "server-only";
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, unlinkSync, writeSync } from "node:fs";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import { DbError } from "../db";
import type { BankRow, DbQuestionRow, DbTestRow, ImportBatchRow, ImportResult, TestStore } from "./types";

/**
 * Lokal PostgreSQL (PGlite, WASM) — faqat development uchun.
 * Ma'lumotlar .data/pglite da (gitignore) — git'ga, Vercel'ga va brauzerga chiqmaydi.
 * supabase/migrations dagi aynan o'sha SQL qo'llanadi: cheklovlar, triggerlar va
 * import_tests() Supabase bilan bir xil ishlaydi.
 *
 * Bitta papkani ikki jarayon ochsa baza buziladi — shuning uchun lock fayl.
 */

const DIR = path.join(process.cwd(), ".data", "pglite");
const LOCK = path.join(process.cwd(), ".data", "pglite.lock");
const MIGRATIONS = path.join(process.cwd(), "supabase", "migrations");

const g = globalThis as typeof globalThis & { __huquqlabPglite?: Promise<PGlite> };

function acquireLock() {
  mkdirSync(path.dirname(LOCK), { recursive: true });
  if (existsSync(LOCK)) {
    const pid = Number(readFileSync(LOCK, "utf8"));
    let alive = false;
    try {
      if (pid && pid !== process.pid) {
        process.kill(pid, 0);
        alive = true;
      }
    } catch {
      alive = false;
    }
    if (alive) throw new DbError(`Lokal baza boshqa jarayonda (PID ${pid}) ochiq. Ikkinchi dev serverni to‘xtating.`, 503);
    unlinkSync(LOCK);
  }
  const fd = openSync(LOCK, "wx");
  writeSync(fd, String(process.pid));
  closeSync(fd);
  const release = () => {
    try {
      if (readFileSync(LOCK, "utf8") === String(process.pid)) unlinkSync(LOCK);
    } catch {
      /* e'tiborsiz */
    }
  };
  process.once("exit", release);
}

async function open(): Promise<PGlite> {
  acquireLock();
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(DIR);
  // Supabase muhitidagi rollar va auth.uid() — migratsiyadagi RLS siyosatlari shularni talab qiladi
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
    end $$;
    create schema if not exists auth;
    create or replace function auth.uid() returns uuid language sql stable as $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
    create table if not exists public._local_migrations (name text primary key, applied_at timestamptz not null default now());
  `);
  const applied = new Set((await db.query<{ name: string }>("select name from public._local_migrations")).rows.map((r) => r.name));
  for (const f of readdirSync(MIGRATIONS).filter((f) => f.endsWith(".sql")).sort()) {
    if (applied.has(f)) continue;
    await db.transaction(async (tx) => {
      await tx.exec(readFileSync(path.join(MIGRATIONS, f), "utf8"));
      await tx.query("insert into public._local_migrations (name) values ($1)", [f]);
    });
  }
  return db;
}

function getDb() {
  return (g.__huquqlabPglite ??= open().catch((e) => {
    g.__huquqlabPglite = undefined;
    throw e;
  }));
}

/** Postgres xatosini DbError'ga (HTTP holatini tanlash uchun kod bilan) */
async function run<T>(fn: (db: PGlite) => Promise<T>): Promise<T> {
  const db = await getDb();
  try {
    return await fn(db);
  } catch (e) {
    if (e instanceof DbError) throw e;
    const err = e as { message?: string; code?: string };
    throw new DbError(err.message ?? "Lokal baza xatosi", err.code === "23505" ? 409 : 400, err.code);
  }
}

/** PGlite timestamptz → Date qaytaradi; Supabase bilan bir xil bo'lishi uchun ISO satrga o'tkazamiz */
function plain<T>(row: Record<string, unknown>): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[k] = v instanceof Date ? v.toISOString() : v;
  return out as T;
}

const TEST_COLS =
  "id, title, description, category, exam_type, grade_or_audience, question_count, duration_minutes, price, is_premium, status, difficulty, author, import_batch_id, created_at, updated_at";

const PATCHABLE = new Set(["title", "description", "status", "is_premium", "price", "duration_minutes", "category", "difficulty"]);

export const localStore: TestStore = {
  kind: "local",
  label: "Lokal PostgreSQL (PGlite, .data/pglite)",

  listTests: ({ publishedOnly }) =>
    run(async (db) =>
      (await db.query<Record<string, unknown>>(`select ${TEST_COLS} from tests ${publishedOnly ? "where status = 'published'" : ""} order by created_at desc`)).rows.map((r) =>
        plain<DbTestRow>(r),
      ),
    ),

  getTest: (id, { publishedOnly }) =>
    run(async (db) => {
      const r = await db.query<Record<string, unknown>>(`select ${TEST_COLS} from tests where id = $1 ${publishedOnly ? "and status = 'published'" : ""}`, [id]);
      return r.rows[0] ? plain<DbTestRow>(r.rows[0]) : undefined;
    }),

  getQuestions: (testId) =>
    run(async (db) =>
      (
        await db.query<Record<string, unknown>>(
          `select q.id, q.test_id, q.question_text, q.question_type, q.topic, q.difficulty, q.explanation, q.source_title, q.source_url, q.legal_article, q.sort_order,
                  coalesce((select json_agg(json_build_object('id', o.id, 'option_label', o.option_label, 'option_text', o.option_text, 'is_correct', o.is_correct) order by o.option_label)
                            from question_options o where o.question_id = q.id), '[]'::json) as question_options
             from questions q where q.test_id = $1 order by q.sort_order`,
          [testId],
        )
      ).rows.map((r) => plain<DbQuestionRow>(r)),
    ),

  allTitles: () => run(async (db) => (await db.query<{ title: string }>("select title from tests")).rows.map((r) => r.title)),

  findDuplicates: (texts) =>
    run(async (db) => (await db.query<{ normalized_text: string; test_title: string }>("select * from public.find_duplicate_questions($1::text[])", [texts])).rows),

  importTests: ({ tests, fileName, format, importedBy, warnings }) =>
    run(async (db) => {
      const r = await db.query<{ r: ImportResult }>("select public.import_tests($1::jsonb, $2, $3, $4, $5::jsonb) as r", [
        JSON.stringify(tests),
        fileName,
        format,
        importedBy,
        JSON.stringify(warnings),
      ]);
      return r.rows[0].r;
    }),

  updateTest: (id, patch) =>
    run(async (db) => {
      const keys = Object.keys(patch).filter((k) => PATCHABLE.has(k));
      if (!keys.length) return undefined;
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
      const r = await db.query<Record<string, unknown>>(`update tests set ${sets} where id = $1 returning ${TEST_COLS}`, [
        id,
        ...keys.map((k) => (patch as Record<string, unknown>)[k]),
      ]);
      return r.rows[0] ? plain<DbTestRow>(r.rows[0]) : undefined;
    }),

  deleteTest: (id) => run(async (db) => void (await db.query("delete from tests where id = $1", [id]))),

  searchQuestions: (query, testId) =>
    run(async (db) =>
      (
        await db.query<Record<string, unknown>>(
          `select q.id, q.test_id, q.question_text, q.question_type, q.topic, q.difficulty, q.source_title, q.created_at,
                  json_build_object('title', t.title, 'status', t.status) as tests
             from questions q join tests t on t.id = q.test_id
            where ($1 = '' or q.question_text ilike '%' || $1 || '%') and ($2::uuid is null or q.test_id = $2::uuid)
            order by q.created_at desc, q.sort_order limit 100`,
          [query, testId ?? null],
        )
      ).rows.map((r) => plain<BankRow>(r)),
    ),

  updateQuestion: (id, patch) => run(async (db) => void (await db.query("select public.update_question($1, $2::jsonb)", [id, JSON.stringify(patch)]))),

  deleteQuestion: (id) => run(async (db) => void (await db.query("delete from questions where id = $1", [id]))),

  listImports: () =>
    run(async (db) =>
      (
        await db.query<Record<string, unknown>>(
          "select id, file_name, file_format, imported_by, tests_created, questions_imported, warnings, created_at from import_batches order by created_at desc limit 50",
        )
      ).rows.map((r) => plain<ImportBatchRow>(r)),
    ),

  recordAttempt: (a) =>
    run((db) =>
      db.transaction(async (tx) => {
        const attempt = await tx.query<{ id: string }>(
          "insert into test_attempts (user_id, test_id, started_at, finished_at, score, total, status) values ($1, $2, $3, $4, $5, $6, $7) returning id",
          [a.userId, a.testId, a.startedAt, a.finishedAt, a.score, a.total, a.status],
        );
        const opts = await tx.query<{ question_id: string; id: string }>(
          "select o.question_id, o.id from question_options o join questions q on q.id = o.question_id where q.test_id = $1 order by o.question_id, o.option_label",
          [a.testId],
        );
        const byQ = new Map<string, string[]>();
        for (const o of opts.rows) byQ.set(o.question_id, [...(byQ.get(o.question_id) ?? []), o.id]);
        for (const x of a.answers) {
          await tx.query("insert into attempt_answers (attempt_id, question_id, selected_option_id, answer_text, is_correct) values ($1, $2, $3, $4, $5)", [
            attempt.rows[0].id,
            x.questionId,
            x.optionIndex === null ? null : byQ.get(x.questionId)?.[x.optionIndex] ?? null,
            x.answerText,
            x.isCorrect,
          ]);
        }
      }),
    ),
};
