"use client";

import { useCallback, useEffect, useState } from "react";
import { exams as staticExams } from "@/data/exams";
import { api, type AccessView, type PricingView } from "@/lib/exam-client";
import type { ExamMeta } from "@/types/exam";

/** Narxlar va foydalanuvchining access holati (server — yagona haqiqat manbai) */
export function useMarket() {
  const [pricing, setPricing] = useState<PricingView | null>(null);
  const [access, setAccess] = useState<AccessView | null>(null);
  // Kod ichidagi testlar darhol ko'rinadi, bazadagilar API'dan qo'shiladi
  const [catalog, setCatalog] = useState<ExamMeta[]>(staticExams);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [p, a, c] = await Promise.all([api<PricingView>("/api/pricing"), api<AccessView>("/api/access"), api<ExamMeta[]>("/api/exams")]);
      setPricing(p);
      setAccess(a);
      setCatalog(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ma’lumotlarni yuklab bo‘lmadi");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const totalCredits = access ? Object.values(access.credits).reduce((n, c) => n + c, 0) : 0;

  return { pricing, access, setAccess, catalog, error, refresh, loading: !pricing && !error, totalCredits };
}
