"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Clock, Flag, Grid3x3, Lock, Send } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Pill, ProgressBar, Skeleton } from "@/components/ui/misc";
import { sectionLabel } from "@/data/exams";
import { api, ApiError, clearAttempt, formatDuration, loadAttempt, saveAttempt, saveResult, type SavedAttempt, type StartResponse } from "@/lib/exam-client";
import { cn } from "@/lib/utils";
import type { AnswerValue, ExamMeta, ExamResult } from "@/types/exam";
import { kindLabel, QuestionBody } from "./QuestionBody";

type Phase = { kind: "loading" } | { kind: "error"; message: string; status: number } | { kind: "running" } | { kind: "submitting"; auto: boolean };

const isAnswered = (v: AnswerValue | undefined) => v !== null && v !== undefined && v !== "";

export function ExamRunner({ exam }: { exam: ExamMeta }) {
  const router = useRouter();
  const [confirm, confirmDialog] = useConfirm();
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [attempt, setAttempt] = useState<SavedAttempt | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const submittedRef = useRef(false);

  /* ---- Boshlash yoki tiklash ---- */
  const start = useCallback(async () => {
    setPhase({ kind: "loading" });
    const saved = loadAttempt(exam.id);
    if (saved) {
      setAttempt(saved);
      setPhase({ kind: "running" });
      return;
    }
    try {
      const res = await api<StartResponse>(`/api/exams/${exam.id}/start`, { method: "POST" });
      const fresh: SavedAttempt = { ...res, examId: exam.id, answers: {}, flagged: [], current: 0, clockOffset: res.serverNow - Date.now() };
      saveAttempt(fresh);
      setAttempt(fresh);
      setPhase({ kind: "running" });
    } catch (e) {
      setPhase({ kind: "error", message: e instanceof Error ? e.message : "Xatolik", status: e instanceof ApiError ? e.status : 0 });
    }
  }, [exam.id]);

  useEffect(() => {
    void start();
  }, [start]);

  /* ---- Holatni yangilash + avtomatik saqlash ---- */
  const update = useCallback((patch: Partial<SavedAttempt>) => {
    setAttempt((a) => {
      if (!a) return a;
      const next = { ...a, ...patch };
      saveAttempt(next);
      return next;
    });
  }, []);

  /* ---- Topshirish ---- */
  const submit = useCallback(
    async (auto: boolean) => {
      if (!attempt || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitError(null);
      setPhase({ kind: "submitting", auto });
      try {
        const result = await api<ExamResult>(`/api/exams/${exam.id}/submit`, {
          method: "POST",
          json: { attemptToken: attempt.attemptToken, answers: attempt.answers, auto },
        });
        saveResult(result);
        clearAttempt(exam.id);
        router.replace(`/testlar/natija/${result.attemptId}`);
      } catch (e) {
        submittedRef.current = false;
        setSubmitError(e instanceof Error ? e.message : "Topshirib bo‘lmadi");
        setPhase({ kind: "running" });
      }
    },
    [attempt, exam.id, router],
  );

  /* ---- Taymer (server vaqti bo'yicha) ---- */
  useEffect(() => {
    if (!attempt || phase.kind !== "running") return;
    const tick = () => {
      const left = Math.max(0, Math.round((attempt.deadline - (Date.now() + attempt.clockOffset)) / 1000));
      setRemaining(left);
      if (left === 0) void submit(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [attempt, phase.kind, submit]);

  /* ---- Sahifadan chiqishda ogohlantirish ---- */
  useEffect(() => {
    if (phase.kind !== "running") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [phase.kind]);

  const questions = attempt?.questions ?? [];
  const current = attempt ? Math.min(attempt.current, questions.length - 1) : 0;
  const q = questions[current];
  const answeredCount = questions.filter((x) => isAnswered(attempt?.answers[x.id])).length;

  const go = useCallback((i: number) => {
    update({ current: Math.max(0, Math.min(i, questions.length - 1)) });
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [update, questions.length]);

  const toggleFlag = useCallback(() => {
    if (!attempt || !q) return;
    const flagged = attempt.flagged.includes(q.id) ? attempt.flagged.filter((id) => id !== q.id) : [...attempt.flagged, q.id];
    update({ flagged });
  }, [attempt, q, update]);

  async function askSubmit() {
    if (!attempt) return;
    const unanswered = questions.length - answeredCount;
    const parts = [
      unanswered ? `${unanswered} ta savolga javob berilmagan.` : "Barcha savollarga javob berdingiz.",
      attempt.flagged.length ? `${attempt.flagged.length} ta savol belgilangan.` : "",
      "Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi.",
    ];
    if (await confirm({ title: "Testni topshirasizmi?", description: parts.filter(Boolean).join(" "), confirmLabel: "Topshirish", tone: "primary" })) {
      void submit(false);
    }
  }

  /* ---- Klaviatura: A–D / 1–4 tanlash, ←/→ navigatsiya, F belgilash ---- */
  useEffect(() => {
    if (phase.kind !== "running" || !q) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || e.ctrlKey || e.metaKey || e.altKey || document.querySelector("dialog[open]")) return;
      const key = e.key.toLowerCase();
      const idx = "abcd".indexOf(key) >= 0 ? "abcd".indexOf(key) : "1234".indexOf(key);
      if (idx >= 0 && "options" in q) {
        update({ answers: { ...attempt!.answers, [q.id]: attempt!.answers[q.id] === idx ? null : idx } });
      } else if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (key === "f") toggleFlag();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase.kind, q, attempt, current, go, toggleFlag, update]);

  /* ---------------- Render ---------------- */

  if (phase.kind === "loading") {
    return (
      <div className="container-page space-y-4 py-10">
        <Skeleton className="h-14" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (phase.kind === "error") {
    const locked = phase.status === 402;
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
            {locked ? <Lock className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
          </span>
          <h1 className="mt-4 text-xl font-bold text-navy-900 dark:text-white">{locked ? "Bu premium test" : "Testni boshlab bo‘lmadi"}</h1>
          <p className="mt-2 text-navy-600 dark:text-navy-400">{phase.message}</p>
          <div className="mt-6 flex justify-center gap-2">
            <ButtonLink href={`/testlar/${exam.id}`}>{locked ? "Narx va xarid" : "Test sahifasi"}</ButtonLink>
            {!locked && (
              <Button variant="secondary" onClick={() => void start()}>
                Qayta urinish
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !q) return null;
  const lowTime = remaining <= 300;
  const flagged = attempt.flagged.includes(q.id);

  return (
    <div className="pb-28 lg:pb-12">
      {confirmDialog}

      {/* Yuqori panel */}
      <div className="sticky top-16 z-30 border-b border-navy-200/70 bg-white/90 backdrop-blur-xl dark:border-white/[0.06] dark:bg-navy-950/90">
        <div className="container-page flex h-14 items-center gap-3">
          <Link href={`/testlar/${exam.id}`} className="hidden min-w-0 flex-1 truncate text-sm font-semibold text-navy-900 sm:block dark:text-white" title={exam.title}>
            {exam.title}
          </Link>
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-base font-bold tabular-nums",
              lowTime ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" : "bg-navy-100 text-navy-900 dark:bg-white/10 dark:text-white",
            )}
            role="timer"
            aria-label={`Qolgan vaqt ${formatDuration(remaining)}`}
          >
            <Clock className="h-4 w-4" /> {formatDuration(remaining)}
          </div>
          <div className="hidden w-40 md:block">
            <ProgressBar value={answeredCount / questions.length} label="Javob berilgan savollar" />
          </div>
          <span className="text-sm font-medium text-navy-500 tabular-nums dark:text-navy-400">
            {answeredCount}/{questions.length}
          </span>
          <div className="flex-1 sm:hidden" />
          <Button size="sm" onClick={askSubmit} disabled={phase.kind === "submitting"}>
            <Send className="h-4 w-4" /> <span className="hidden sm:inline">Topshirish</span>
          </Button>
        </div>
      </div>

      {phase.kind === "submitting" && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-navy-950/40 backdrop-blur-sm">
          <div className="card px-8 py-6 text-center">
            <p className="font-semibold text-navy-900 dark:text-white">{phase.auto ? "Vaqt tugadi — test topshirilmoqda..." : "Natijalar hisoblanmoqda..."}</p>
          </div>
        </div>
      )}

      <div className="container-page grid gap-8 pt-6 lg:grid-cols-[1fr_300px]">
        <div>
          {submitError && (
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-200">
              <AlertCircle className="h-4 w-4" /> {submitError} Javoblaringiz saqlangan.
              <Button size="sm" variant="secondary" onClick={() => void submit(false)}>
                Qayta yuborish
              </Button>
            </div>
          )}

          <article className="card p-5 sm:p-7" aria-labelledby="savol-raqami">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <h2 id="savol-raqami" className="mr-1 font-display text-lg font-extrabold text-navy-900 dark:text-white">
                {current + 1}-savol
              </h2>
              <Pill>{kindLabel[q.kind]}</Pill>
              <Pill className="hidden sm:inline-flex">{sectionLabel(q.spec)}</Pill>
              <button
                onClick={toggleFlag}
                aria-pressed={flagged}
                className={cn(
                  "ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition",
                  flagged ? "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300" : "text-navy-500 hover:bg-navy-100 dark:text-navy-400 dark:hover:bg-white/10",
                )}
                title="Keyinroq qaytish uchun belgilash (F)"
              >
                <Flag className={cn("h-4 w-4", flagged && "fill-current")} /> {flagged ? "Belgilangan" : "Belgilash"}
              </button>
            </div>
            <QuestionBody key={q.id} question={q} value={attempt.answers[q.id] ?? null} onChange={(v) => update({ answers: { ...attempt.answers, [q.id]: v } })} />
          </article>

          <div className="mt-5 hidden items-center justify-between lg:flex">
            <Button variant="secondary" onClick={() => go(current - 1)} disabled={current === 0}>
              <ArrowLeft className="h-4 w-4" /> Oldingi
            </Button>
            <p className="text-xs text-navy-400">Klaviatura: A–D tanlash · ← → o‘tish · F belgilash</p>
            {current < questions.length - 1 ? (
              <Button onClick={() => go(current + 1)}>
                Keyingi <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={askSubmit}>
                <Send className="h-4 w-4" /> Topshirish
              </Button>
            )}
          </div>
        </div>

        {/* Savollar navigatori */}
        <aside className={cn("lg:sticky lg:top-36 lg:block lg:self-start", navOpen ? "block" : "hidden")}>
          <Navigator attempt={attempt} current={current} onGo={go} />
        </aside>
      </div>

      {/* Mobil pastki panel */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-200 bg-white/95 backdrop-blur-xl lg:hidden dark:border-white/10 dark:bg-navy-950/95">
        <div className="container-page flex h-16 items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => go(current - 1)} disabled={current === 0} aria-label="Oldingi savol">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen}>
            <Grid3x3 className="h-4 w-4" /> {current + 1} / {questions.length}
          </Button>
          <Button size="sm" onClick={() => (current < questions.length - 1 ? go(current + 1) : askSubmit())} aria-label="Keyingi savol">
            {current < questions.length - 1 ? <ArrowRight className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Navigator({ attempt, current, onGo }: { attempt: SavedAttempt; current: number; onGo: (i: number) => void }) {
  const { questions, answers, flagged } = attempt;
  return (
    <div className="card p-4">
      <p className="text-sm font-semibold text-navy-900 dark:text-white">Savollar</p>
      <div className="mt-3 grid grid-cols-8 gap-1.5 lg:grid-cols-6">
        {questions.map((x, i) => {
          const answered = isAnswered(answers[x.id]);
          const isFlagged = flagged.includes(x.id);
          return (
            <button
              key={x.id}
              onClick={() => onGo(i)}
              aria-current={i === current ? "step" : undefined}
              aria-label={`${i + 1}-savol${answered ? ", javob berilgan" : ""}${isFlagged ? ", belgilangan" : ""}`}
              className={cn(
                "relative grid h-9 place-items-center rounded-lg text-sm font-semibold tabular-nums transition",
                i === current && "ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-navy-900",
                answered ? "bg-brand-600 text-white dark:bg-brand-500" : "bg-navy-100 text-navy-600 hover:bg-navy-200 dark:bg-white/[0.06] dark:text-navy-300",
              )}
            >
              {i + 1}
              {isFlagged && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-navy-900" />}
            </button>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5 text-xs text-navy-500 dark:text-navy-400">
        <p className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-brand-600" /> Javob berilgan
        </p>
        <p className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-navy-200 dark:bg-white/10" /> Javobsiz
        </p>
        <p className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Belgilangan
        </p>
      </div>
    </div>
  );
}
