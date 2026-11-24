"use client";

import { Flame, Gift } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { ProgressBar } from "@/components/ui/misc";
import { challengeProgress, getCurrentChallenge } from "@/lib/gamification";

export function WeeklyChallengeCard() {
  const { progress, hydrated, claimWeeklyChallenge } = useProgress();
  const challenge = getCurrentChallenge();
  const state = challengeProgress(progress, challenge);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-fuchsia-600 p-6 text-white shadow-xl shadow-rose-500/20">
      <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
      <div className="relative">
        <p className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Flame className="h-4 w-4" /> Haftalik challenge
        </p>
        <h3 className="mt-2 text-2xl font-extrabold">{challenge.title}</h3>
        <p className="mt-1 text-white/85">{challenge.description}</p>
        <div className="mt-5 flex items-center gap-3">
          <ProgressBar value={hydrated ? state.current / state.target : 0} className="bg-white/25" barClassName="from-white to-white" label="Challenge progressi" />
          <span className="font-bold tabular-nums">
            {hydrated ? state.current : 0}/{state.target}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Gift className="h-4 w-4" /> Mukofot: +{challenge.rewardXp} XP
          </span>
          {state.claimed ? (
            <span className="rounded-xl bg-white/20 px-3 py-2 text-sm font-bold">Olingan ✓</span>
          ) : (
            <button
              className="rounded-xl bg-white px-3.5 py-2 text-sm font-bold text-rose-600 transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!state.done}
              onClick={claimWeeklyChallenge}
            >
              {state.done ? "Mukofotni olish" : "Jarayonda"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
