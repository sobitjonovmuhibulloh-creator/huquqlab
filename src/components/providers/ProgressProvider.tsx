"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { badgeById } from "@/data/gamification";
import { challengeProgress, getCurrentChallenge } from "@/lib/gamification";
import * as P from "@/lib/progress";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from "@/lib/storage";
import type { Scenario, UserProgress } from "@/types";
import { useContent } from "./ContentProvider";
import { useToast } from "./ToastProvider";

interface ProgressContextValue {
  progress: UserProgress;
  hydrated: boolean;
  isTopicCompleted: (topicId: string) => boolean;
  toggleTopic: (topicId: string) => void;
  completeTopic: (topicId: string) => void;
  recordQuiz: (topicId: string, correct: number, total: number) => number;
  recordSimulator: (scenario: Scenario, score: number, maxScore: number, endingId?: string) => number;
  claimWeeklyChallenge: () => void;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { scenarios } = useContent();
  const { toast } = useToast();
  const [progress, setProgress] = useState<UserProgress>(P.emptyProgress);
  const [hydrated, setHydrated] = useState(false);
  // Yon ta'sirlar (toast, saqlash) setState updater ichida bo'lmasligi uchun joriy holatni ref'da ushlaymiz
  const ref = useRef(progress);

  useEffect(() => {
    const loaded = P.sanitizeProgress(readJSON(STORAGE_KEYS.progress, null));
    ref.current = loaded;
    setProgress(loaded);
    setHydrated(true);

    // Boshqa tabda o'zgarsa — sinxronlash
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEYS.progress) return;
      const synced = P.sanitizeProgress(readJSON(STORAGE_KEYS.progress, null));
      ref.current = synced;
      setProgress(synced);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback(
    (next: UserProgress, xpGained: number, xpReason?: string) => {
      const { next: withBadges, newBadges } = P.evaluateBadges(next, scenarios);
      ref.current = withBadges;
      setProgress(withBadges);
      if (!writeJSON(STORAGE_KEYS.progress, withBadges)) {
        toast({ tone: "error", title: "Progress saqlanmadi", description: "Brauzer xotirasiga yozib bo‘lmadi." });
      }
      if (xpGained > 0) toast({ tone: "xp", emoji: "⚡", title: `+${xpGained} XP`, description: xpReason });
      for (const id of newBadges) {
        const b = badgeById[id];
        if (b) toast({ tone: "badge", emoji: b.emoji, title: `Yangi nishon: ${b.name}`, description: b.description });
      }
    },
    [scenarios, toast],
  );

  const completeTopic = useCallback(
    (topicId: string) => {
      const { next, xpGained } = P.completeTopic(ref.current, topicId);
      if (next !== ref.current) commit(next, xpGained, "Mavzu o‘rganildi");
    },
    [commit],
  );

  const toggleTopic = useCallback(
    (topicId: string) => {
      if (ref.current.completedTopics.includes(topicId)) commit(P.uncompleteTopic(ref.current, topicId), 0);
      else completeTopic(topicId);
    },
    [commit, completeTopic],
  );

  const recordQuiz = useCallback(
    (topicId: string, correct: number, total: number) => {
      const { next, xpGained } = P.recordQuiz(ref.current, topicId, correct, total);
      commit(next, xpGained, "Test natijasi uchun");
      return xpGained;
    },
    [commit],
  );

  const recordSimulator = useCallback(
    (scenario: Scenario, score: number, maxScore: number, endingId?: string) => {
      const { next, xpGained } = P.recordSimulator(ref.current, scenario, score, maxScore, endingId);
      commit(next, xpGained, `«${scenario.title}» simulyatori`);
      return xpGained;
    },
    [commit],
  );

  const claimWeeklyChallenge = useCallback(() => {
    const challenge = getCurrentChallenge();
    const state = challengeProgress(ref.current, challenge);
    if (!state.done || state.claimed) return;
    const next: UserProgress = {
      ...ref.current,
      xp: ref.current.xp + challenge.rewardXp,
      claimedChallenges: [...ref.current.claimedChallenges, state.claimKey],
    };
    commit(next, challenge.rewardXp, `Haftalik challenge: ${challenge.title}`);
  }, [commit]);

  const resetProgress = useCallback(() => {
    const empty = P.emptyProgress();
    ref.current = empty;
    setProgress(empty);
    removeKey(STORAGE_KEYS.progress);
    toast({ tone: "info", title: "Progress tozalandi" });
  }, [toast]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      progress,
      hydrated,
      isTopicCompleted: (id) => progress.completedTopics.includes(id),
      toggleTopic,
      completeTopic,
      recordQuiz,
      recordSimulator,
      claimWeeklyChallenge,
      resetProgress,
    }),
    [progress, hydrated, toggleTopic, completeTopic, recordQuiz, recordSimulator, claimWeeklyChallenge, resetProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress ProgressProvider ichida ishlatilishi kerak");
  return ctx;
}
