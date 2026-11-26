/**
 * Supabase migratsiyasini haqiqiy PostgreSQL'da (PGlite, WASM) tekshiradi:
 * sxema, triggerlar, atomar import va RLS / huquqlar.
 * Ishga tushirish: npm run check:db
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};
async function rejects(fn: () => Promise<unknown>) {
  try {
    await fn();
    return "";
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

const db = new PGlite();

// Supabase muhitini taqlid qilish: rollar va auth.uid()
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema public, auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
`);

const dir = path.join(process.cwd(), "supabase", "migrations");
for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
  const err = await rejects(() => db.exec(readFileSync(path.join(dir, f), "utf8")));
  check(`Migratsiya qo‘llandi: ${f}`, !err, err);
}
// Supabase standart huquqlari: jadvallar anon/authenticated'ga ochiq, RLS cheklaydi
await db.exec(`
  grant select, insert, update, delete on all tables in schema public to anon, authenticated, service_role;
  revoke all on public.questions, public.question_options, public.import_batches from anon, authenticated;
  revoke insert, update, delete, truncate on public.tests, public.test_attempts, public.attempt_answers from anon, authenticated;
`);

const q = (text: string, type = "Y-1", correct = 0) => ({
  question_text: text,
  question_type: type,
  topic: "2.4",
  difficulty: "o'rta",
  explanation: "Izoh",
  source_title: "Konstitutsiya",
  source_url: "https://lex.uz/uz/docs/6445145",
  legal_article: null,
  normalized_text: text.toLowerCase(),
  options:
    type === "O"
      ? [{ label: "O1", text: "150", is_correct: true }]
      : ["A", "B", "C", "D"].map((l, i) => ({ label: l, text: `${l} variant`, is_correct: i === correct })),
});
const testPayload = (title: string, questions = [q("Birinchi savol"), q("Ikkinchi savol"), q("Deputatlar soni?", "O")]) => ({
  title,
  description: "Tavsif",
  category: "konstitutsiya",
  exam_type: "practice",
  grade_or_audience: ["abituriyent"],
  duration_minutes: 20,
  price: 15000,
  is_premium: true,
  difficulty: "o'rta",
  questions,
});
const importTests = (tests: unknown[]) =>
  db.query<{ r: { tests_created: number; questions_imported: number; test_ids: string[] } }>(
    `select public.import_tests($1::jsonb, 'fayl.xlsx', 'xlsx', 'admin') as r`,
    [JSON.stringify(tests)],
  );
const count = async (table: string) => (await db.query<{ n: number }>(`select count(*)::int as n from ${table}`)).rows[0].n;

// 1. Muvaffaqiyatli import
const ok = await importTests([testPayload("Konstitutsiya: sinov 1"), testPayload("Konstitutsiya: sinov 2", [q("Uchinchi savol")])]);
const r = ok.rows[0].r;
check("Import: 2 test, 4 savol yaratildi", r.tests_created === 2 && r.questions_imported === 4, JSON.stringify({ t: r.tests_created, q: r.questions_imported }));
const qc = await db.query<{ question_count: number; status: string }>(`select question_count, status from tests where title = 'Konstitutsiya: sinov 1'`);
check("Trigger: question_count = 3", qc.rows[0].question_count === 3);
check("Import qilingan test «draft» holatida", qc.rows[0].status === "draft");
check("Variantlar saqlandi (3×4 + 1 ochiq javob)", (await count("question_options")) === 13);
check("Import tarixi yozildi", (await count("import_batches")) === 1);

// 2. Atomarlik: band nom → hech narsa yozilmaydi
const before = { t: await count("tests"), q: await count("questions"), b: await count("import_batches") };
const e1 = await rejects(() => importTests([testPayload("Yangi test"), testPayload("konstitutsiya: SINOV 1 ")]));
const after = { t: await count("tests"), q: await count("questions"), b: await count("import_batches") };
check("Band nom (registrdan qat’i nazar) rad etiladi", e1.includes("mavjud"), e1.slice(0, 80));
check("Xatoda qisman import yo‘q (rollback)", JSON.stringify(before) === JSON.stringify(after), JSON.stringify(after));

// 3. Yopiq savolda 2 ta to'g'ri javob → rollback
const bad = q("Noto‘g‘ri savol");
bad.options[1].is_correct = true;
const e2 = await rejects(() => importTests([testPayload("Buzuq test", [q("Yaxshi savol"), bad])]));
check("Ikki to‘g‘ri javobli yopiq savol rad etiladi", e2.includes("bitta to"), e2.slice(0, 80));
check("…va bazaga hech narsa tushmadi", (await count("tests")) === before.t);

// 4. Bir testda takroriy savol → unique index
const e3 = await rejects(() => importTests([testPayload("Takror test", [q("Bir xil"), q("Bir xil")])]));
check("Test ichida takroriy savol rad etiladi", /duplicate|unique/i.test(e3), e3.slice(0, 60));

// 5. CHECK cheklovlari
const e4 = await rejects(() => importTests([{ ...testPayload("Noto‘g‘ri narx"), price: -5 }]));
check("Manfiy narx rad etiladi", e4.length > 0);
const e5 = await rejects(() => importTests([{ ...testPayload("Bepul pullik"), is_premium: false, price: 5000 }]));
check("Bepul testga narx qo‘yib bo‘lmaydi", e5.length > 0);

// 6. E'lon qilish
const e6 = await rejects(() => db.query(`insert into tests (title, category, duration_minutes, status) values ('Bo‘sh test', 'otm', 10, 'published')`));
check("Savollarsiz testni e’lon qilib bo‘lmaydi", e6.includes("Savollarsiz"));
await db.query(`update tests set status = 'published' where title = 'Konstitutsiya: sinov 1'`);

// 7. Takroriy savollarni topish
const dup = await db.query<{ test_title: string }>(`select * from public.find_duplicate_questions(array['birinchi savol', 'yo‘q savol'])`);
check("find_duplicate_questions bazadagi takrorni topadi", dup.rows.length === 1 && dup.rows[0].test_title === "Konstitutsiya: sinov 1");

// 8. RLS va huquqlar: anon
await db.exec(`set role anon`);
const anonTests = await db.query<{ title: string }>(`select title from tests`);
check("anon: faqat e’lon qilingan testni ko‘radi", anonTests.rows.length === 1 && anonTests.rows[0].title === "Konstitutsiya: sinov 1", String(anonTests.rows.length));
check("anon: savollarni o‘qiy olmaydi", (await rejects(() => db.query(`select * from questions`))).includes("permission denied"));
check("anon: javob variantlarini (is_correct) o‘qiy olmaydi", (await rejects(() => db.query(`select is_correct from question_options`))).includes("permission denied"));
check("anon: import tarixini o‘qiy olmaydi", (await rejects(() => db.query(`select * from import_batches`))).includes("permission denied"));
check("anon: import_tests() chaqira olmaydi", (await rejects(() => importTests([testPayload("Hujum")]))).includes("permission denied"));
check("anon: testni o‘zgartira olmaydi", (await rejects(() => db.query(`update tests set price = 0`))).includes("permission denied"));
await db.exec(`reset role`);

// 9. authenticated: faqat o'z urinishlari
const t1 = (await db.query<{ id: string }>(`select id from tests where title = 'Konstitutsiya: sinov 1'`)).rows[0].id;
const me = "11111111-1111-1111-1111-111111111111";
const other = "22222222-2222-2222-2222-222222222222";
await db.query(`insert into test_attempts (user_id, test_id, started_at, status) values ($1, $3, now(), 'submitted'), ($2, $3, now(), 'submitted')`, [me, other, t1]);
await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${me}', false);`);
const mine = await db.query<{ user_id: string }>(`select user_id from test_attempts`);
check("authenticated: faqat o‘z urinishini ko‘radi", mine.rows.length === 1 && mine.rows[0].user_id === me);
check("authenticated: savollar baribir yopiq", (await rejects(() => db.query(`select * from questions`))).includes("permission denied"));
await db.exec(`reset role`);

// 10. service_role: hammasini ko'radi (server shu rol bilan ishlaydi)
await db.exec(`set role service_role`);
check("service_role: savollarni o‘qiydi", (await db.query(`select id from questions`)).rows.length === 4);
await db.exec(`reset role`);

// 11. update_question: atomar tahrirlash
const qid = (await db.query<{ id: string }>(`select id from questions where question_text = 'Birinchi savol'`)).rows[0].id;
await db.query(`select public.update_question($1, $2::jsonb)`, [qid, JSON.stringify({ question_text: "Tahrirlangan savol", normalized_text: "tahrirlangan savol", options: ["A", "B", "C", "D"].map((l, i) => ({ label: l, text: `Yangi ${l}`, is_correct: i === 2 })) })]);
const edited = await db.query<{ question_text: string; correct: string }>(`select q.question_text, (select option_label from question_options where question_id = q.id and is_correct) as correct from questions q where q.id = $1`, [qid]);
check("update_question: matn va to‘g‘ri javob (C) yangilandi", edited.rows[0].question_text === "Tahrirlangan savol" && edited.rows[0].correct === "C");
const e7 = await rejects(() => db.query(`select public.update_question($1, $2::jsonb)`, [qid, JSON.stringify({ question_text: "Buzuq tahrir", options: [{ label: "A", text: "x", is_correct: true }, { label: "B", text: "y", is_correct: true }] })]));
const still = await db.query<{ question_text: string; n: number }>(`select q.question_text, (select count(*)::int from question_options where question_id = q.id) as n from questions q where q.id = $1`, [qid]);
check("update_question: noto‘g‘ri tahrir rad etiladi va hech narsa o‘zgarmaydi", e7.includes("bitta to") && still.rows[0].question_text === "Tahrirlangan savol" && still.rows[0].n === 4, e7.slice(0, 60));
await db.exec(`set role anon`);
check("anon: update_question() chaqira olmaydi", (await rejects(() => db.query(`select public.update_question($1, '{}'::jsonb)`, [qid]))).includes("permission denied"));
await db.exec(`reset role`);

// 12. Muallif (import_author migratsiyasi)
await importTests([{ ...testPayload("Muallifli test", [q("Muallif savoli")]), author: "X. Yusufjonov" }]);
const au = await db.query<{ author: string }>(`select author from tests where title = 'Muallifli test'`);
check("Import: test muallifi saqlanadi", au.rows[0]?.author === "X. Yusufjonov");
const def = await db.query<{ author: string }>(`select author from tests where title = 'Konstitutsiya: sinov 2'`);
check("Import: muallif berilmasa — «HuquqLab tahririyati»", def.rows[0]?.author === "HuquqLab tahririyati");
await db.exec(`set role anon`);
check("anon: muallif migratsiyasidan keyin ham import_tests() yopiq", (await rejects(() => importTests([testPayload("Hujum 2")]))).includes("permission denied"));
await db.exec(`reset role`);

console.log(failed ? `\n${failed} ta DB tekshiruvi muvaffaqiyatsiz` : "\nBarcha DB tekshiruvlari muvaffaqiyatli ✓");
process.exit(failed ? 1 : 0);
