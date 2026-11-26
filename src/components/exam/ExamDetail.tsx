"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, BookOpenCheck, CheckCircle2, Clock, FileQuestion, Gauge, History, Info, PlayCircle, ShieldCheck, Users } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Pill, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { audienceLabel, examCategoryLabel, NATIONAL_FORMAT, sectionLabel } from "@/data/exams";
import { api, loadAttempt, loadResults, percent, type AccessView } from "@/lib/exam-client";
import { productCovers, singlePrice } from "@/lib/market";
import { difficultyLabel, formatDate } from "@/lib/utils";
import type { ExamMeta, ExamResult, PublicQuestion } from "@/types/exam";
import { AccessBadge } from "./ExamCard";
import { BuyButton } from "./MarketView";
import { kindLabel, QuestionBody } from "./QuestionBody";
import { useMarket } from "./useMarket";

export function ExamDetail({ exam }: { exam: ExamMeta }) {
  const router = useRouter();
  const { toast } = useToast();
  const { pricing, access, setAccess, error, loading } = useMarket();
  const [preview, setPreview] = useState<PublicQuestion[] | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [resumable, setResumable] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const available = exam.status === "available";
  const owned = exam.access === "free" || Boolean(access?.exams.includes(exam.id));
  const price = pricing ? singlePrice(pricing.products, exam) : undefined;
  const usableCredits =
    access && pricing
      ? Object.entries(access.credits).reduce((n, [pid, c]) => {
          const p = pricing.products.find((x) => x.id === pid);
          return p && productCovers(p, exam) ? n + c : n;
        }, 0)
      : 0;

  useEffect(() => {
    setHistory(loadResults().filter((r) => r.examId === exam.id));
    setResumable(Boolean(loadAttempt(exam.id)));
    if (!available || exam.previewCount === 0) return;
    api<{ questions: PublicQuestion[] }>(`/api/exams/${exam.id}/preview`)
      .then((d) => setPreview(d.questions))
      .catch((e) => setPreviewError(e.message));
  }, [exam.id, exam.previewCount, available]);

  async function unlock() {
    setUnlocking(true);
    try {
      setAccess(await api<AccessView>("/api/access/unlock", { method: "POST", json: { examId: exam.id } }));
      toast({ tone: "success", title: "Test ochildi", description: "Paketdan 1 ta kredit ishlatildi." });
    } catch (e) {
      toast({ tone: "error", title: "Ochib bo‘lmadi", description: e instanceof Error ? e.message : undefined });
    } finally {
      setUnlocking(false);
    }
  }

  const best = history.reduce<ExamResult | null>((b, r) => (!b || r.correct / r.total > b.correct / b.total ? r : b), null);
  const isNational = exam.category === "milliy-sertifikat" && exam.questionCount === NATIONAL_FORMAT.total;

  return (
    <div className="pb-16">
      <section className="border-b border-navy-200/70 dark:border-white/[0.06]">
        <div className="container-page py-10 sm:py-12">
          <Link href="/testlar" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-600 dark:text-navy-400">
            <ArrowLeft className="h-4 w-4" /> Test katalogi
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Pill>{examCategoryLabel[exam.category]}</Pill>
            <AccessBadge exam={exam} ownership={exam.access === "free" ? "free" : owned ? "owned" : "locked"} />
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">{exam.title}</h1>
          <p className="mt-3 max-w-2xl text-lg text-navy-600 dark:text-navy-300">{exam.description}</p>
          <dl className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <Meta icon={FileQuestion} label="Savollar" value={`${exam.questionCount} ta`} />
            <Meta icon={Clock} label="Vaqt" value={`${exam.durationMinutes} daqiqa`} />
            <Meta icon={Gauge} label="Daraja" value={difficultyLabel[exam.difficulty]} />
            <Meta icon={Users} label="Kim uchun" value={exam.audience.map((a) => audienceLabel[a]).join(", ")} />
          </dl>
        </div>
      </section>

      <div className="container-page grid gap-10 py-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          {isNational && (
            <section className="card p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-navy-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Rasmiy format bo‘yicha
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["Y-1", NATIONAL_FORMAT.kinds["Y-1"], "Bitta to‘g‘ri javobli yopiq"],
                    ["Y-2", NATIONAL_FORMAT.kinds["Y-2"], "Vaziyatli yopiq"],
                    ["O", NATIONAL_FORMAT.kinds.O, "Qisqa javobli ochiq"],
                  ] as const
                ).map(([k, n, d]) => (
                  <div key={k} className="rounded-xl bg-navy-50 p-4 dark:bg-white/[0.04]">
                    <p className="font-display text-2xl font-extrabold text-navy-900 dark:text-white">{n}</p>
                    <p className="text-sm font-semibold text-navy-700 dark:text-navy-200">{k}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{d}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-navy-600 dark:text-navy-400">
                Format manbasi:{" "}
                <a href={NATIONAL_FORMAT.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 underline dark:text-brand-300">
                  «{NATIONAL_FORMAT.sourceTitle}»
                </a>{" "}
                (Bilimni baholash agentligi). Rasmiy imtihonda ball {NATIONAL_FORMAT.scoring} bilan hisoblanadi — HuquqLab natijasi to‘g‘ri javoblar soni va foizini ko‘rsatadi, rasmiy ballni emas.
              </p>
            </section>
          )}

          <section>
            <h2 className="flex items-center gap-2 text-xl font-bold text-navy-900 dark:text-white">
              <BookOpenCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Savollardan namuna
            </h2>
            {!available ? (
              <p className="mt-3 text-navy-500 dark:text-navy-400">Bu test tayyorlanmoqda. Savollar bazasi tayyor bo‘lgach, namuna shu yerda paydo bo‘ladi.</p>
            ) : previewError ? (
              <p className="mt-3 flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <AlertCircle className="h-4 w-4" /> {previewError}
              </p>
            ) : !preview ? (
              <div className="mt-4 space-y-3">
                <Skeleton className="h-40" />
                <Skeleton className="h-40" />
              </div>
            ) : (
              <ol className="mt-4 space-y-4">
                {preview.map((q, i) => (
                  <li key={q.id} className="card p-5">
                    <div className="mb-3 flex flex-wrap gap-2 text-xs">
                      <Pill>{i + 1}-savol</Pill>
                      <Pill>{kindLabel[q.kind]}</Pill>
                      <Pill>{sectionLabel(q.spec)}</Pill>
                    </div>
                    <QuestionBody question={q} readOnly />
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            {!available ? (
              <>
                <p className="font-display text-xl font-bold text-navy-900 dark:text-white">Tez orada</p>
                <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">Bu testni hozircha sotib olib bo‘lmaydi. Hozircha boshqa tayyor testlardan foydalaning.</p>
                <ButtonLink href="/testlar" variant="secondary" className="mt-5 w-full">
                  Tayyor testlar
                </ButtonLink>
              </>
            ) : loading ? (
              <Skeleton className="h-32" />
            ) : owned ? (
              <>
                <p className="flex items-center gap-2 font-display text-xl font-bold text-navy-900 dark:text-white">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" /> {exam.access === "free" ? "Bepul test" : "Test sizda ochiq"}
                </p>
                <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">
                  {exam.durationMinutes} daqiqalik taymer boshlanadi. Javoblar avtomatik saqlanadi, vaqt tugasa test o‘zi topshiriladi.
                </p>
                <Button size="lg" className="mt-5 w-full" onClick={() => router.push(`/testlar/${exam.id}/yechish`)}>
                  <PlayCircle className="h-5 w-5" /> {resumable ? "Davom ettirish" : history.length ? "Qayta topshirish" : "Testni boshlash"}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-navy-500 dark:text-navy-400">Narxi</p>
                <p className="font-display text-3xl font-extrabold text-navy-900 dark:text-white">{price ? formatPrice(price.price) : "—"}</p>
                <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Bir martalik xarid — test sizda doimiy ochiq qoladi, cheksiz qayta topshirish.</p>
                <div className="mt-5 space-y-2">
                  {usableCredits > 0 && (
                    <Button variant="success" className="w-full" onClick={unlock} disabled={unlocking}>
                      {unlocking ? "Ochilmoqda..." : `Paketdan ochish (${usableCredits} kredit)`}
                    </Button>
                  )}
                  {price && (
                    <BuyButton
                      productId={price.id}
                      examId={price.kind === "single" ? exam.id : undefined}
                      label={price.kind === "single" ? "Sotib olish" : `«${price.title}» sotib olish`}
                      disabledReason={pricing && !pricing.payments.enabled ? pricing.payments.reason : undefined}
                    />
                  )}
                  <ButtonLink href="/testlar#paketlar" variant="ghost" className="w-full">
                    Paketlarni ko‘rish
                  </ButtonLink>
                </div>
                {pricing && !pricing.payments.enabled && <p className="mt-3 text-xs text-navy-500 dark:text-navy-400">{pricing.payments.reason}</p>}
              </>
            )}
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
          </div>

          <div className="card p-5 text-sm">
            <p className="flex items-center gap-2 font-semibold text-navy-900 dark:text-white">
              <History className="h-4 w-4" /> Urinishlaringiz
            </p>
            {history.length === 0 ? (
              <p className="mt-2 text-navy-500 dark:text-navy-400">Hali topshirilmagan.</p>
            ) : (
              <>
                <p className="mt-2 text-navy-600 dark:text-navy-300">
                  {history.length} ta urinish · eng yaxshi natija: <b>{best ? `${best.correct}/${best.total} (${percent(best.correct, best.total)}%)` : "—"}</b>
                </p>
                <ul className="mt-3 space-y-1">
                  {history.slice(0, 5).map((r) => (
                    <li key={r.attemptId}>
                      <Link href={`/testlar/natija/${r.attemptId}`} className="flex justify-between rounded-lg px-2 py-1.5 hover:bg-navy-50 dark:hover:bg-white/5">
                        <span className="text-navy-600 dark:text-navy-400">{formatDate(r.finishedAt)}</span>
                        <span className="font-semibold text-navy-900 dark:text-white">{percent(r.correct, r.total)}%</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <p className="flex gap-2 px-1 text-xs text-navy-500 dark:text-navy-400">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Muallif: {exam.author}. Yangilangan: {formatDate(exam.updatedAt)}. Savollar raqib platformalardan olinmagan.
          </p>
        </aside>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-navy-400" />
      <dt className="text-navy-500 dark:text-navy-400">{label}:</dt>
      <dd className="font-semibold text-navy-900 dark:text-white">{value}</dd>
    </div>
  );
}
