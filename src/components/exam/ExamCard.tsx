import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Crown, FileQuestion, Gauge, Lock, Sparkles } from "lucide-react";
import { formatPrice } from "@/config/pricing";
import { examCategoryLabel } from "@/data/exams";
import { cn, difficultyLabel, formatDate } from "@/lib/utils";
import type { ExamMeta, Product } from "@/types/exam";

export type ExamOwnership = "free" | "owned" | "locked";

export function ExamCard({ exam, ownership, price, index = 0 }: { exam: ExamMeta; ownership: ExamOwnership; price?: Product; index?: number }) {
  const soon = exam.status === "coming_soon";
  return (
    <article
      style={{ animationDelay: `${index * 40}ms` }}
      className={cn("card group relative flex flex-col p-5 transition duration-200 animate-fade-up", soon ? "opacity-80" : "hover:-translate-y-0.5 hover:shadow-lg")}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold tracking-wide text-navy-500 uppercase dark:text-navy-400">
          {examCategoryLabel[exam.category]}
          <span
            className={cn(
              "rounded-md px-1.5 py-0.5 text-[10px] tracking-normal normal-case",
              exam.source === "db" ? "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" : "bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300",
            )}
            title={exam.source === "db" ? "Admin yuklagan to‘plamdan" : "HuquqLab tahririyati tayyorlagan"}
          >
            {exam.source === "db" ? "To‘plam" : "HuquqLab"}
          </span>
        </span>
        <AccessBadge exam={exam} ownership={ownership} />
      </div>

      <h3 className="mt-3 font-display text-lg leading-snug font-bold text-navy-900 dark:text-white">
        <Link href={`/testlar/${exam.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {exam.title}
        </Link>
      </h3>
      <p className="mt-1.5 line-clamp-2 text-sm text-navy-600 dark:text-navy-400">{exam.description}</p>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Fact icon={FileQuestion} label="Savollar" value={`${exam.questionCount} ta`} />
        <Fact icon={Clock} label="Vaqt" value={`${exam.durationMinutes} daq`} />
        <Fact icon={Gauge} label="Daraja" value={difficultyLabel[exam.difficulty]} />
      </dl>

      <div className="min-h-5 flex-1" />
      <div className="flex items-end justify-between gap-3 border-t border-navy-100 pt-4 dark:border-white/[0.06]">
        <div className="min-w-0">
          <p className="truncate text-xs text-navy-500 dark:text-navy-400">
            {exam.author} · {formatDate(exam.updatedAt)}
          </p>
          <p className="mt-0.5 font-display text-lg font-extrabold text-navy-900 dark:text-white">
            {soon ? "Narx e’lon qilinadi" : exam.access === "free" ? "Bepul" : ownership === "owned" ? "Sotib olingan" : price ? formatPrice(price.price) : "Premium"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 text-sm font-semibold transition",
            soon ? "text-navy-400" : "text-brand-700 group-hover:gap-2 dark:text-brand-300",
          )}
        >
          {soon ? "Tez orada" : ownership === "locked" ? "Batafsil" : "Boshlash"}
          {!soon && <ArrowRight className="h-4 w-4" />}
        </span>
      </div>
    </article>
  );
}

function Fact({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-navy-50 px-2.5 py-2 dark:bg-white/[0.04]">
      <dt className="flex items-center gap-1 text-navy-500 dark:text-navy-400">
        <Icon className="h-3.5 w-3.5" /> {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-navy-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function AccessBadge({ exam, ownership }: { exam: ExamMeta; ownership: ExamOwnership }) {
  if (exam.status === "coming_soon")
    return <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600 dark:bg-white/10 dark:text-navy-300">Tayyorlanmoqda</span>;
  if (exam.access === "free")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300">
        <Sparkles className="h-3.5 w-3.5" /> Bepul
      </span>
    );
  if (ownership === "owned")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 ring-1 ring-brand-600/15 dark:bg-brand-400/10 dark:text-brand-300">
        <CheckCircle2 className="h-3.5 w-3.5" /> Ochiq
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300">
      {ownership === "locked" ? <Crown className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />} Premium
    </span>
  );
}
