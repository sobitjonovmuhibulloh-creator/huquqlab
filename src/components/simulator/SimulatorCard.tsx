"use client";

import Link from "next/link";
import { ArrowRight, Clock, GitBranch, Trophy } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Pill } from "@/components/ui/misc";
import { categoryById } from "@/data/categories";
import { countEndings, countSteps, getMaxScore } from "@/lib/scenario";
import type { Scenario } from "@/types";

const gradients = ["from-navy-800 to-brand-800", "from-brand-700 to-navy-900", "from-navy-900 to-navy-700"];

export function SimulatorCard({ scenario, index = 0 }: { scenario: Scenario; index?: number }) {
  const { progress, hydrated } = useProgress();
  const result = hydrated ? progress.simulatorResults[scenario.id] : undefined;
  const max = getMaxScore(scenario);

  return (
    <Link
      href={`/simulyatorlar/${scenario.id}`}
      style={{ animationDelay: `${index * 80}ms` }}
      className="card group flex flex-col overflow-hidden transition-all duration-300 animate-fade-up hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${gradients[index % gradients.length]}`}>
        <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(circle,black,transparent)]" />
        <span className="relative text-7xl drop-shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-6deg]">
          {scenario.emoji}
        </span>
        {result && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-navy-900 backdrop-blur">
            <Trophy className="h-3.5 w-3.5 text-amber-500" /> {result.bestScore}/{max}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">{categoryById[scenario.categoryId]?.name}</p>
        <h3 className="mt-1 text-xl font-extrabold text-navy-900 dark:text-white">{scenario.title}</h3>
        <p className="mt-2 flex-1 text-sm text-navy-600 dark:text-navy-400">{scenario.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Pill>
            <Clock className="h-3 w-3" /> {scenario.durationMinutes} daq
          </Pill>
          <Pill>
            <GitBranch className="h-3 w-3" /> {countSteps(scenario)} vaziyat · {countEndings(scenario)} yakun
          </Pill>
          <Pill>
            {scenario.grades[0]}–{scenario.grades[scenario.grades.length - 1]}-sinf
          </Pill>
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400">
          {result ? `Qayta o‘ynash · ${result.plays} marta o‘ynalgan` : "Boshlash"}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
