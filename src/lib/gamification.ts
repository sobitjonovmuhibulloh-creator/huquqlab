import { LEVELS, weeklyChallenges } from "@/data/gamification";
import type { ActivityEntry, UserProgress, WeeklyChallenge } from "@/types";

export function getLevel(xp: number) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i++) if (xp >= LEVELS[i].min) index = i;
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return {
    level: index + 1,
    name: current.name,
    nextName: next?.name,
    xpToNext: next ? next.min - xp : 0,
    progress: Math.max(0, Math.min(1, progress)),
  };
}

/** ISO hafta kaliti, masalan "2026-W48" */
export function getWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function getCurrentChallenge(date = new Date()): WeeklyChallenge {
  const week = Number(getWeekKey(date).split("-W")[1]);
  return weeklyChallenges[week % weeklyChallenges.length];
}

export function challengeProgress(progress: UserProgress, challenge: WeeklyChallenge, date = new Date()) {
  const weekKey = getWeekKey(date);
  const relevant = progress.activity.filter(
    (a: ActivityEntry) =>
      a.type === challenge.type &&
      getWeekKey(new Date(a.at)) === weekKey &&
      (challenge.minValue === undefined || (a.value ?? 0) >= challenge.minValue),
  );
  // Har bir obyekt (mavzu/test/simulyator) faqat bir marta hisoblanadi
  const unique = new Set(relevant.map((a) => a.refId)).size;
  const claimKey = `${weekKey}:${challenge.id}`;
  return {
    current: Math.min(unique, challenge.target),
    target: challenge.target,
    done: unique >= challenge.target,
    claimed: progress.claimedChallenges.includes(claimKey),
    claimKey,
  };
}
