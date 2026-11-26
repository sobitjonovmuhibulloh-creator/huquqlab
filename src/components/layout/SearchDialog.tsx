"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, CornerDownLeft, FileText, Gamepad2, Search, Type, X, type LucideIcon } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { documents, documentTypeLabel } from "@/data/documents";
import { scenarios } from "@/data/simulators";
import { buildGlossary } from "@/lib/legal";
import { cn, normalizeSearch } from "@/lib/utils";

interface Result {
  kind: "Mavzu" | "Hujjat" | "Simulyator" | "Atama";
  title: string;
  subtitle: string;
  href: string;
  haystack: string;
}

const kindIcon: Record<Result["kind"], LucideIcon> = {
  Mavzu: BookOpen,
  Hujjat: FileText,
  Simulyator: Gamepad2,
  Atama: Type,
};

const suggestions = ["bulling", "topilma", "konstitutsiya", "iste’molchi", "shaxsiy ma’lumot", "mehnat"];

/** Butun sayt bo'ylab qidiruv: Ctrl+K / ⌘K yoki «/» tugmasi */
export function SearchDialog() {
  const router = useRouter();
  const { topics } = useContent();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo<Result[]>(() => {
    const items: Omit<Result, "haystack">[] = [
      ...topics.map((t) => ({ kind: "Mavzu" as const, title: t.title, subtitle: t.shortDescription, href: `/mavzular/${t.slug}` })),
      ...documents.map((d) => ({ kind: "Hujjat" as const, title: d.shortTitle, subtitle: `${documentTypeLabel[d.type]} · ${d.summary}`, href: `/qonunlar/${d.slug}` })),
      ...scenarios.map((s) => ({ kind: "Simulyator" as const, title: s.title, subtitle: s.tagline, href: `/simulyatorlar/${s.id}` })),
      ...buildGlossary(topics).map((g) => ({
        kind: "Atama" as const,
        title: g.term,
        subtitle: g.definition,
        href: g.topicSlugs[0] ? `/mavzular/${g.topicSlugs[0]}#tushunchalar` : "/lugat",
      })),
    ];
    return items.map((r) => ({ ...r, haystack: normalizeSearch(`${r.title} ${r.subtitle}`) }));
  }, [topics]);

  const results = useMemo(() => {
    const q = normalizeSearch(query.trim());
    if (!q) return [];
    // Sarlavhada topilganlar birinchi
    return index
      .filter((r) => r.haystack.includes(q))
      .sort((a, b) => Number(normalizeSearch(b.title).includes(q)) - Number(normalizeSearch(a.title).includes(q)))
      .slice(0, 12);
  }, [index, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const typing = target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if ((e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("huquqlab:search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("huquqlab:search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = window.setTimeout(() => inputRef.current?.focus(), 10);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) go(results[active].href);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-navy-950/50 p-4 pt-[10vh] backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Saytdan qidirish"
        className="card w-full max-w-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-navy-200 px-4 dark:border-white/10">
          <Search className="h-5 w-5 shrink-0 text-navy-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Mavzu, qonun, simulyator yoki atama..."
            className="h-14 flex-1 bg-transparent text-base text-navy-900 outline-none placeholder:text-navy-400 dark:text-white"
            aria-label="Qidiruv so‘zi"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={results[active] ? `sr-${active}` : undefined}
          />
          <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-white/10" aria-label="Yopish">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query.trim() ? (
            <div className="p-3">
              <p className="text-xs font-semibold tracking-wide text-navy-500 uppercase dark:text-navy-400">Ko‘p qidiriladi</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-navy-200 px-3 py-1.5 text-sm text-navy-700 transition hover:border-brand-500 hover:text-brand-700 dark:border-white/10 dark:text-navy-300 dark:hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="p-6 text-center text-sm text-navy-500 dark:text-navy-400">«{query}» bo‘yicha hech narsa topilmadi.</p>
          ) : (
            <ul id="search-results" role="listbox">
              {results.map((r, i) => {
                const Icon = kindIcon[r.kind];
                return (
                  <li key={`${r.kind}-${r.href}-${r.title}`} id={`sr-${i}`} role="option" aria-selected={i === active}>
                    <button
                      onClick={() => go(r.href)}
                      onMouseMove={() => setActive(i)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition",
                        i === active ? "bg-brand-50 dark:bg-brand-400/10" : "",
                      )}
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy-100 text-navy-600 dark:bg-white/5 dark:text-navy-300">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-navy-900 dark:text-white">{r.title}</span>
                        <span className="block truncate text-xs text-navy-500 dark:text-navy-400">{r.subtitle}</span>
                      </span>
                      <span className="hidden shrink-0 text-xs font-medium text-navy-400 sm:block">{r.kind}</span>
                      {i === active && <CornerDownLeft className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="hidden items-center gap-4 border-t border-navy-200 px-4 py-2.5 text-xs text-navy-500 sm:flex dark:border-white/10 dark:text-navy-400">
          <span><kbd className="font-sans font-semibold">↑↓</kbd> tanlash</span>
          <span><kbd className="font-sans font-semibold">Enter</kbd> ochish</span>
          <span><kbd className="font-sans font-semibold">Esc</kbd> yopish</span>
        </div>
      </div>
    </div>
  );
}
