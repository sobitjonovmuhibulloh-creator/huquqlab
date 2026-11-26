/**
 * Kontent va gamification mantiqini tekshiruvchi skript.
 * Ishga tushirish: npm run check
 */
import { scenarios } from "../src/data/simulators";
import { topics } from "../src/data/topics";
import { badges } from "../src/data/gamification";
import { getMaxScore, validateScenario } from "../src/lib/scenario";
import * as P from "../src/lib/progress";
import { challengeProgress, getCurrentChallenge, getLevel, getWeekKey } from "../src/lib/gamification";
import { DEFAULT_PRICING } from "../src/config/pricing";
import { documents } from "../src/data/documents";
import { exams, NATIONAL_FORMAT } from "../src/data/exams";
import { gradeAttempt, normalizeAnswer, sanitizeAnswers, toPublic } from "../src/lib/grading";
import { collectMistakes } from "../src/lib/exam-client";
import { productCovers } from "../src/lib/market";
import { isMockPaymentsAllowed } from "../src/server/payments";
import { validatePricing } from "../src/server/pricing-store";
import { questionBank } from "../src/server/questions";
import { ConfigError, sign, verify } from "../src/server/signing";
import type { AnswerValue, ExamQuestion } from "../src/types/exam";

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};

// Kontent
const slugs = new Set(topics.map((t) => t.slug));
check("Mavzu slug'lari takrorlanmaydi", slugs.size === topics.length);
for (const g of [7, 8, 9, 10, 11] as const) {
  const n = topics.filter((t) => t.grades.includes(g)).length;
  check(`${g}-sinf uchun kamida 3 mavzu`, n >= 3, `${n} ta`);
}
for (const t of topics) {
  const okQuiz = t.quiz.length >= 4 && t.quiz.every((q) => q.options.length === 4 && q.correctIndex >= 0 && q.correctIndex < 4);
  check(`«${t.title}» testi to‘g‘ri`, okQuiz, `${t.quiz.length} savol`);
  if (t.simulatorId) check(`«${t.title}» simulyatori mavjud`, scenarios.some((s) => s.id === t.simulatorId));
}

// Simulyatorlar
const badgeIds = new Set(badges.map((b) => b.id));
for (const s of scenarios) {
  const errors = validateScenario(s);
  check(`Ssenariy «${s.title}» grafi`, errors.length === 0, errors.join("; ") || `maks. ${getMaxScore(s)} ball`);
  for (const r of s.rewards) check(`«${s.title}» mukofot nishoni mavjud`, badgeIds.has(r.badgeId), r.badgeId);
  if (s.relatedTopicSlug) check(`«${s.title}» bog‘liq mavzusi mavjud`, slugs.has(s.relatedTopicSlug));
}
check("Hamyon simulyatori: 3 ta boshlang‘ich tanlov", scenarios[0].steps.start.choices.length === 3);
check("Hamyon maks. ball = 50", getMaxScore(scenarios[0]) === 50, String(getMaxScore(scenarios[0])));

// Progress mantiqi
let p = P.emptyProgress();
const r1 = P.completeTopic(p, topics[0].id);
check("Mavzu tugatilganda +50 XP", r1.xpGained === 50);
check("Qayta tugatish XP bermaydi", P.completeTopic(r1.next, topics[0].id).xpGained === 0);
p = r1.next;
const q1 = P.recordQuiz(p, topics[0].id, 2, 4);
const q2 = P.recordQuiz(q1.next, topics[0].id, 2, 4);
const q3 = P.recordQuiz(q2.next, topics[0].id, 4, 4);
check("Test: birinchi urinish 2×10 XP", q1.xpGained === 20);
check("Test: bir xil natija XP bermaydi", q2.xpGained === 0);
check("Test: natija oshsa faqat farq uchun XP", q3.xpGained === 20);
p = q3.next;
const wallet = scenarios[0];
const s1 = P.recordSimulator(p, wallet, 50, 50, "halol-tartibli");
check("Simulyator: 20 + 50×2 XP", s1.xpGained === 120, String(s1.xpGained));
const ev = P.evaluateBadges(s1.next, scenarios);
check("Nishonlar: birinchi-qadam, mukammal-natija, halol-qahramon", ["birinchi-qadam", "mukammal-natija", "halol-qahramon"].every((b) => ev.newBadges.includes(b)), ev.newBadges.join(", "));
check("Nishon ikki marta berilmaydi", P.evaluateBadges(ev.next, scenarios).newBadges.length === 0);
const neg = P.recordSimulator(P.emptyProgress(), wallet, -50, 50, "inkor");
check("Manfiy ball XP'ni kamaytirmaydi", neg.xpGained === 20 && neg.next.xp === 20);
check("Buzilgan localStorage xavfsiz tiklanadi", P.sanitizeProgress("garbage").xp === 0 && P.sanitizeProgress({ xp: -5 }).xp === 0);

// Daraja va challenge
check("0 XP — 1-daraja", getLevel(0).level === 1);
check("400 XP — 3-daraja", getLevel(400).level === 3);
check("Hafta kaliti formati", /^\d{4}-W\d{2}$/.test(getWeekKey(new Date("2026-11-24"))), getWeekKey(new Date("2026-11-24")));
const ch = getCurrentChallenge();
const cp = challengeProgress(ev.next, ch);
check("Challenge progressi hisoblanadi", cp.current >= 0 && cp.target === ch.target, `${ch.title}: ${cp.current}/${cp.target}`);

// ---------------- Test Market va imtihon ----------------
const allQuestions = Object.values(questionBank).flat();
check("Savol ID'lari butun bazada takrorlanmaydi", new Set(allQuestions.map((q) => q.id)).size === allQuestions.length, `${allQuestions.length} savol`);
const prompts = allQuestions.map((q) => normalizeAnswer(q.prompt));
check("Takroriy savol matni yo‘q", new Set(prompts).size === prompts.length);
for (const e of exams) {
  const bank = questionBank[e.id];
  if (e.status === "available") {
    check(`«${e.title}»: bazadagi savollar soni = ${e.questionCount}`, bank?.length === e.questionCount, String(bank?.length));
    check(`«${e.title}»: preview ≤ savollar`, e.previewCount <= (bank?.length ?? 0));
  } else {
    check(`«${e.title}» (tez orada) sotuvga chiqmagan`, !bank);
  }
}
const mock = questionBank["milliy-mock-1"];
for (const [kind, n] of Object.entries(NATIONAL_FORMAT.kinds)) {
  check(`Mock №1: ${kind} soni = ${n} (rasmiy spetsifikatsiya)`, mock.filter((q) => q.kind === kind).length === n);
}
check("Mock №1: tartib Y-1 → Y-2 → O", mock.every((q, i) => q.kind === (i < 32 ? "Y-1" : i < 35 ? "Y-2" : "O")));
const verifiedLex = new Set(documents.flatMap((d) => (d.lexId ? [d.lexId] : [])));
const failedBefore = failed;
for (const q of allQuestions) {
  if (q.kind === "O") {
    if (q.accepted.length === 0 || q.accepted.some((a) => !normalizeAnswer(a))) check(`${q.id}: qabul qilinadigan javoblar`, false);
  } else {
    const okOpts = q.options.every((o) => o.trim()) && new Set(q.options.map(normalizeAnswer)).size === 4 && q.correctIndex >= 0 && q.correctIndex <= 3;
    if (!okOpts) check(`${q.id}: 4 ta turli variant va to‘g‘ri indeks`, false);
    if (q.kind === "Y-2" && !q.context) check(`${q.id}: Y-2 vaziyat matni`, false);
  }
  if (!q.explanation.trim()) check(`${q.id}: izoh bor`, false);
  if (q.source.lexId && !verifiedLex.has(q.source.lexId)) check(`${q.id}: lex.uz ID tekshirilganlar ro‘yxatida`, false, q.source.lexId);
}
check("Barcha savollar tuzilmasi to‘g‘ri", failed === failedBefore);

const leak = JSON.stringify(allQuestions.map(toPublic));
check("Klientga javob kaliti va izoh chiqmaydi", !/"correctIndex"|"accepted"|"explanation"/.test(leak));

const answerOf = (q: ExamQuestion): AnswerValue => (q.kind === "O" ? `  ${q.accepted[0].toUpperCase()}. ` : q.correctIndex);
const grade = (answers: Record<string, AnswerValue>, auto = false) =>
  gradeAttempt({ attemptId: "t", examId: "milliy-mock-1", examTitle: "Mock", questions: mock, answers, startedAt: 0, finishedAt: 60_000, autoSubmitted: auto });
const perfect = grade(Object.fromEntries(mock.map((q) => [q.id, answerOf(q)])));
check("Baholash: hamma to‘g‘ri → 45/45 (registr va tinish belgilari e’tiborsiz)", perfect.correct === 45, `${perfect.correct}/45`);
check("Baholash: turlar bo‘yicha 32+3+10", perfect.byKind["Y-1"].total === 32 && perfect.byKind["Y-2"].total === 3 && perfect.byKind.O.total === 10);
check("Baholash: bo‘limlar yig‘indisi = 45", perfect.bySection.reduce((n, s) => n + s.total, 0) === 45);
check("Baholash: bo‘sh javoblar → 0", grade({}).correct === 0);
const junk = sanitizeAnswers({ "m1-01": 7, "m1-02": "1", "m1-36": 150, "m1-37": "x".repeat(500), boshqa: 1 }, mock);
check("Javoblar tozalanadi (noto‘g‘ri tip, uzunlik, begona ID)", Object.keys(junk).join() === "m1-37" && (junk["m1-37"] as string).length === 200);

const first = mock[0] as Extract<ExamQuestion, { correctIndex: number }>;
const wrongFirst = { ...grade({ [first.id]: first.correctIndex === 0 ? 1 : 0 }), finishedAt: "2026-11-01T00:00:00.000Z" };
const rightLater = { ...perfect, attemptId: "t2", finishedAt: "2026-12-01T00:00:00.000Z" };
check("Smart Review: keyin to‘g‘ri yechilgan savol xatolardan chiqadi", collectMistakes([rightLater, wrongFirst], {}).length === 0);
check("Smart Review: takroriy xato sanaladi", collectMistakes([wrongFirst, { ...wrongFirst, attemptId: "t3" }], {}).find((m) => m.item.question.id === first.id)?.wrongCount === 2);
check("Smart Review: o‘zlashtirilgan savol chiqmaydi", !collectMistakes([wrongFirst], { [first.id]: "x" }).some((m) => m.item.question.id === first.id));

// Narxlar, access va to'lov xavfsizligi
check("Standart narxlar validatsiyadan o‘tadi", validatePricing(DEFAULT_PRICING).ok);
check("Narx: 0 so‘m rad etiladi", !validatePricing({ products: [{ ...DEFAULT_PRICING.products[0], price: 0 }] }).ok);
check("Narx: noma’lum mahsulot rad etiladi", !validatePricing({ products: [{ ...DEFAULT_PRICING.products[0], id: "hack" }] }).ok);
const attest = DEFAULT_PRICING.products.find((p) => p.id === "attestatsiya-1")!;
check("Attestatsiya paketi mock testni ochmaydi", !productCovers(attest, { category: "milliy-sertifikat" }) && productCovers(attest, { category: "attestatsiya" }));
const token = sign({ a: 1 });
check("Imzo: to‘g‘ri token tekshiriladi", verify<{ a: number }>(token)?.a === 1);
check("Imzo: o‘zgartirilgan token rad etiladi", verify(`${sign({ a: 2 }).split(".")[0]}.${token.split(".")[1]}`) === null && verify(`${token.split(".")[0]}.xyz`) === null);
const env = process.env as Record<string, string | undefined>;
const savedEnv = { NODE_ENV: env.NODE_ENV, ACCESS_TOKEN_SECRET: env.ACCESS_TOKEN_SECRET };
env.NODE_ENV = "production";
check("Production: mock to‘lov o‘chiq", !isMockPaymentsAllowed());
delete env.ACCESS_TOKEN_SECRET;
let threw = false;
try {
  sign({});
} catch (e) {
  threw = e instanceof ConfigError;
}
check("Production: ACCESS_TOKEN_SECRET bo‘lmasa token yaratilmaydi", threw);
Object.assign(env, savedEnv);

console.log(failed ? `\n${failed} ta tekshiruv muvaffaqiyatsiz` : "\nBarcha tekshiruvlar muvaffaqiyatli ✓");
process.exit(failed ? 1 : 0);
