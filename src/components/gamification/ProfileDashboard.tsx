"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenCheck, Gamepad2, ListChecks, Lock, Medal, RotateCcw, Zap } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, ProgressBar, Skeleton } from "@/components/ui/misc";
import { badges } from "@/data/gamification";
import { getLevel } from "@/lib/gamification";
import { getMaxScore } from "@/lib/scenario";
import { cn, formatDate } from "@/lib/utils";
import { TodayPanel } from "./TodayPanel";
import { WeeklyChallengeCard } from "./WeeklyChallengeCard";

const activityLabel = { topic: "Mavzu o‘rganildi", quiz: "Test ishlandi", simulator: "Simulyator o‘ynaldi" } as const;

export function ProfileDashboard() {
  const { progress, hydrated, resetProgress } = useProgress();
  const { topics, scenarios } = useContent();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) {
    return (
      <div className="grid gap-5 lg:grid-cols-3" aria-busy="true">
        <Skeleton className="h-56 rounded-3xl lg:col-span-2" />
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl lg:col-span-3" />
      </div>
    );
  }

  const level = getLevel(progress.xp);
  const completed = topics.filter((t) => progress.completedTopics.includes(t.id));
  const quizzesTaken = Object.keys(progress.quizResults).length;
  const simsPlayed = Object.keys(progress.simulatorResults).length;
  const earnedCount = Object.keys(progress.badges).length;
  const recent = [...progress.activity].reverse().slice(0, 8);
  const titleFor = (type: string, refId: string) =>
    type === "simulator" ? scenarios.find((s) => s.id === refId)?.title : topics.find((t) => t.id === refId)?.title ?? (refId === "tezkor-test" ? "Tezkor test" : refId);

  const stats = [
    { icon: BookOpenCheck, label: "O‘rganilgan mavzular", value: `${completed.length}/${topics.length}`, color: "text-brand-600 bg-brand-100 dark:bg-brand-400/15 dark:text-brand-300" },
    { icon: ListChecks, label: "Ishlangan testlar", value: quizzesTaken, color: "text-emerald-700 bg-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-300" },
    { icon: Gamepad2, label: "Simulyatorlar", value: `${simsPlayed}/${scenarios.length}`, color: "text-navy-700 bg-navy-100 dark:bg-white/10 dark:text-navy-200" },
    { icon: Medal, label: "Nishonlar", value: `${earnedCount}/${badges.length}`, color: "text-amber-600 bg-amber-100 dark:bg-amber-400/15 dark:text-amber-300" },
  ];

  return (
    <div className="space-y-6">
      <TodayPanel />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
        {/* Daraja */}
        <div className="relative overflow-hidden rounded-3xl bg-brand-800 p-6 text-white shadow-xl shadow-brand-900/20 dark:bg-brand-900/70 dark:ring-1 dark:ring-white/10 sm:p-8">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20" />
          <div className="relative">
            <p className="text-sm font-semibold text-white/70">{level.level}-daraja</p>
            <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">{level.name}</h2>
            <p className="mt-6 flex items-end gap-2">
              <Zap className="mb-1.5 h-7 w-7 fill-amber-300 text-amber-300" />
              <span className="font-display text-5xl font-extrabold tabular-nums">{progress.xp}</span>
              <span className="mb-1.5 font-semibold text-white/70">XP</span>
            </p>
            <ProgressBar value={level.progress} className="mt-5 h-3 bg-white/20" barClassName="from-amber-300 to-yellow-200" label="Daraja progressi" />
            <p className="mt-2 text-sm text-white/75">
              {level.nextName ? `«${level.nextName}» darajasigacha ${level.xpToNext} XP qoldi` : "Eng yuqori darajaga yetding! 🎉"}
            </p>
          </div>
        </div>
        <WeeklyChallengeCard />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", s.color)}>
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 font-display text-2xl font-extrabold text-navy-900 tabular-nums dark:text-white">{s.value}</p>
            <p className="text-sm text-navy-500 dark:text-navy-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Nishonlar */}
      <section className="card p-6 sm:p-8">
        <h2 className="text-xl font-extrabold text-navy-900 dark:text-white">Nishonlar</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const earnedAt = progress.badges[b.id];
            return (
              <div
                key={b.id}
                className={cn(
                  "relative flex flex-col items-center rounded-2xl border p-4 text-center transition",
                  earnedAt
                    ? "border-amber-200 bg-gradient-to-b from-amber-50 to-white dark:border-amber-400/20 dark:from-amber-400/10 dark:to-transparent"
                    : "border-navy-200 bg-navy-50 dark:border-white/[0.06] dark:bg-white/[0.02]",
                )}
              >
                <span className={cn("text-4xl", !earnedAt && "opacity-30 grayscale")}>{b.emoji}</span>
                {!earnedAt && <Lock className="absolute top-3 right-3 h-3.5 w-3.5 text-navy-400" />}
                <p className="mt-2 text-sm font-bold text-navy-900 dark:text-white">{b.name}</p>
                <p className="mt-0.5 text-xs text-navy-500 dark:text-navy-400">{b.description}</p>
                {earnedAt && <p className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">{formatDate(earnedAt)}</p>}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        {/* O'tilgan mavzular */}
        <section className="card p-6">
          <h2 className="text-lg font-extrabold text-navy-900 dark:text-white">O‘tilgan mavzular</h2>
          {completed.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                title="Hali mavzu o‘rganilmagan"
                description="Birinchi mavzuni o‘rganib, «Birinchi qadam» nishonini ol."
                action={<ButtonLink href="/mavzular">Mavzularga o‘tish</ButtonLink>}
              />
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-navy-100 dark:divide-white/[0.06]">
              {completed.map((t) => {
                const q = progress.quizResults[t.id];
                return (
                  <li key={t.id}>
                    <Link href={`/mavzular/${t.slug}`} className="flex items-center justify-between gap-3 py-3 hover:text-brand-600">
                      <span className="font-medium text-navy-800 dark:text-navy-200">{t.title}</span>
                      <span className="shrink-0 text-xs font-semibold text-navy-500">{q ? `Test: ${q.best}/${q.total}` : "Test ishlanmagan"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Simulyator mukofotlari */}
        <section className="card p-6">
          <h2 className="text-lg font-extrabold text-navy-900 dark:text-white">Simulyator natijalari</h2>
          <ul className="mt-4 space-y-3">
            {scenarios.map((s) => {
              const r = progress.simulatorResults[s.id];
              const max = getMaxScore(s);
              const reward = s.rewards[0] && badges.find((b) => b.id === s.rewards[0].badgeId);
              return (
                <li key={s.id} className="flex items-center gap-3 rounded-2xl bg-navy-50 p-3 dark:bg-white/[0.03]">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-navy-900 dark:text-white">{s.title}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">
                      {r ? `Eng yaxshi: ${r.bestScore}/${max} · ${r.plays} marta · ${r.endings.length} ta yakun ochilgan` : "Hali o‘ynalmagan"}
                    </p>
                  </div>
                  {reward && (
                    <span title={reward.name} className={cn("text-xl", !progress.badges[reward.id] && "opacity-25 grayscale")}>
                      {reward.emoji}
                    </span>
                  )}
                  <ButtonLink href={`/simulyatorlar/${s.id}`} size="sm" variant="secondary">
                    {r ? "Qayta" : "O‘ynash"}
                  </ButtonLink>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* So'nggi faollik */}
      <section className="card p-6">
        <h2 className="text-lg font-extrabold text-navy-900 dark:text-white">So‘nggi faollik</h2>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-navy-500">Hozircha faollik yo‘q.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {recent.map((a, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-navy-700 dark:text-navy-300">
                  <span className="font-semibold">{activityLabel[a.type]}:</span> {titleFor(a.type, a.refId)}
                  {a.type === "quiz" && a.value !== undefined && ` (${a.value}%)`}
                </span>
                <span className="text-xs text-navy-400">{new Date(a.at).toLocaleString("uz-UZ")}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col items-center gap-3 pt-4">
        <p className="text-xs text-navy-500">Progress faqat shu brauzerda saqlanadi (localStorage).</p>
        {confirmReset ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm font-semibold text-rose-600">Barcha XP, nishon va natijalar o‘chadi. Ishonchingiz komilmi?</span>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetProgress();
                setConfirmReset(false);
              }}
            >
              Ha, tozalash
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
              Bekor qilish
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Progressni tozalash
          </Button>
        )}
      </div>
    </div>
  );
}
