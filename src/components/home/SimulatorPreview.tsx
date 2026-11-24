"use client";

import { useState } from "react";
import { ArrowRight, Gavel, RotateCcw } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/types";

const tone = {
  good: "border-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
  neutral: "border-amber-400 bg-amber-50 dark:bg-amber-400/10",
  bad: "border-rose-400 bg-rose-50 dark:bg-rose-400/10",
};

const chip = { good: "bg-emerald-500", neutral: "bg-amber-500", bad: "bg-rose-500" };

/** Bosh sahifadagi mini simulyator: birinchi qadamni o'ynab ko'rish mumkin */
export function SimulatorPreview({ scenario }: { scenario: Scenario }) {
  const step = scenario.steps[scenario.startStepId];
  const [picked, setPicked] = useState<string | null>(null);
  const choice = step.choices.find((c) => c.id === picked);

  return (
    <div className="card relative overflow-hidden p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-400/15">{scenario.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">Simulyator · 1-qaror</p>
            <p className="font-bold text-navy-900 dark:text-white">{scenario.title}</p>
          </div>
        </div>
        {picked && (
          <button
            onClick={() => setPicked(null)}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-navy-500 hover:bg-navy-100 dark:hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Qayta
          </button>
        )}
      </div>

      <p className="mt-5 leading-relaxed text-navy-700 dark:text-navy-200">{step.narrative}</p>

      <div className="mt-5 grid gap-2.5">
        {step.choices.map((c, i) => (
          <button
            key={c.id}
            onClick={() => setPicked(c.id)}
            disabled={Boolean(picked)}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-2 p-3.5 text-left text-sm font-semibold transition-all",
              picked === c.id
                ? tone[c.outcome.tone]
                : picked
                  ? "border-transparent bg-navy-50 opacity-50 dark:bg-white/[0.03]"
                  : "border-navy-200 bg-white hover:-translate-y-0.5 hover:border-brand-400 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-brand-400/50",
              "text-navy-800 dark:text-navy-100",
            )}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-navy-100 text-xs font-bold text-navy-600 dark:bg-white/10 dark:text-navy-300">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1">{c.label}</span>
            {picked === c.id && (
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold text-white animate-pop", chip[c.outcome.tone])}>
                {c.outcome.points > 0 ? "+" : ""}
                {c.outcome.points}
              </span>
            )}
          </button>
        ))}
      </div>

      {choice && (
        <div className="mt-5 rounded-2xl bg-navy-50 p-4 animate-fade-up dark:bg-white/[0.04]">
          <p className="font-bold text-navy-900 dark:text-white">{choice.outcome.title}</p>
          <p className="mt-2 flex gap-2 text-sm text-navy-600 dark:text-navy-300">
            <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
            {choice.outcome.legalNote}
          </p>
          <ButtonLink href={`/simulyatorlar/${scenario.id}`} className="mt-4 w-full sm:w-auto">
            Voqeani davom ettirish <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
