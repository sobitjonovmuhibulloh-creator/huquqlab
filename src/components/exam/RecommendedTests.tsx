"use client";

import { useEffect, useState } from "react";
import { exams as staticExams } from "@/data/exams";
import { api, loadResults, recommendTests, type AccessView } from "@/lib/exam-client";
import type { ExamMeta } from "@/types/exam";
import { ExamCard } from "./ExamCard";

/** Keyingi tavsiya etilgan testlar — haqiqiy natijalar va katalog asosida */
export function RecommendedTests({ title = "Keyingi testlar" }: { title?: string }) {
  const [items, setItems] = useState<{ exam: ExamMeta; owned: boolean }[] | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([api<ExamMeta[]>("/api/exams").catch(() => staticExams), api<AccessView>("/api/access").catch(() => null)]).then(([catalog, access]) => {
      if (!alive) return;
      const owned = access?.exams ?? [];
      setItems(recommendTests(catalog, loadResults(), owned).map((exam) => ({ exam, owned: owned.includes(exam.id) })));
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!items || items.length === 0) return null;
  return (
    <section aria-labelledby="tavsiya">
      <h2 id="tavsiya" className="text-xl font-bold text-navy-900 dark:text-white">
        {title}
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {items.map(({ exam, owned }, i) => (
          <ExamCard key={exam.id} exam={exam} index={i} ownership={exam.access === "free" ? "free" : owned ? "owned" : "locked"} />
        ))}
      </div>
    </section>
  );
}
