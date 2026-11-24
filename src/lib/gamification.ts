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

/* ---------------- Streak va kunlik vazifalar ---------------- */

/** Foydalanuvchining mahalliy vaqti bo'yicha sana kaliti: "2026-11-24" */
export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Ketma-ket faol kunlar. Bugun hali faollik bo'lmasa, kechagi streak saqlanib turadi. */
export function getStreak(progress: UserProgress, today = new Date()) {
  const days = new Set(progress.activity.map((a) => localDateKey(new Date(a.at))));
  const activeToday = days.has(localDateKey(today));
  const cursor = new Date(today);
  if (!activeToday) cursor.setDate(cursor.getDate() - 1);
  let current = 0;
  while (days.has(localDateKey(cursor))) {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }
  // Eng uzun streak
  const sorted = [...days].sort();
  let best = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const key of sorted) {
    const d = new Date(`${key}T00:00:00`);
    run = prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  return { current, best, activeToday };
}

export interface DailyMission {
  id: string;
  title: string;
  type: ActivityEntry["type"];
  minValue?: number;
  rewardXp: number;
}

export const dailyMissions: DailyMission[] = [
  { id: "d-topic", title: "1 ta mavzuni o‘rganib chiq", type: "topic", rewardXp: 20 },
  { id: "d-quiz", title: "1 ta testdan kamida 75% ol", type: "quiz", minValue: 75, rewardXp: 20 },
  { id: "d-sim", title: "1 ta simulyatorni yakunla", type: "simulator", rewardXp: 20 },
];

export function dailyMissionsState(progress: UserProgress, date = new Date()) {
  const today = localDateKey(date);
  return dailyMissions.map((mission) => {
    const done = progress.activity.some(
      (a) => a.type === mission.type && localDateKey(new Date(a.at)) === today && (mission.minValue === undefined || (a.value ?? 0) >= mission.minValue),
    );
    const claimKey = `daily:${today}:${mission.id}`;
    return { mission, done, claimed: progress.claimedChallenges.includes(claimKey), claimKey };
  });
}

/** Haftalik (kunlik emas) olingan mukofotlar soni */
export const weeklyClaimCount = (progress: UserProgress) => progress.claimedChallenges.filter((k) => !k.startsWith("daily:")).length;
