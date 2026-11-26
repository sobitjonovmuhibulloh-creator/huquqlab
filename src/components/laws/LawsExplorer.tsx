"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, FileText, Gavel, Globe2, Landmark, Search, X, type LucideIcon } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { Chip } from "@/components/topics/TopicsExplorer";
import { EmptyState, Pill } from "@/components/ui/misc";
import { documents, documentTypeLabel, lexUrl } from "@/data/documents";
import { topicsForDocument } from "@/lib/legal";
import { cn, normalizeSearch } from "@/lib/utils";
import { GRADES, type Grade, type LegalDocumentType } from "@/types";

export const typeStyle: Record<LegalDocumentType, { icon: LucideIcon; className: string }> = {
  konstitutsiya: { icon: Landmark, className: "bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300" },
  kodeks: { icon: Gavel, className: "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
  qonun: { icon: FileText, className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" },
  xalqaro: { icon: Globe2, className: "bg-sky-50 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300" },
};

const types = Object.keys(documentTypeLabel) as LegalDocumentType[];

export function LawsExplorer() {
  const { topics } = useContent();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<LegalDocumentType | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = normalizeSearch(deferredQuery.trim());
    return documents.filter((d) => {
      if (type && d.type !== type) return false;
      if (grade && !d.grades.includes(grade)) return false;
      if (q && !normalizeSearch(`${d.title} ${d.summary} ${d.number ?? ""}`).includes(q)) return false;
      return true;
    });
  }, [deferredQuery, type, grade]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-navy-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hujjat nomi yoki mazmuni bo‘yicha qidirish... (masalan: mehnat, ma’lumot)"
          className="input h-13 rounded-2xl pr-11 pl-12 text-base"
          aria-label="Hujjatlarni qidirish"
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

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Chip active={!type} onClick={() => setType(null)}>
          Barcha turlar
        </Chip>
        {types.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
            {documentTypeLabel[t]}
          </Chip>
        ))}
        <span className="mx-1 hidden h-6 w-px bg-navy-200 sm:block dark:bg-white/10" />
        {GRADES.map((g) => (
          <Chip key={g} tone="emerald" active={grade === g} onClick={() => setGrade(grade === g ? null : g)}>
            {g}-sinf
          </Chip>
        ))}
      </div>

      <p className="mt-6 text-sm text-navy-500 dark:text-navy-400" aria-live="polite">
        {filtered.length} ta hujjat
      </p>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="Hujjat topilmadi" description="Boshqa so‘z bilan qidiring yoki filtrlarni o‘zgartiring." />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {filtered.map((d, i) => {
            const style = typeStyle[d.type];
            const Icon = style.icon;
            const related = topicsForDocument(d, topics).length;
            return (
              <article key={d.slug} style={{ animationDelay: `${i * 40}ms` }} className="card group relative flex gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lg animate-fade-up">
                <div className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl", style.className)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap gap-1.5">
                    <Pill>{documentTypeLabel[d.type]}</Pill>
                    {d.number && <Pill>{d.number}</Pill>}
                    {d.adoptedAt && <Pill>{new Date(d.adoptedAt).getFullYear()}-yil</Pill>}
                  </div>
                  <h3 className="mt-2 font-display text-lg leading-snug font-bold text-navy-900 dark:text-white">
                    <Link href={`/qonunlar/${d.slug}`} className="after:absolute after:inset-0">
                      {d.shortTitle}
                    </Link>
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-navy-600 dark:text-navy-400">{d.summary}</p>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-navy-500 dark:text-navy-400">
                      {related > 0 ? `${related} ta mavzuda` : `${d.grades[0]}–${d.grades[d.grades.length - 1]}-sinf`}
                    </span>
                    <span className="flex items-center gap-3">
                      <a
                        href={lexUrl(d)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative z-10 inline-flex items-center gap-1 font-semibold text-navy-500 hover:text-brand-600 dark:text-navy-400"
                        title="lex.uz’dagi rasmiy matn"
                      >
                        lex.uz <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <ArrowRight className="h-4 w-4 text-brand-600 transition group-hover:translate-x-1 dark:text-brand-400" />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
