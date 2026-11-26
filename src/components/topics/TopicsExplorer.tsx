"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState, ProgressBar } from "@/components/ui/misc";
import { categories } from "@/data/categories";
import { cn, normalizeSearch } from "@/lib/utils";
import { GRADES, type CategoryId, type Grade } from "@/types";
import { TopicCard } from "./TopicCard";

type StatusFilter = "all" | "done" | "todo";

/** Filtr holati URL'da saqlanadi — havolani ulashish va orqaga qaytish ishlaydi */
export function TopicsExplorer() {
  const router = useRouter();
  const params = useSearchParams();
  const { topics, error } = useContent();
  const { progress, hydrated } = useProgress();

  const gradeParam = Number(params.get("sinf"));
  const grade: Grade | null = GRADES.includes(gradeParam as Grade) ? (gradeParam as Grade) : null;
  const category = (params.get("kategoriya") as CategoryId | null) ?? null;
  const status = (params.get("holat") as StatusFilter | null) ?? "all";
  const [query, setQuery] = useState(() => params.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const firstRender = useRef(true);

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    const qs = sp.toString();
    router.replace(qs ? `/mavzular?${qs}` : "/mavzular", { scroll: false });
  }

  // Qidiruv matnini URL'ga kechiktirib yozamiz (har bir harfda navigatsiya qilmaslik uchun)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = window.setTimeout(() => update({ q: query.trim() || null }), 300);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const gradeTopics = useMemo(() => (grade ? topics.filter((t) => t.grades.includes(grade)) : topics), [topics, grade]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(deferredQuery.trim());
    return gradeTopics.filter((t) => {
      if (category && t.categoryId !== category) return false;
      if (status === "done" && !progress.completedTopics.includes(t.id)) return false;
      if (status === "todo" && progress.completedTopics.includes(t.id)) return false;
      if (q) {
        const haystack = normalizeSearch(`${t.title} ${t.shortDescription} ${t.concepts.map((c) => c.term).join(" ")}`);
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [gradeTopics, category, status, deferredQuery, progress.completedTopics]);

  const doneInGrade = gradeTopics.filter((t) => progress.completedTopics.includes(t.id)).length;
  const usedCategories = categories.filter((c) => gradeTopics.some((t) => t.categoryId === c.id));
  const hasFilters = Boolean(category || status !== "all" || query);

  return (
    <div>
      {/* Sinf tanlash */}
      <div className="card p-2">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-6" role="tablist" aria-label="Sinf tanlash">
          {[null, ...GRADES].map((g) => (
            <button
              key={g ?? "all"}
              role="tab"
              aria-selected={grade === g}
              onClick={() => update({ sinf: g ? String(g) : null, kategoriya: null })}
              className={cn(
                "rounded-2xl px-3 py-3 text-sm font-bold transition-all",
                grade === g
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25 dark:bg-brand-500"
                  : "text-navy-600 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-white/5",
              )}
            >
              {g ? `${g}-sinf` : "Barchasi"}
            </button>
          ))}
        </div>
      </div>

      {/* Progress va qidiruv */}
      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mavzu yoki tushuncha bo‘yicha qidirish... (masalan: iste’molchi, bulling)"
            className="input h-13 rounded-2xl pr-11 pl-12 text-base"
            aria-label="Mavzularni qidirish"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-white/10"
              aria-label="Qidiruvni tozalash"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="card flex items-center gap-4 px-5 py-3">
          <div className="flex-1">
            <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">{grade ? `${grade}-sinf progressi` : "Umumiy progress"}</p>
            <ProgressBar value={gradeTopics.length ? doneInGrade / gradeTopics.length : 0} className="mt-2" barClassName="from-emerald-500 to-teal-400" />
          </div>
          <p className="text-lg font-extrabold text-navy-900 tabular-nums dark:text-white">
            {hydrated ? doneInGrade : 0}/{gradeTopics.length}
          </p>
        </div>
      </div>

      {/* Kategoriyalar va holat */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Chip active={!category} onClick={() => update({ kategoriya: null })}>
          Barcha kategoriyalar
        </Chip>
        {usedCategories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => update({ kategoriya: category === c.id ? null : c.id })}>
            {c.name}
          </Chip>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-navy-200 sm:block dark:bg-white/10" />
        {(
          [
            ["all", "Hammasi"],
            ["todo", "O‘rganilmagan"],
            ["done", "O‘rganilgan"],
          ] as const
        ).map(([value, label]) => (
          <Chip key={value} active={status === value} onClick={() => update({ holat: value })} tone="emerald">
            {label}
          </Chip>
        ))}
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">{error}</p>}

      <p className="mt-6 text-sm text-navy-500 dark:text-navy-400" aria-live="polite">
        {filtered.length} ta mavzu topildi
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Hech narsa topilmadi"
            description={query ? `«${query}» bo‘yicha mavzu topilmadi. Boshqa so‘z bilan qidirib ko‘ring.` : "Tanlangan filtrlarga mos mavzu yo‘q."}
            action={
              hasFilters && (
                <Button variant="secondary" onClick={() => {
                    setQuery("");
                    update({ q: null, kategoriya: null, holat: null });
                  }}>
                  Filtrlarni tozalash
                </Button>
              )
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <TopicCard key={t.id} topic={t} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Chip({
  active,
  onClick,
  children,
  tone = "brand",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "brand" | "emerald";
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? tone === "brand"
            ? "border-brand-600 bg-brand-600 text-white dark:border-brand-500 dark:bg-brand-500"
            : "border-emerald-600 bg-emerald-600 text-white"
          : "border-navy-200 bg-white text-navy-600 hover:border-navy-300 hover:text-navy-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-navy-300 dark:hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
