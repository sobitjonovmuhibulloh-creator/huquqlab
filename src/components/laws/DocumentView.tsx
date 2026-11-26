"use client";

import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Gamepad2, Hash, ListChecks, Sparkles } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { TopicCard } from "@/components/topics/TopicCard";
import { LegalStatusBadge, Pill } from "@/components/ui/misc";
import { categoryById } from "@/data/categories";
import { documents, documentTypeLabel, lexUrl } from "@/data/documents";
import { scenarios } from "@/data/simulators";
import { topicsForDocument } from "@/lib/legal";
import { cn, formatDate } from "@/lib/utils";
import type { LegalDocument } from "@/types";
import { typeStyle } from "./LawsExplorer";

export function DocumentView({ doc }: { doc: LegalDocument }) {
  const { topics } = useContent();
  const related = topicsForDocument(doc, topics);
  const relatedScenarios = scenarios.filter((s) => related.some((t) => t.simulatorId === s.id || t.slug === s.relatedTopicSlug));
  const similar = documents.filter((d) => d.slug !== doc.slug && d.categoryIds.some((c) => doc.categoryIds.includes(c))).slice(0, 4);
  const style = typeStyle[doc.type];
  const Icon = style.icon;

  const facts = [
    { icon: Hash, label: "Turi", value: `${documentTypeLabel[doc.type]}${doc.number ? ` · ${doc.number}` : ""}` },
    doc.adoptedAt && { icon: CalendarDays, label: "Qabul qilingan", value: formatDate(doc.adoptedAt) },
    doc.effectiveAt && { icon: CalendarDays, label: "Kuchga kirgan", value: formatDate(doc.effectiveAt) },
  ].filter(Boolean) as { icon: typeof Hash; label: string; value: string }[];

  return (
    <div className="pb-12">
      <section className="relative overflow-hidden border-b border-navy-200/70 dark:border-white/[0.06]">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-page relative py-10 sm:py-14">
          <Link href="/qonunlar" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-600 dark:text-navy-400">
            <ArrowLeft className="h-4 w-4" /> Qonunlar
          </Link>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl animate-fade-up">
              <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold", style.className)}>
                <Icon className="h-4 w-4" /> {documentTypeLabel[doc.type]}
              </div>
              <h1 className="mt-4 text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">{doc.title}</h1>
              <p className="mt-3 text-lg text-navy-600 dark:text-navy-300">{doc.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {doc.categoryIds.map((c) => (
                  <Pill key={c}>{categoryById[c]?.name}</Pill>
                ))}
                <Pill>
                  {doc.grades[0]}–{doc.grades[doc.grades.length - 1]}-sinf
                </Pill>
              </div>
            </div>
            <a
              href={lexUrl(doc)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-2xl bg-brand-700 px-7 font-semibold text-white shadow-sm transition hover:bg-brand-800 dark:bg-brand-400 dark:text-navy-950 dark:hover:bg-brand-300"
            >
              {doc.lexId ? "Rasmiy matnni o‘qish" : "lex.uz’da qidirish"} <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_300px]">
        <div className="space-y-10">
          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-navy-900 dark:text-white">
              <ListChecks className="h-6 w-6 text-brand-600 dark:text-brand-400" /> O‘quvchi bilishi kerak
            </h2>
            <ul className="mt-5 space-y-3">
              {doc.keyPoints.map((p, i) => (
                <li key={i} className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <p className="flex gap-3 leading-relaxed text-navy-800 dark:text-navy-200">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-bold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                      {i + 1}
                    </span>
                    {p.text}
                  </p>
                  <div className="shrink-0 pl-9 sm:pl-0">
                    <LegalStatusBadge status={p.status} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-2xl font-bold text-navy-900 dark:text-white">
              <Sparkles className="h-6 w-6 text-brand-600 dark:text-brand-400" /> Shu hujjatga tayangan mavzular
            </h2>
            {related.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {related.map((t, i) => (
                  <TopicCard key={t.id} topic={t} index={i} />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-navy-500 dark:text-navy-400">Hozircha bu hujjatga bog‘langan interaktiv mavzu yo‘q.</p>
            )}
          </section>

          {relatedScenarios.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-navy-900 dark:text-white">
                <Gamepad2 className="h-6 w-6 text-brand-600 dark:text-brand-400" /> Amalda sinab ko‘r
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {relatedScenarios.map((s) => (
                  <Link key={s.id} href={`/simulyatorlar/${s.id}`} className="card flex items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                    <span className="text-3xl" aria-hidden>
                      {s.emoji}
                    </span>
                    <span>
                      <span className="block font-bold text-navy-900 dark:text-white">{s.title}</span>
                      <span className="text-sm text-navy-500 dark:text-navy-400">{s.tagline}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="font-display font-bold text-navy-900 dark:text-white">Asosiy rekvizitlar</h2>
            <dl className="mt-4 space-y-3">
              {facts.map((f) => (
                <div key={f.label} className="flex gap-3">
                  <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-navy-400" />
                  <div>
                    <dt className="text-xs text-navy-500 dark:text-navy-400">{f.label}</dt>
                    <dd className="text-sm font-semibold text-navy-900 dark:text-white">{f.value}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-navy-200 pt-3 text-xs text-navy-500 dark:border-white/10 dark:text-navy-400">
              Tekshirilgan: {formatDate(doc.checkedAt)}. Hujjatga keyin o‘zgartirish kiritilgan bo‘lishi mumkin — amaldagi tahririni lex.uz’da ko‘ring.
            </p>
          </section>

          {similar.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display font-bold text-navy-900 dark:text-white">O‘xshash hujjatlar</h2>
              <ul className="mt-3 space-y-1">
                {similar.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/qonunlar/${d.slug}`} className="block rounded-xl px-2 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50 hover:text-brand-700 dark:text-navy-300 dark:hover:bg-white/5 dark:hover:text-white">
                      {d.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
