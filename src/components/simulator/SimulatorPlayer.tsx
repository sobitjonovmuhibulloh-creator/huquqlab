"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, Gavel, HeartHandshake, RotateCcw, Sparkles, Trophy } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { LegalStatusBadge, ProgressBar } from "@/components/ui/misc";
import { badgeById } from "@/data/gamification";
import { getMaxScore } from "@/lib/scenario";
import { cn } from "@/lib/utils";
import type { OutcomeTone, Scenario, ScenarioChoice } from "@/types";

interface HistoryEntry {
  stepId: string;
  stepTitle: string;
  choice: ScenarioChoice;
}

const toneStyles: Record<OutcomeTone, { ring: string; bg: string; text: string; chip: string; label: string }> = {
  good: {
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-50 dark:bg-emerald-400/[0.07]",
    text: "text-emerald-700 dark:text-emerald-300",
    chip: "bg-emerald-600 text-white",
    label: "Yaxshi qaror",
  },
  neutral: {
    ring: "ring-amber-500/40",
    bg: "bg-amber-50 dark:bg-amber-400/[0.07]",
    text: "text-amber-700 dark:text-amber-300",
    chip: "bg-amber-500 text-white",
    label: "O‘ylab ko‘rish kerak",
  },
  bad: {
    ring: "ring-rose-500/40",
    bg: "bg-rose-50 dark:bg-rose-400/[0.07]",
    text: "text-rose-700 dark:text-rose-300",
    chip: "bg-rose-600 text-white",
    label: "Xavfli qaror",
  },
};

const letters = ["A", "B", "C", "D", "E"];

function getRating(score: number, max: number) {
  const pct = max > 0 ? score / max : 0;
  if (pct >= 0.9) return { stars: 3, title: "Ajoyib! Sen huquqiy va axloqiy jihatdan eng to‘g‘ri yo‘lni tanlading.", emoji: "🏆" };
  if (pct >= 0.5) return { stars: 2, title: "Yaxshi natija! Ba’zi qarorlarni yanada yaxshilash mumkin.", emoji: "👍" };
  if (pct > 0) return { stars: 1, title: "Boshlanish bor. Boshqa yo‘lni sinab ko‘r — natija o‘zgaradi.", emoji: "💡" };
  return { stars: 0, title: "Bu yo‘l jiddiy oqibatlarga olib keldi. Qayta o‘ynab, to‘g‘ri qarorni top.", emoji: "⚠️" };
}

export function SimulatorPlayer({ scenario }: { scenario: Scenario }) {
  const { progress, recordSimulator } = useProgress();
  const maxScore = useMemo(() => getMaxScore(scenario), [scenario]);

  const [stepId, setStepId] = useState(scenario.startStepId);
  const [selected, setSelected] = useState<ScenarioChoice | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [finished, setFinished] = useState<{ endingId?: string; xp: number; newBadge?: string } | null>(null);
  const [round, setRound] = useState(0);

  const step = scenario.steps[stepId];
  const score = history.reduce((sum, h) => sum + h.choice.outcome.points, 0) + (selected?.outcome.points ?? 0);

  if (!step) {
    return (
      <div className="card p-8 text-center">
        <p className="font-semibold text-rose-600">Ssenariyda xatolik: «{stepId}» qadami topilmadi.</p>
        <Button className="mt-4" onClick={() => restart()}>
          Qaytadan boshlash
        </Button>
      </div>
    );
  }

  function choose(choice: ScenarioChoice) {
    if (selected) return;
    setSelected(choice);
  }

  function next() {
    if (!selected) return;
    const entry: HistoryEntry = { stepId: step.id, stepTitle: step.title, choice: selected };
    const nextHistory = [...history, entry];
    setHistory(nextHistory);
    setSelected(null);

    const nextStepId = selected.outcome.nextStepId;
    if (nextStepId && scenario.steps[nextStepId]) {
      setStepId(nextStepId);
      return;
    }
    const finalScore = nextHistory.reduce((s, h) => s + h.choice.outcome.points, 0);
    const endingId = selected.outcome.endingId;
    const rewardBadge = scenario.rewards.find((r) => endingId && r.endingIds.includes(endingId))?.badgeId;
    const isNewBadge = rewardBadge && !progress.badges[rewardBadge] ? rewardBadge : undefined;
    const xp = recordSimulator(scenario, finalScore, maxScore, endingId);
    setFinished({ endingId, xp, newBadge: isNewBadge });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setStepId(scenario.startStepId);
    setSelected(null);
    setHistory([]);
    setFinished(null);
    setRound((r) => r + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------------- Yakuniy ekran ---------------- */
  if (finished) {
    const finalScore = history.reduce((s, h) => s + h.choice.outcome.points, 0);
    const rating = getRating(finalScore, maxScore);
    const badge = finished.newBadge ? badgeById[finished.newBadge] : undefined;
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="card relative overflow-hidden p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent" />
          <div className="relative">
            <div className="text-6xl animate-pop">{rating.emoji}</div>
            <div className="mt-4 flex justify-center gap-1.5" aria-label={`${rating.stars} yulduz`}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{ animationDelay: `${200 + i * 150}ms` }}
                  className={cn("animate-pop text-3xl", i < rating.stars ? "" : "opacity-20 grayscale")}
                >
                  ⭐
                </span>
              ))}
            </div>
            <h2 className="mt-4 text-2xl font-extrabold text-navy-900 sm:text-3xl dark:text-white">Simulyator yakunlandi</h2>
            <p className="mx-auto mt-2 max-w-lg text-navy-600 dark:text-navy-300">{rating.title}</p>

            <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3">
              <Stat label="Ball" value={`${finalScore}/${maxScore}`} />
              <Stat label="Qarorlar" value={String(history.length)} />
              <Stat label="XP" value={finished.xp > 0 ? `+${finished.xp}` : "0"} highlight={finished.xp > 0} />
            </div>
            {finished.xp === 0 && (
              <p className="mt-3 text-xs text-navy-500 dark:text-navy-400">
                XP faqat eng yaxshi natijangizni yangilaganingizda beriladi.
              </p>
            )}

            {badge && (
              <div className="mx-auto mt-6 flex max-w-md items-center gap-4 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-left animate-pop dark:border-brand-400/20 dark:bg-brand-400/10">
                <span className="text-4xl">{badge.emoji}</span>
                <div>
                  <p className="text-xs font-bold tracking-wide text-brand-600 uppercase dark:text-brand-300">Yangi nishon!</p>
                  <p className="font-bold text-navy-900 dark:text-white">{badge.name}</p>
                  <p className="text-sm text-navy-600 dark:text-navy-300">{badge.description}</p>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button onClick={restart} size="lg">
                <RotateCcw className="h-5 w-5" /> Qayta o‘ynash
              </Button>
              {scenario.relatedTopicSlug && (
                <ButtonLink href={`/mavzular/${scenario.relatedTopicSlug}`} variant="secondary" size="lg">
                  <BookOpen className="h-5 w-5" /> Mavzuni o‘rganish
                </ButtonLink>
              )}
              <ButtonLink href="/simulyatorlar" variant="ghost" size="lg">
                Boshqa simulyatorlar
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <h3 className="text-lg font-bold text-navy-900 dark:text-white">Sening yo‘ling</h3>
          <ol className="mt-5 space-y-4">
            {history.map((h, i) => {
              const tone = toneStyles[h.choice.outcome.tone];
              return (
                <li key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn("grid h-8 w-8 place-items-center rounded-full text-sm font-bold", tone.chip)}>{i + 1}</span>
                    {i < history.length - 1 && <span className="mt-1 w-px flex-1 bg-navy-200 dark:bg-white/10" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">{h.stepTitle}</p>
                    <p className="font-semibold text-navy-900 dark:text-white">{h.choice.label}</p>
                    <p className={cn("mt-0.5 text-sm font-medium", tone.text)}>
                      {h.choice.outcome.title} · {h.choice.outcome.points > 0 ? "+" : ""}
                      {h.choice.outcome.points} ball
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    );
  }

  /* ---------------- O'yin jarayoni ---------------- */
  const stepNumber = history.length + 1;
  const tone = selected ? toneStyles[selected.outcome.tone] : null;

  return (
    <div key={round} className="space-y-5">
      {/* Holat paneli */}
      <div className="card flex flex-wrap items-center gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-100 text-2xl dark:bg-white/5">{scenario.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">{stepNumber}-qaror</p>
            <p className="font-bold text-navy-900 dark:text-white">{step.title}</p>
          </div>
        </div>
        <div className="ml-auto flex min-w-[180px] flex-1 items-center gap-3 sm:max-w-xs">
          <ProgressBar
            value={maxScore > 0 ? Math.max(0, score) / maxScore : 0}
            label="Ball"
            barClassName={score < 0 ? "from-rose-500 to-rose-400" : undefined}
          />
          <span
            className={cn(
              "min-w-[64px] text-right text-sm font-bold tabular-nums",
              score < 0 ? "text-rose-600 dark:text-rose-400" : "text-navy-900 dark:text-white",
            )}
          >
            {score} / {maxScore}
          </span>
        </div>
      </div>

      {/* Vaziyat */}
      <div key={stepId} className="card relative overflow-hidden p-6 animate-fade-up sm:p-8">
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
        <p className="eyebrow">
          <Sparkles className="h-3.5 w-3.5" /> Vaziyat
        </p>
        <p className="relative mt-4 text-lg leading-relaxed text-navy-700 sm:text-xl dark:text-navy-200">{step.narrative}</p>
      </div>

      {/* Tanlovlar */}
      <div className="grid gap-3" role="group" aria-label="Tanlovlar">
        {step.choices.map((choice, i) => {
          const isSelected = selected?.id === choice.id;
          const dimmed = selected && !isSelected;
          const t = toneStyles[choice.outcome.tone];
          return (
            <button
              key={choice.id}
              onClick={() => choose(choice)}
              disabled={Boolean(selected)}
              style={{ animationDelay: `${100 + i * 70}ms` }}
              className={cn(
                "group card animate-fade-up flex w-full items-start gap-4 p-4 text-left transition-all duration-300 sm:p-5",
                !selected && "hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 dark:hover:border-brand-400/40",
                isSelected && cn("ring-2", t.ring, t.bg),
                dimmed && "opacity-45",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-extrabold transition",
                  isSelected ? t.chip : "bg-navy-100 text-navy-600 group-hover:bg-brand-600 group-hover:text-white dark:bg-white/5 dark:text-navy-300",
                )}
              >
                {letters[i]}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-navy-900 dark:text-white">{choice.label}</span>
                {choice.hint && <span className="mt-0.5 block text-sm text-navy-500 dark:text-navy-400">{choice.hint}</span>}
              </span>
              {isSelected && (
                <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-sm font-bold tabular-nums animate-pop", t.chip)}>
                  {choice.outcome.points > 0 ? "+" : ""}
                  {choice.outcome.points}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Natija */}
      {selected && tone && (
        <div className={cn("card overflow-hidden ring-2 animate-fade-up", tone.ring)}>
          <div className={cn("p-6 sm:p-8", tone.bg)}>
            <span className={cn("inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide", tone.chip)}>{tone.label}</span>
            <h3 className="mt-3 text-xl font-extrabold text-navy-900 sm:text-2xl dark:text-white">{selected.outcome.title}</h3>
            <p className="mt-2 leading-relaxed text-navy-700 dark:text-navy-200">{selected.outcome.description}</p>
          </div>
          <div className="grid gap-px bg-navy-200/70 sm:grid-cols-2 dark:bg-white/[0.06]">
            <div className="bg-white p-5 sm:p-6 dark:bg-navy-900">
              <div className="flex flex-wrap items-center gap-2">
                <p className="flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-300">
                  <Gavel className="h-4 w-4" /> Huquqiy izoh
                </p>
                {selected.outcome.legalStatus === "needs_verification" && <LegalStatusBadge status="needs_verification" />}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">{selected.outcome.legalNote}</p>
            </div>
            <div className="bg-white p-5 sm:p-6 dark:bg-navy-900">
              <p className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-300">
                <HeartHandshake className="h-4 w-4" /> Axloqiy izoh
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-600 dark:text-navy-300">{selected.outcome.ethicsNote}</p>
            </div>
          </div>
          <div className="flex justify-end bg-white p-4 sm:p-5 dark:bg-navy-900">
            <Button onClick={next} size="lg" className="w-full sm:w-auto" autoFocus>
              {selected.outcome.nextStepId ? (
                <>
                  Davom etish <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Natijani ko‘rish <Trophy className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {!selected && history.length > 0 && (
        <div className="flex justify-center">
          <button onClick={restart} className="flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-navy-800 dark:hover:text-white">
            <RotateCcw className="h-4 w-4" /> Boshidan boshlash
          </button>
        </div>
      )}
      <p className="text-center text-xs text-navy-400">
        Ssenariy ta’limiy maqsadda. <Link href="/haqida" className="underline">Huquqiy aniqlik haqida</Link>
      </p>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        highlight
          ? "border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10"
          : "border-navy-200 bg-navy-50 dark:border-white/10 dark:bg-white/5",
      )}
    >
      <p className="text-2xl font-extrabold text-navy-900 tabular-nums dark:text-white">{value}</p>
      <p className="text-xs font-medium text-navy-500 dark:text-navy-400">{label}</p>
    </div>
  );
}
