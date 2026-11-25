"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Flame, Pencil, Target } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import { dailyMissionsState, getStreak } from "@/lib/gamification";
import { cn } from "@/lib/utils";

function greeting(hour: number) {
  if (hour < 5) return "Xayrli tun";
  if (hour < 12) return "Xayrli tong";
  if (hour < 18) return "Xayrli kun";
  return "Xayrli kech";
}

export function TodayPanel() {
  const { progress, claimDailyMission, setName } = useProgress();
  const { topics } = useContent();
  const [editingName, setEditingName] = useState(!progress.name);
  const [draft, setDraft] = useState(progress.name ?? "");

  const streak = getStreak(progress);
  const missions = dailyMissionsState(progress);
  const doneCount = missions.filter((m) => m.done).length;
  const next = topics.find((t) => !progress.completedTopics.includes(t.id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
      <section className="card p-6 sm:p-8">
        {editingName ? (
          <form
            className="flex flex-col gap-2 sm:flex-row sm:items-end"
            onSubmit={(e) => {
              e.preventDefault();
              setName(draft);
              setEditingName(false);
            }}
          >
            <div className="flex-1">
              <label htmlFor="user-name" className="label">
                Ismingiz (faqat shu brauzerda saqlanadi)
              </label>
              <input id="user-name" className="input" value={draft} maxLength={40} onChange={(e) => setDraft(e.target.value)} placeholder="Masalan, Aziza" />
            </div>
            <button type="submit" className="h-11 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white hover:bg-brand-800 dark:bg-brand-400 dark:text-navy-950">
              Saqlash
            </button>
          </form>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-2xl font-extrabold text-navy-900 sm:text-3xl dark:text-white">
              {greeting(new Date().getHours())}, {progress.name}!
            </h2>
            <button
              onClick={() => setEditingName(true)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-navy-500 hover:bg-navy-100 dark:hover:bg-white/10"
              aria-label="Ismni o‘zgartirish"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 dark:bg-amber-400/10">
            <Flame className={cn("h-7 w-7", streak.current > 0 ? "fill-amber-400 text-amber-500" : "text-navy-300")} />
            <div>
              <p className="font-display text-xl font-extrabold text-navy-900 tabular-nums dark:text-white">{streak.current} kun</p>
              <p className="text-xs text-navy-600 dark:text-navy-300">
                {streak.activeToday ? "Bugun faol bo‘ldingiz" : streak.current > 0 ? "Streakni saqlash uchun bugun biror ish qiling" : "Ketma-ket o‘qishni boshlang"}
                {streak.best > 1 && ` · rekord: ${streak.best}`}
              </p>
            </div>
          </div>
          {next ? (
            <Link
              href={`/mavzular/${next.slug}`}
              className="group flex min-w-[14rem] flex-1 items-center gap-3 rounded-2xl border border-navy-200 p-3 transition hover:border-brand-400 dark:border-white/10"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-brand-700 dark:text-brand-400">Davom ettirish</p>
                <p className="truncate font-semibold text-navy-900 dark:text-white">{next.title}</p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-navy-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          ) : (
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Barcha mavzular o‘rganilgan! 🎉</p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="flex items-center justify-between gap-2 text-lg font-extrabold text-navy-900 dark:text-white">
          <span className="flex items-center gap-2">
            <Target className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Kunlik vazifalar
          </span>
          <span className="text-sm font-semibold text-navy-500 tabular-nums">
            {doneCount}/{missions.length}
          </span>
        </h2>
        <ul className="mt-4 space-y-2">
          {missions.map(({ mission, done, claimed }) => (
            <li key={mission.id} className="flex items-center gap-3 rounded-2xl bg-navy-50 p-3 dark:bg-white/[0.03]">
              <span
                className={cn(
                  "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
                  done ? "border-emerald-600 bg-emerald-600 text-white" : "border-navy-300 dark:border-white/20",
                )}
              >
                {done && <Check className="h-4 w-4" />}
              </span>
              <span className={cn("flex-1 text-sm font-medium", done ? "text-navy-500 line-through dark:text-navy-400" : "text-navy-800 dark:text-navy-200")}>
                {mission.title}
              </span>
              {claimed ? (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">+{mission.rewardXp} XP ✓</span>
              ) : (
                <button
                  disabled={!done}
                  onClick={() => claimDailyMission(mission.id)}
                  className="rounded-lg bg-amber-300 px-2.5 py-1 text-xs font-bold text-navy-950 transition hover:bg-amber-200 disabled:bg-navy-200 disabled:text-navy-500 dark:disabled:bg-white/10 dark:disabled:text-navy-400"
                >
                  +{mission.rewardXp} XP
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
