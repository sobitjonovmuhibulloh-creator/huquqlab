"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Shuffle, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EmptyState, ProgressBar } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";
import { Quiz } from "./Quiz";

const MIX_SIZE = 10;
export const MIX_QUIZ_ID = "tezkor-test";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TestsHub() {
  const { topics } = useContent();
  const { progress, hydrated } = useProgress();
  const [mix, setMix] = useState<QuizQuestion[] | null>(null);

  const withQuiz = topics.filter((t) => t.quiz.length > 0);

  function startMix() {
    const pool = withQuiz.flatMap((t) => t.quiz.map((q) => ({ ...q, id: `${t.id}-${q.id}` })));
    setMix(shuffle(pool).slice(0, MIX_SIZE));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (mix) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="mb-4 flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setMix(null)}>
            <X className="h-4 w-4" /> Testlar ro‘yxatiga qaytish
          </Button>
        </div>
        <Quiz quizId={MIX_QUIZ_ID} questions={mix} title="Tezkor aralash test" />
      </div>
    );
  }

  if (withQuiz.length === 0) {
    return <EmptyState title="Testlar hali yo‘q" description="O‘qituvchi panelidan savollar qo‘shing." />;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl shadow-emerald-500/20 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -bottom-16 text-[10rem] leading-none opacity-15">🎲</div>
        <p className="text-sm font-semibold text-white/80">Tezkor test</p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Barcha mavzulardan {MIX_SIZE} ta tasodifiy savol</h2>
        <p className="mt-2 max-w-lg text-white/85">Har safar yangi savollar to‘plami. Bilimingni umumiy tekshirib ko‘r.</p>
        {hydrated && progress.quizResults[MIX_QUIZ_ID] && (
          <p className="mt-2 text-sm font-semibold">
            Eng yaxshi natija: {progress.quizResults[MIX_QUIZ_ID].best}/{progress.quizResults[MIX_QUIZ_ID].total}
          </p>
        )}
        <button
          onClick={startMix}
          className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 font-bold text-emerald-700 transition hover:bg-white/90 active:scale-[0.98]"
        >
          <Shuffle className="h-4 w-4" /> Boshlash
        </button>
      </div>

      <h2 className="mt-12 text-xl font-extrabold text-slate-900 dark:text-white">Mavzular bo‘yicha testlar</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {withQuiz.map((t) => {
          const r = hydrated ? progress.quizResults[t.id] : undefined;
          const pct = r ? r.best / r.total : 0;
          return (
            <Link
              key={t.id}
              href={`/mavzular/${t.slug}#test`}
              className="card group flex items-center gap-4 p-4 transition hover:border-brand-300 hover:shadow-md dark:hover:border-brand-400/40"
            >
              <CategoryIcon categoryId={t.categoryId} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-white">{t.title}</p>
                <div className="mt-2 flex items-center gap-3">
                  <ProgressBar value={pct} className="h-1.5" barClassName={cn(pct >= 0.8 ? "from-emerald-500 to-teal-400" : undefined)} />
                  <span className="shrink-0 text-xs font-semibold text-slate-500 tabular-nums dark:text-slate-400">
                    {r ? `${r.best}/${r.total}` : `${t.quiz.length} savol`}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
