"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2, CircleSlash, Clock, ExternalLink, RotateCcw, Target, TimerOff, XCircle } from "lucide-react";
import { Chip } from "@/components/topics/TopicsExplorer";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, Pill, ProgressBar, Skeleton } from "@/components/ui/misc";
import { NATIONAL_FORMAT } from "@/data/exams";
import { formatDuration, loadResults, percent } from "@/lib/exam-client";
import { cn, formatDate } from "@/lib/utils";
import type { ExamResult, QuestionKind } from "@/types/exam";
import { kindLabel, QuestionBody } from "./QuestionBody";

type Filter = "all" | "wrong" | "correct" | "empty";

const WEAK = 60;

export function ResultView({ attemptId }: { attemptId: string }) {
  const [result, setResult] = useState<ExamResult | null | undefined>(undefined);
  const [filter, setFilter] = useState<Filter>("wrong");

  useEffect(() => setResult(loadResults().find((r) => r.attemptId === attemptId) ?? null), [attemptId]);

  const items = useMemo(() => {
    if (!result) return [];
    return result.items
      .map((item, i) => ({ item, n: i + 1 }))
      .filter(({ item }) => {
        const empty = item.answer === null || item.answer === "";
        if (filter === "wrong") return !item.correct && !empty;
        if (filter === "correct") return item.correct;
        if (filter === "empty") return empty;
        return true;
      });
  }, [result, filter]);

  if (result === undefined) {
    return (
      <div className="container-page space-y-4 py-10">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }
  if (result === null) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Natija topilmadi"
          description="Natijalar shu brauzerda saqlanadi. Boshqa qurilmada yoki brauzer ma’lumotlari tozalangan bo‘lsa, ular ko‘rinmaydi."
          action={<ButtonLink href="/testlar">Testlar katalogi</ButtonLink>}
        />
      </div>
    );
  }

  const pct = percent(result.correct, result.total);
  const empty = result.items.filter((i) => i.answer === null || i.answer === "").length;
  const weak = result.bySection.filter((s) => percent(s.correct, s.total) < WEAK);
  const isNational = result.total === NATIONAL_FORMAT.total;
  const counts = {
    all: result.total,
    wrong: result.total - result.correct - empty,
    correct: result.correct,
    empty,
  };

  return (
    <div className="pb-16">
      <section className="border-b border-navy-200/70 dark:border-white/[0.06]">
        <div className="container-page py-10">
          <Link href={`/testlar/${result.examId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-600 dark:text-navy-400">
            <ArrowLeft className="h-4 w-4" /> {result.examTitle}
          </Link>
          <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
            <ScoreRing pct={pct} />
            <div>
              <h1 className="text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">
                {result.correct} / {result.total} to‘g‘ri
              </h1>
              <p className="mt-2 text-navy-600 dark:text-navy-300">
                {formatDate(result.finishedAt)} · {pct >= 80 ? "A’lo natija — shu sur’atda davom eting." : pct >= WEAK ? "Yaxshi natija. Zaif bo‘limlarni takrorlang." : "Asosiy bo‘limlarni qayta ko‘rib chiqish tavsiya etiladi."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Pill>
                  <Clock className="h-3 w-3" /> {formatDuration(result.durationSeconds)}
                </Pill>
                <Pill>
                  <CircleSlash className="h-3 w-3" /> {empty} ta javobsiz
                </Pill>
                {result.autoSubmitted && (
                  <Pill className="bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
                    <TimerOff className="h-3 w-3" /> Vaqt tugab topshirildi
                  </Pill>
                )}
              </div>
              {isNational && (
                <p className="mt-4 max-w-2xl rounded-xl bg-navy-50 px-4 py-3 text-sm text-navy-600 dark:bg-white/[0.04] dark:text-navy-300">
                  Bu to‘g‘ri javoblar soni va foizi. Rasmiy milliy sertifikat bali {NATIONAL_FORMAT.scoring} asosida savollar qiyinligini hisobga olib hisoblanadi, shuning uchun bu natijani rasmiy ball yoki daraja (A+, B…) sifatida talqin qilmang.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <h2 className="font-bold text-navy-900 dark:text-white">Topshiriq turlari</h2>
            <div className="mt-4 space-y-3">
              {(Object.keys(result.byKind) as QuestionKind[])
                .filter((k) => result.byKind[k].total > 0)
                .map((k) => {
                  const s = result.byKind[k];
                  return (
                    <div key={k}>
                      <div className="flex justify-between text-sm">
                        <span className="text-navy-600 dark:text-navy-300">{kindLabel[k]}</span>
                        <span className="font-semibold tabular-nums text-navy-900 dark:text-white">
                          {s.correct}/{s.total}
                        </span>
                      </div>
                      <ProgressBar value={s.correct / s.total} className="mt-1.5 h-2" />
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
              <Target className="h-4 w-4" /> Bo‘limlar bo‘yicha
            </h2>
            <div className="mt-4 space-y-3">
              {result.bySection.map((s) => {
                const p = percent(s.correct, s.total);
                return (
                  <div key={s.spec}>
                    <div className="flex justify-between gap-3 text-sm">
                      <span className={cn("text-navy-600 dark:text-navy-300", p < WEAK && "font-semibold text-rose-700 dark:text-rose-300")}>
                        {s.spec} {s.label}
                      </span>
                      <span className="shrink-0 font-semibold tabular-nums text-navy-900 dark:text-white">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                    <ProgressBar value={s.correct / s.total} className="mt-1.5 h-2" barClassName={p < WEAK ? "from-rose-500 to-rose-400" : p >= 80 ? "from-emerald-500 to-emerald-400" : undefined} />
                  </div>
                );
              })}
            </div>
          </div>

          {weak.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-200">
              <p className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="h-4 w-4" /> Takrorlash tavsiya etiladi
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {weak.map((s) => (
                  <li key={s.spec}>{s.label}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <ButtonLink href="/testlar/xatolar">
              <RotateCcw className="h-4 w-4" /> Xatolar ustida ishlash
            </ButtonLink>
            <ButtonLink href={`/testlar/${result.examId}/yechish`} variant="secondary">
              Qayta topshirish
            </ButtonLink>
          </div>
        </aside>

        <section aria-labelledby="tahlil">
          <h2 id="tahlil" className="text-2xl font-bold text-navy-900 dark:text-white">
            Savollar tahlili
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(
              [
                ["wrong", "Xato"],
                ["empty", "Javobsiz"],
                ["correct", "To‘g‘ri"],
                ["all", "Hammasi"],
              ] as const
            ).map(([v, label]) => (
              <Chip key={v} active={filter === v} onClick={() => setFilter(v)}>
                {label} · {counts[v]}
              </Chip>
            ))}
          </div>

          {items.length === 0 ? (
            <p className="mt-6 text-navy-500 dark:text-navy-400">Bu toifada savol yo‘q.</p>
          ) : (
            <ol className="mt-6 space-y-4">
              {items.map(({ item, n }) => (
                <ReviewItem key={item.question.id} item={item} n={n} />
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}

export function ReviewItem({ item, n, extra }: { item: ExamResult["items"][number]; n?: number; extra?: React.ReactNode }) {
  const empty = item.answer === null || item.answer === "";
  const correctIndex = "options" in item.question ? "ABCD".indexOf(item.correctAnswer[0]) : undefined;
  const src = item.question.source;
  return (
    <li className="card p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {n !== undefined && <span className="font-display font-extrabold text-navy-900 dark:text-white">{n}-savol</span>}
        <Pill>{kindLabel[item.question.kind]}</Pill>
        {item.correct ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> To‘g‘ri
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-700 dark:text-rose-300">
            <XCircle className="h-4 w-4" /> {empty ? "Javob berilmagan" : "Xato"}
          </span>
        )}
        {extra}
      </div>
      <QuestionBody question={item.question} value={item.answer} readOnly reveal={{ correctIndex, correct: item.correct }} />
      {item.question.kind === "O" && !item.correct && (
        <p className="mt-3 text-sm text-navy-700 dark:text-navy-300">
          To‘g‘ri javob: <b>{item.correctAnswer}</b>
        </p>
      )}
      <div className="mt-4 rounded-xl bg-navy-50 p-4 text-sm leading-relaxed text-navy-700 dark:bg-white/[0.04] dark:text-navy-300">
        <p>{item.explanation}</p>
        <p className="mt-2 text-xs text-navy-500 dark:text-navy-400">
          Manba: {src.document}
          {src.article ? `, ${src.article}` : ""}
          {src.url && !src.lexId && (
            <a href={src.url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 font-semibold text-brand-700 hover:underline dark:text-brand-300">
              manba <ExternalLink className="h-3 w-3" />
            </a>
          )}
          {src.lexId && (
            <a href={`https://lex.uz/uz/docs/${src.lexId}`} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-0.5 font-semibold text-brand-700 hover:underline dark:text-brand-300">
              lex.uz <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </p>
      </div>
    </li>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = pct >= 80 ? "text-emerald-500" : pct >= WEAK ? "text-brand-500" : "text-rose-500";
  return (
    <div className="relative h-36 w-36" role="img" aria-label={`Natija ${pct} foiz`}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} strokeWidth="10" className="fill-none stroke-navy-100 dark:stroke-white/10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          className={cn("fill-none stroke-current transition-[stroke-dashoffset] duration-1000", color)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-3xl font-extrabold text-navy-900 dark:text-white">{pct}%</span>
    </div>
  );
}
