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

console.log(failed ? `\n${failed} ta tekshiruv muvaffaqiyatsiz` : "\nBarcha tekshiruvlar muvaffaqiyatli ✓");
process.exit(failed ? 1 : 0);
