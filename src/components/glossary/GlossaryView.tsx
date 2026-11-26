"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { EmptyState } from "@/components/ui/misc";
import { buildGlossary, initialOf } from "@/lib/legal";
import { cn, normalizeSearch } from "@/lib/utils";

export function GlossaryView() {
  const { topics } = useContent();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const glossary = useMemo(() => buildGlossary(topics), [topics]);
  const topicTitle = useMemo(() => Object.fromEntries(topics.map((t) => [t.slug, t.title])), [topics]);

  const groups = useMemo(() => {
    const q = normalizeSearch(deferredQuery.trim());
    const list = q ? glossary.filter((g) => normalizeSearch(`${g.term} ${g.definition}`).includes(q)) : glossary;
    const map = new Map<string, typeof list>();
    for (const g of list) {
      const letter = initialOf(g.term);
      map.set(letter, [...(map.get(letter) ?? []), g]);
    }
    return [...map.entries()];
  }, [glossary, deferredQuery]);

  const total = groups.reduce((n, [, items]) => n + items.length, 0);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-4 bg-[var(--bg)]/90 px-4 py-3 backdrop-blur-xl sm:mx-0 sm:px-0">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-navy-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${glossary.length} ta atama ichidan qidirish...`}
            className="input h-13 rounded-2xl pr-11 pl-12 text-base"
            aria-label="Lug‘atdan qidirish"
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
        <nav className="mt-3 flex flex-wrap gap-1" aria-label="Alifbo">
          {groups.map(([letter]) => (
            <a
              key={letter}
              href={`#harf-${letter}`}
              className="grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-sm font-bold text-navy-600 transition hover:bg-brand-600 hover:text-white dark:text-navy-300"
            >
              {letter}
            </a>
          ))}
        </nav>
      </div>

      {total === 0 ? (
        <div className="mt-6">
          <EmptyState title="Atama topilmadi" description={`«${query}» lug‘atda yo‘q. Boshqa so‘z bilan qidiring.`} />
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {groups.map(([letter, items]) => (
            <section key={letter} id={`harf-${letter}`} className="scroll-mt-48">
              <h2 className="font-display text-3xl font-extrabold text-brand-600 dark:text-brand-400">{letter}</h2>
              <dl className="mt-4 grid gap-3 md:grid-cols-2">
                {items.map((g) => (
                  <div key={g.term} className="card p-5">
                    <dt className="font-bold text-navy-900 dark:text-white">{g.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{g.definition}</dd>
                    {g.topicSlugs.length > 0 && (
                      <dd className="mt-3 flex flex-wrap gap-1.5">
                        {g.topicSlugs.map((slug) => (
                          <Link
                            key={slug}
                            href={`/mavzular/${slug}`}
                            className={cn(
                              "rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-100",
                              "dark:bg-brand-400/10 dark:text-brand-300 dark:hover:bg-brand-400/20",
                            )}
                          >
                            {topicTitle[slug] ?? slug}
                          </Link>
                        ))}
                      </dd>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
