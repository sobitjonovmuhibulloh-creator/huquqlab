import { XP_RULES } from "@/data/gamification";
import { getStreak, weeklyClaimCount } from "./gamification";
import type { ActivityEntry, Scenario, UserProgress } from "@/types";

export const emptyProgress = (): UserProgress => ({
  version: 1,
  xp: 0,
  completedTopics: [],
  quizResults: {},
  simulatorResults: {},
  badges: {},
  activity: [],
  claimedChallenges: [],
});

/** localStorage'dan kelgan ma'lumotni tekshirib, buzilgan bo'lsa tozalaydi */
export function sanitizeProgress(raw: unknown): UserProgress {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const p = raw as Partial<UserProgress>;
  return {
    version: 1,
    name: typeof p.name === "string" ? p.name.slice(0, 40) : undefined,
    xp: typeof p.xp === "number" && p.xp >= 0 ? p.xp : 0,
    completedTopics: Array.isArray(p.completedTopics) ? p.completedTopics.filter((x) => typeof x === "string") : [],
    quizResults: p.quizResults && typeof p.quizResults === "object" ? p.quizResults : {},
    simulatorResults: p.simulatorResults && typeof p.simulatorResults === "object" ? p.simulatorResults : {},
    badges: p.badges && typeof p.badges === "object" ? p.badges : {},
    activity: Array.isArray(p.activity) ? p.activity.slice(-500) : [],
    claimedChallenges: Array.isArray(p.claimedChallenges) ? p.claimedChallenges : [],
  };
}

export interface ProgressChange {
  next: UserProgress;
  xpGained: number;
  newBadges: string[];
}

const now = () => new Date().toISOString();

function withActivity(p: UserProgress, entry: Omit<ActivityEntry, "at">): UserProgress {
  return { ...p, activity: [...p.activity, { ...entry, at: now() }].slice(-500) };
}

export function completeTopic(p: UserProgress, topicId: string): Omit<ProgressChange, "newBadges"> {
  if (p.completedTopics.includes(topicId)) return { next: p, xpGained: 0 };
  const next = withActivity(
    { ...p, completedTopics: [...p.completedTopics, topicId], xp: p.xp + XP_RULES.topicComplete },
    { type: "topic", refId: topicId },
  );
  return { next, xpGained: XP_RULES.topicComplete };
}

export function uncompleteTopic(p: UserProgress, topicId: string): UserProgress {
  // XP qaytarib olinmaydi — o'quvchini jazolamaymiz, faqat belgini olib tashlaymiz
  return { ...p, completedTopics: p.completedTopics.filter((id) => id !== topicId) };
}

/** XP faqat eng yaxshi natija oshganda beriladi — bir testni qayta ishlab XP "farm" qilib bo'lmaydi */
export function recordQuiz(p: UserProgress, topicId: string, correct: number, total: number) {
  const prev = p.quizResults[topicId];
  const prevBest = prev?.best ?? 0;
  const xpGained = Math.max(0, correct - prevBest) * XP_RULES.quizPerCorrect;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const next = withActivity(
    {
      ...p,
      xp: p.xp + xpGained,
      quizResults: {
        ...p.quizResults,
        [topicId]: { best: Math.max(prevBest, correct), total, attempts: (prev?.attempts ?? 0) + 1, lastAt: now() },
      },
    },
    { type: "quiz", refId: topicId, value: percent },
  );
  return { next, xpGained };
}

export function recordSimulator(p: UserProgress, scenario: Scenario, score: number, maxScore: number, endingId?: string) {
  const prev = p.simulatorResults[scenario.id];
  const prevBest = prev ? Math.max(0, prev.bestScore) : 0;
  const improvement = Math.max(0, score - prevBest) * XP_RULES.simulatorMultiplier;
  const xpGained = improvement + (prev ? 0 : XP_RULES.simulatorFirstPlay);
  const endings = new Set(prev?.endings ?? []);
  if (endingId) endings.add(endingId);
  const next = withActivity(
    {
      ...p,
      xp: p.xp + xpGained,
      simulatorResults: {
        ...p.simulatorResults,
        [scenario.id]: {
          bestScore: prev ? Math.max(prev.bestScore, score) : score,
          maxScore,
          plays: (prev?.plays ?? 0) + 1,
          endings: [...endings],
          lastAt: now(),
        },
      },
    },
    { type: "simulator", refId: scenario.id, value: score },
  );
  return { next, xpGained };
}

/** Badge shartlarini tekshiradi va yangi olinganlarini qo'shadi */
export function evaluateBadges(p: UserProgress, scenarios: Scenario[]): { next: UserProgress; newBadges: string[] } {
  const earned: string[] = [];
  const has = (id: string) => Boolean(p.badges[id]);
  const check = (id: string, condition: boolean) => {
    if (condition && !has(id)) earned.push(id);
  };

  const quizzes = Object.values(p.quizResults);
  check("birinchi-qadam", p.completedTopics.length >= 1);
  check("bilimdon", p.completedTopics.length >= 5);
  check("mukammal-natija", quizzes.some((q) => q.total > 0 && q.best === q.total));
  check("test-ustasi", quizzes.filter((q) => q.total > 0 && q.best / q.total >= 0.8).length >= 5);
  check("huquq-ustasi", p.xp >= 500);
  check("haftalik-chempion", weeklyClaimCount(p) >= 1);
  check("izchil-oquvchi", getStreak(p).best >= 3);
  check("simulyator-ustasi", scenarios.length > 0 && scenarios.every((s) => p.simulatorResults[s.id]));

  for (const s of scenarios) {
    const endings = p.simulatorResults[s.id]?.endings ?? [];
    for (const reward of s.rewards) check(reward.badgeId, reward.endingIds.some((e) => endings.includes(e)));
  }

  if (earned.length === 0) return { next: p, newBadges: [] };
  const stamp = now();
  const badgesMap = { ...p.badges };
  for (const id of earned) badgesMap[id] = stamp;
  return { next: { ...p, badges: badgesMap }, newBadges: earned };
}
