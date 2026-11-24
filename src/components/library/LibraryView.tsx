"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, Download, ExternalLink, Info, Library } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { EmptyState, Pill } from "@/components/ui/misc";
import { books, BOOKS_SOURCE, languageLabel } from "@/data/books";
import { cn, formatDate } from "@/lib/utils";
import type { Book, Grade } from "@/types";

const covers: Record<number, string> = {
  8: "from-brand-500 to-brand-600",
  9: "from-emerald-500 to-teal-600",
  10: "from-amber-500 to-orange-600",
  11: "from-rose-500 to-brand-600",
};

export function LibraryView() {
  const { topics } = useContent();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [language, setLanguage] = useState<Book["language"] | null>("uz");

  const grades = [...new Set(books.map((b) => b.grade))].sort((a, b) => a - b);
  const filtered = books.filter((b) => (!grade || b.grade === grade) && (!language || b.language === language));

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="card inline-flex flex-wrap gap-1 p-1.5" role="tablist" aria-label="Sinf">
          {[null, ...grades].map((g) => (
            <button
              key={g ?? "all"}
              role="tab"
              aria-selected={grade === g}
              onClick={() => setGrade(g)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-bold transition",
                grade === g ? "bg-brand-600 text-white dark:bg-brand-500" : "text-navy-600 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-white/5",
              )}
            >
              {g ? `${g}-sinf` : "Barchasi"}
            </button>
          ))}
        </div>
        <div className="card inline-flex gap-1 p-1.5" role="tablist" aria-label="Til">
          {([null, "uz", "ru"] as const).map((l) => (
            <button
              key={l ?? "all"}
              role="tab"
              aria-selected={language === l}
              onClick={() => setLanguage(l)}
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                language === l ? "bg-navy-900 text-white dark:bg-white dark:text-navy-900" : "text-navy-600 hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-white/5",
              )}
            >
              {l ? languageLabel[l] : "Barcha tillar"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Kitob topilmadi" description="Boshqa sinf yoki tilni tanlang." icon={<Library className="h-7 w-7" />} />
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((b, i) => {
            const topicCount = topics.filter((t) => t.grades.includes(b.grade)).length;
            return (
              <article key={b.id} style={{ animationDelay: `${i * 60}ms` }} className="card flex flex-col overflow-hidden animate-fade-up">
                <a href={b.url} target="_blank" rel="noopener noreferrer" className={cn("group relative flex aspect-[4/3] flex-col justify-between bg-gradient-to-br p-5 text-white", covers[b.grade])}>
                  <div className="bg-grid absolute inset-0 opacity-20" />
                  <span className="relative self-start rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold backdrop-blur">{b.grade}-sinf</span>
                  <div className="relative">
                    <BookOpen className="mb-2 h-7 w-7 opacity-80 transition group-hover:scale-110" />
                    <p className="font-display text-lg leading-tight font-extrabold">{b.title}</p>
                  </div>
                </a>
                <div className="flex flex-1 flex-col p-5">
                  {b.authors && <p className="text-sm text-navy-600 dark:text-navy-400">{b.authors.join(", ")}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Pill>{languageLabel[b.language]}</Pill>
                    <Pill>PDF{b.sizeMb ? ` · ${b.sizeMb} MB` : ""}</Pill>
                  </div>
                  <Link href={`/mavzular?sinf=${b.grade}`} className="mt-3 text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                    {b.grade}-sinf uchun {topicCount} ta interaktiv mavzu →
                  </Link>
                  <div className="mt-auto flex gap-2 pt-5">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700 dark:bg-brand-500"
                    >
                      O‘qish <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={b.url}
                      download
                      className="grid h-10 w-10 place-items-center rounded-xl border border-navy-200 text-navy-600 transition hover:bg-navy-50 dark:border-white/10 dark:text-navy-300 dark:hover:bg-white/5"
                      aria-label={`${b.title} — yuklab olish`}
                      title="Yuklab olish"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Darsliklar mualliflik huquqi bilan himoyalangan, shuning uchun ular HuquqLab’ga ko‘chirilmagan — tugmalar to‘g‘ridan-to‘g‘ri{" "}
          <a href={BOOKS_SOURCE.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
            {BOOKS_SOURCE.name}
          </a>
          dagi rasmiy nusxani ochadi. Portal sekin ishlasa, fayl ochilishi biroz vaqt olishi mumkin. Havolalar {formatDate(books[0].checkedAt)} da tekshirilgan.
        </p>
      </div>
    </div>
  );
}
