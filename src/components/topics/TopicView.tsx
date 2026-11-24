"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  ExternalLink,
  Eye,
  Gamepad2,
  Lightbulb,
  ListChecks,
  MessageCircleQuestion,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Quiz } from "@/components/quiz/Quiz";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EmptyState, LegalStatusBadge, Pill, Skeleton } from "@/components/ui/misc";
import { categoryById } from "@/data/categories";
import { cn, difficultyLabel, formatDate } from "@/lib/utils";

const sections = [
  { id: "kirish", label: "Kirish", icon: Sparkles },
  { id: "tushuntirish", label: "Sodda tushuntirish", icon: BookOpen },
  { id: "tushunchalar", label: "Asosiy tushunchalar", icon: Lightbulb },
  { id: "huquqiy-asos", label: "Huquqiy asos", icon: Scale },
  { id: "misol", label: "Hayotiy misol", icon: Target },
  { id: "tahlil", label: "Vaziyat tahlili", icon: MessageCircleQuestion },
  { id: "xulosa", label: "Xulosa", icon: ListChecks },
  { id: "test", label: "Test", icon: Check },
];

export function TopicView({ slug }: { slug: string }) {
  const { topics, ready, scenarios } = useContent();
  const { isTopicCompleted, completeTopic, toggleTopic, hydrated } = useProgress();
  const [active, setActive] = useState("kirish");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const topic = topics.find((t) => t.slug === slug);

  useEffect(() => {
    setShowAnalysis(false);
  }, [slug]);

  // Faol bo'limni kuzatish (yon menyu uchun)
  useEffect(() => {
    if (!topic) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [topic]);

  if (!topic) {
    if (!ready) return <TopicSkeleton />;
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Mavzu topilmadi"
          description="Bu mavzu o‘chirilgan yoki manzil noto‘g‘ri bo‘lishi mumkin."
          action={<ButtonLink href="/mavzular">Barcha mavzular</ButtonLink>}
        />
      </div>
    );
  }

  const category = categoryById[topic.categoryId];
  const completed = hydrated && isTopicCompleted(topic.id);
  const scenario = topic.simulatorId ? scenarios.find((s) => s.id === topic.simulatorId) : undefined;
  const index = topics.findIndex((t) => t.id === topic.id);
  const prev = index > 0 ? topics[index - 1] : undefined;
  const nextTopic = index < topics.length - 1 ? topics[index + 1] : undefined;
  const needsVerification = topic.legalBasis.some((l) => l.status === "needs_verification");

  return (
    <div className="pb-8">
      {/* Sarlavha */}
      <section className="relative overflow-hidden border-b border-navy-200/70 dark:border-white/[0.06]">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-page relative py-10 sm:py-14">
          <Link href="/mavzular" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-600 dark:text-navy-400">
            <ArrowLeft className="h-4 w-4" /> Mavzular
          </Link>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl animate-fade-up">
              <div className="flex items-center gap-3">
                <CategoryIcon categoryId={topic.categoryId} />
                <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">{category?.name}</span>
              </div>
              <h1 className="mt-4 text-3xl font-extrabold text-navy-900 sm:text-5xl dark:text-white">{topic.title}</h1>
              <p className="mt-3 text-lg text-navy-600 dark:text-navy-300">{topic.shortDescription}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Pill>{topic.grades.map((g) => `${g}`).join(", ")}-sinf</Pill>
                <Pill>
                  <Clock className="h-3 w-3" /> {topic.durationMinutes} daqiqa
                </Pill>
                <Pill>{difficultyLabel[topic.difficulty]}</Pill>
                <Pill>{topic.quiz.length} ta test savoli</Pill>
                <Pill>Yangilangan: {formatDate(topic.updatedAt)}</Pill>
              </div>
            </div>
            <Button variant={completed ? "success" : "secondary"} size="lg" onClick={() => toggleTopic(topic.id)} aria-pressed={completed}>
              <Check className="h-5 w-5" /> {completed ? "O‘rganildi" : "O‘rganildi deb belgilash"}
            </Button>
          </div>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[240px_1fr]">
        {/* Yon menyu */}
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-1" aria-label="Mavzu bo‘limlari">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition",
                  active === s.id
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                    : "text-navy-500 hover:bg-navy-100 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-white/5 dark:hover:text-white",
                )}
              >
                <s.icon className="h-4 w-4" /> {s.label}
              </a>
            ))}
            {scenario && (
              <Link
                href={`/simulyatorlar/${scenario.id}`}
                className="mt-4 flex items-center gap-2 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-600 p-4 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:shadow-xl"
              >
                <Gamepad2 className="h-5 w-5" /> Simulyatorda sinab ko‘r
              </Link>
            )}
          </nav>
        </aside>

        <article className="min-w-0 space-y-6">
          {/* Mobil uchun bo'limlar */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="shrink-0 rounded-full border border-navy-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 dark:border-white/10 dark:bg-white/5 dark:text-navy-300">
                {s.label}
              </a>
            ))}
          </div>

          <Section id="kirish" title="Kirish" icon={Sparkles}>
            <p className="text-lg leading-relaxed text-navy-700 dark:text-navy-200">{topic.intro}</p>
          </Section>

          <Section id="tushuntirish" title="Sodda tushuntirish" icon={BookOpen}>
            <ol className="space-y-4">
              {topic.explanation.map((p, i) => (
                <li key={i} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                    {i + 1}
                  </span>
                  <p className="leading-relaxed text-navy-700 dark:text-navy-300">{p}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="tushunchalar" title="Asosiy tushunchalar" icon={Lightbulb}>
            <dl className="grid gap-3 sm:grid-cols-2">
              {topic.concepts.map((c) => (
                <div key={c.term} className="rounded-2xl border border-navy-200 bg-navy-50/60 p-4 dark:border-white/[0.08] dark:bg-white/[0.02]">
                  <dt className="font-bold text-navy-900 dark:text-white">{c.term}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{c.definition}</dd>
                </div>
              ))}
            </dl>
          </Section>

          <Section id="huquqiy-asos" title="Huquqiy asos" icon={Scale}>
            {needsVerification && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-200">
                «Tekshirish talab etiladi» belgisi bor ma’lumotlarning aniq modda raqami yoki tafsilotlari rasmiy manba bilan solishtirilmagan.
                Darsda foydalanishdan oldin{" "}
                <a href="https://lex.uz" target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                  lex.uz
                </a>{" "}
                orqali tekshiring.
              </div>
            )}
            <ul className="space-y-3">
              {topic.legalBasis.map((l) => (
                <li key={l.id} className="rounded-2xl border border-navy-200 p-4 dark:border-white/[0.08]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="font-semibold text-navy-900 dark:text-white">
                      {l.document}
                      {l.article && <span className="font-normal text-navy-500 dark:text-navy-400"> — {l.article}</span>}
                    </p>
                    <LegalStatusBadge status={l.status} />
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{l.summary}</p>
                </li>
              ))}
            </ul>
            <a
              href="https://lex.uz"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              Rasmiy matnni lex.uz’da ko‘rish <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Section>

          <Section id="misol" title="Hayotiy misol" icon={Target}>
            <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-brand-50 p-5 dark:from-sky-400/[0.06] dark:to-brand-400/[0.06]">
              <p className="leading-relaxed text-navy-700 dark:text-navy-200">{topic.example}</p>
            </div>
          </Section>

          <Section id="tahlil" title="Vaziyat tahlili" icon={MessageCircleQuestion}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold tracking-wide text-navy-500 uppercase dark:text-navy-400">Vaziyat</p>
                <p className="mt-1 leading-relaxed text-navy-700 dark:text-navy-200">{topic.caseStudy.situation}</p>
              </div>
              <div className="rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 p-4 dark:bg-brand-400/[0.06]">
                <p className="text-xs font-bold tracking-wide text-brand-700 uppercase dark:text-brand-300">Savol</p>
                <p className="mt-1 font-semibold text-navy-900 dark:text-white">{topic.caseStudy.question}</p>
              </div>
              {showAnalysis ? (
                <div className="rounded-2xl bg-emerald-50 p-4 animate-fade-up dark:bg-emerald-400/[0.07]">
                  <p className="text-xs font-bold tracking-wide text-emerald-700 uppercase dark:text-emerald-300">Tahlil</p>
                  <p className="mt-1 leading-relaxed text-navy-700 dark:text-navy-200">{topic.caseStudy.analysis}</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-navy-300 p-5 text-center dark:border-white/15">
                  <p className="text-sm text-navy-600 dark:text-navy-400">Avval o‘zing o‘ylab ko‘r: sen qanday javob berarding?</p>
                  <Button variant="secondary" className="mt-3" onClick={() => setShowAnalysis(true)}>
                    <Eye className="h-4 w-4" /> Tahlilni ko‘rsatish
                  </Button>
                </div>
              )}
            </div>
          </Section>

          <Section id="xulosa" title="Xulosa" icon={ListChecks}>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {topic.summary.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-2xl bg-navy-50 p-3.5 dark:bg-white/[0.03]">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <span className="text-sm leading-relaxed text-navy-700 dark:text-navy-300">{s}</span>
                </li>
              ))}
            </ul>
            {!completed && (
              <div className="mt-5 flex flex-col items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white sm:flex-row">
                <p className="font-semibold">Mavzuni o‘qib chiqdingmi? Belgilab, +50 XP ol!</p>
                <button
                  onClick={() => completeTopic(topic.id)}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                  O‘rganildi ✓
                </button>
              </div>
            )}
          </Section>

          <section id="test" className="scroll-mt-24">
            <Quiz quizId={topic.id} questions={topic.quiz} title={`Test: ${topic.title}`} />
          </section>

          {scenario && (
            <Link
              href={`/simulyatorlar/${scenario.id}`}
              className="group flex items-center gap-5 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-600 to-brand-700 p-6 text-white shadow-xl shadow-brand-600/20 transition hover:-translate-y-0.5 sm:p-8"
            >
              <span className="text-5xl transition group-hover:scale-110">{scenario.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white/70">Bilimingni amalda sinab ko‘r</p>
                <p className="text-xl font-extrabold">Simulyator: {scenario.title}</p>
                <p className="mt-1 text-sm text-white/80">{scenario.tagline}</p>
              </div>
              <ArrowRight className="h-6 w-6 transition group-hover:translate-x-1" />
            </Link>
          )}

          {/* Oldingi / keyingi */}
          <div className="grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/mavzular/${prev.slug}`} className="card group p-5 transition hover:border-brand-300 dark:hover:border-brand-400/40">
                <p className="flex items-center gap-1 text-xs font-semibold text-navy-500">
                  <ArrowLeft className="h-3.5 w-3.5" /> Oldingi mavzu
                </p>
                <p className="mt-1 font-bold text-navy-900 group-hover:text-brand-600 dark:text-white">{prev.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {nextTopic && (
              <Link href={`/mavzular/${nextTopic.slug}`} className="card group p-5 text-right transition hover:border-brand-300 dark:hover:border-brand-400/40">
                <p className="flex items-center justify-end gap-1 text-xs font-semibold text-navy-500">
                  Keyingi mavzu <ArrowRight className="h-3.5 w-3.5" />
                </p>
                <p className="mt-1 font-bold text-navy-900 group-hover:text-brand-600 dark:text-white">{nextTopic.title}</p>
              </Link>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function Section({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-24 p-6 sm:p-8">
      <h2 className="mb-5 flex items-center gap-3 text-xl font-extrabold text-navy-900 dark:text-white">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-100 text-navy-600 dark:bg-white/5 dark:text-navy-300">
          <Icon className="h-4.5 w-4.5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function TopicSkeleton() {
  return (
    <div className="container-page space-y-6 py-14" aria-busy="true" aria-label="Yuklanmoqda">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-12 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <div className="grid gap-6 pt-6 lg:grid-cols-[240px_1fr]">
        <Skeleton className="hidden h-80 lg:block" />
        <div className="space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </div>
    </div>
  );
}
