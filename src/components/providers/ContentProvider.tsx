"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { scenarios as demoScenarios } from "@/data/simulators";
import { topics as demoTopics } from "@/data/topics";
import { contentRepository } from "@/lib/repository";
import type { Scenario, Topic } from "@/types";

interface ContentContextValue {
  topics: Topic[];
  scenarios: Scenario[];
  /** localStorage'dagi admin o'zgarishlari yuklanib bo'ldimi */
  ready: boolean;
  error: string | null;
  saveTopic: (topic: Topic) => Promise<Topic>;
  deleteTopic: (id: string) => Promise<void>;
  replaceTopics: (topics: Topic[]) => Promise<void>;
  resetContent: () => Promise<void>;
  getTopicBySlug: (slug: string) => Topic | undefined;
}

const ContentContext = createContext<ContentContextValue | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  // Server render va birinchi kadr demo kontent bilan — sahifa hech qachon bo'sh ko'rinmaydi
  const [topics, setTopics] = useState<Topic[]>(demoTopics);
  const [scenarios, setScenarios] = useState<Scenario[]>(demoScenarios);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [t, s] = await Promise.all([contentRepository.listTopics(), contentRepository.listScenarios()]);
      setTopics(t);
      setScenarios(s);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kontentni yuklashda xatolik");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveTopic = useCallback(
    async (topic: Topic) => {
      const saved = await contentRepository.saveTopic(topic);
      await reload();
      return saved;
    },
    [reload],
  );

  const deleteTopic = useCallback(
    async (id: string) => {
      await contentRepository.deleteTopic(id);
      await reload();
    },
    [reload],
  );

  const replaceTopics = useCallback(
    async (next: Topic[]) => {
      await contentRepository.replaceTopics(next);
      await reload();
    },
    [reload],
  );

  const resetContent = useCallback(async () => {
    await contentRepository.reset();
    await reload();
  }, [reload]);

  const value = useMemo<ContentContextValue>(
    () => ({
      topics,
      scenarios,
      ready,
      error,
      saveTopic,
      deleteTopic,
      replaceTopics,
      resetContent,
      getTopicBySlug: (slug) => topics.find((t) => t.slug === slug),
    }),
    [topics, scenarios, ready, error, saveTopic, deleteTopic, replaceTopics, resetContent],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent ContentProvider ichida ishlatilishi kerak");
  return ctx;
}
