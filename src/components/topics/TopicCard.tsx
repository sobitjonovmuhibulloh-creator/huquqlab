"use client";

import Link from "next/link";
import { Check, Clock, Gamepad2 } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Pill } from "@/components/ui/misc";
import { categoryById } from "@/data/categories";
import { cn, difficultyLabel } from "@/lib/utils";
import type { Topic } from "@/types";

export function TopicCard({ topic, index = 0 }: { topic: Topic; index?: number }) {
  const { isTopicCompleted, toggleTopic, progress, hydrated } = useProgress();
  const completed = hydrated && isTopicCompleted(topic.id);
  const quiz = progress.quizResults[topic.id];
  const category = categoryById[topic.categoryId];

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
      className={cn(
        "card group relative flex flex-col p-5 transition-all duration-300 animate-fade-up hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/[0.06] dark:hover:border-white/15",
        completed && "ring-1 ring-emerald-500/30",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <CategoryIcon categoryId={topic.categoryId} />
        <button
          onClick={() => toggleTopic(topic.id)}
          className={cn(
            "relative z-10 flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition",
            completed
              ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
              : "border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600 dark:border-white/10 dark:text-slate-400",
          )}
          aria-pressed={completed}
          title={completed ? "Belgini olib tashlash" : "O‘rganildi deb belgilash"}
        >
          <Check className="h-3.5 w-3.5" />
          {completed ? "O‘rganildi" : "Belgilash"}
        </button>
      </div>

      <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">{category?.name}</p>
      <h3 className="mt-1 text-lg leading-snug font-bold text-slate-900 dark:text-white">
        <Link href={`/mavzular/${topic.slug}`} className="after:absolute after:inset-0 after:rounded-3xl focus:outline-none">
          {topic.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{topic.shortDescription}</p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <Pill>{topic.grades.length > 1 ? `${topic.grades[0]}–${topic.grades[topic.grades.length - 1]}-sinf` : `${topic.grades[0]}-sinf`}</Pill>
        <Pill>
          <Clock className="h-3 w-3" /> {topic.durationMinutes} daq
        </Pill>
        <Pill>{difficultyLabel[topic.difficulty]}</Pill>
        {topic.simulatorId && (
          <Pill className="bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
            <Gamepad2 className="h-3 w-3" /> Simulyator
          </Pill>
        )}
        {quiz && (
          <Pill className="bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">
            Test: {quiz.best}/{quiz.total}
          </Pill>
        )}
      </div>
    </article>
  );
}
