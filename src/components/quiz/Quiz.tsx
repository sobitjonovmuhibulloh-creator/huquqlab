"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { Button } from "@/components/ui/Button";
import { EmptyState, ProgressBar } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/types";

const letters = ["A", "B", "C", "D"];

interface QuizProps {
  /** Natija progress'ga shu identifikator bilan yoziladi */
  quizId: string;
  questions: QuizQuestion[];
  title?: string;
  onFinish?: (correct: number, total: number) => void;
}

export function Quiz({ quizId, questions, title = "Bilimingni sinab ko‘r", onFinish }: QuizProps) {
  const { progress, recordQuiz } = useProgress();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ correct: number; xp: number } | null>(null);
  const [attempt, setAttempt] = useState(0);

  if (questions.length === 0) {
    return <EmptyState title="Savollar hali qo‘shilmagan" description="O‘qituvchi panelidan ushbu mavzu uchun test savollarini qo‘shish mumkin." />;
  }

  const q = questions[index];
  const best = progress.quizResults[quizId];

  function submit(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
  }

  function next() {
    if (selected === null) return;
    const nextAnswers = [...answers, selected];
    setAnswers(nextAnswers);
    setSelected(null);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    const correct = nextAnswers.filter((a, i) => a === questions[i].correctIndex).length;
    const xp = recordQuiz(quizId, correct, questions.length);
    setResult({ correct, xp });
    onFinish?.(correct, questions.length);
  }

  function retry() {
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setResult(null);
    setAttempt((a) => a + 1);
  }

  if (result) {
    const pct = Math.round((result.correct / questions.length) * 100);
    const message =
      pct === 100 ? "Mukammal! Sen bu mavzuni a’lo darajada bilasan." : pct >= 80 ? "Juda yaxshi natija!" : pct >= 50 ? "Yomon emas! Mavzuni yana bir bor ko‘rib chiq." : "Mavzuni qayta o‘qib, yana urinib ko‘r.";
    return (
      <div className="card overflow-hidden animate-fade-up">
        <div className="relative p-6 text-center sm:p-10">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-500/10 to-transparent" />
          <div className="relative">
            <div className="mx-auto grid h-28 w-28 place-items-center rounded-full animate-pop" style={{ background: `conic-gradient(${pct >= 50 ? "#10b981" : "#f43f5e"} ${pct * 3.6}deg, rgb(148 163 184 / 0.2) 0deg)` }}>
              <div className="grid h-22 w-22 place-items-center rounded-full bg-white dark:bg-slate-900">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{pct}%</span>
              </div>
            </div>
            <h3 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-white">
              {result.correct} / {questions.length} to‘g‘ri javob
            </h3>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{message}</p>
            <p className="mt-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
              {result.xp > 0 ? `+${result.xp} XP qo‘lga kiritildi` : "XP faqat eng yaxshi natija oshganda beriladi"}
            </p>
            <Button onClick={retry} className="mt-6" size="lg">
              <RotateCcw className="h-5 w-5" /> Qayta ishlash
            </Button>
          </div>
        </div>
        <div className="border-t border-slate-200/70 p-6 sm:p-8 dark:border-white/[0.06]">
          <h4 className="font-bold text-slate-900 dark:text-white">Javoblar tahlili</h4>
          <ul className="mt-4 space-y-3">
            {questions.map((question, i) => {
              const ok = answers[i] === question.correctIndex;
              return (
                <li key={question.id} className="flex gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.03]">
                  {ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />}
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900 dark:text-white">{question.question}</p>
                    {!ok && (
                      <p className="mt-1 text-rose-600 dark:text-rose-400">Sizning javobingiz: {question.options[answers[i]]}</p>
                    )}
                    <p className="mt-1 text-emerald-700 dark:text-emerald-400">To‘g‘ri javob: {question.options[question.correctIndex]}</p>
                    <p className="mt-1 text-slate-500 dark:text-slate-400">{question.explanation}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  const isCorrect = selected !== null && selected === q.correctIndex;

  return (
    <div key={attempt} className="card p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-600 dark:text-brand-400">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {index + 1}-savol / {questions.length}
            {best && ` · Eng yaxshi natija: ${best.best}/${best.total}`}
          </p>
        </div>
        <ProgressBar value={(index + (selected !== null ? 1 : 0)) / questions.length} className="max-w-[200px]" label="Test jarayoni" />
      </div>

      <h3 key={q.id} className="mt-6 text-lg font-bold text-slate-900 animate-fade-in sm:text-xl dark:text-white">
        {q.question}
      </h3>

      <div className="mt-5 grid gap-2.5">
        {q.options.map((opt, i) => {
          const chosen = selected === i;
          const correct = i === q.correctIndex;
          const reveal = selected !== null;
          return (
            <button
              key={`${q.id}-${i}`}
              onClick={() => submit(i)}
              disabled={reveal}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 text-left text-sm font-medium transition-all sm:p-4 sm:text-base",
                !reveal && "border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 dark:border-white/10 dark:hover:border-brand-400/50 dark:hover:bg-brand-400/5",
                reveal && correct && "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100",
                reveal && chosen && !correct && "animate-shake border-rose-500 bg-rose-50 text-rose-900 dark:bg-rose-400/10 dark:text-rose-100",
                reveal && !chosen && !correct && "border-slate-200 opacity-50 dark:border-white/10",
                "text-slate-800 dark:text-slate-100",
              )}
            >
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
                  reveal && correct ? "bg-emerald-500 text-white" : reveal && chosen ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
                )}
              >
                {letters[i]}
              </span>
              <span className="flex-1">{opt}</span>
              {reveal && correct && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {reveal && chosen && !correct && <XCircle className="h-5 w-5 text-rose-500" />}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          className={cn(
            "mt-5 rounded-2xl p-4 animate-fade-up",
            isCorrect ? "bg-emerald-50 dark:bg-emerald-400/10" : "bg-rose-50 dark:bg-rose-400/10",
          )}
        >
          <p className={cn("font-bold", isCorrect ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300")}>
            {isCorrect ? "To‘g‘ri! 🎉" : "Noto‘g‘ri javob"}
          </p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{q.explanation}</p>
          <div className="mt-4 flex justify-end">
            <Button onClick={next} autoFocus>
              {index + 1 < questions.length ? (
                <>
                  Keyingi savol <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  Natijani ko‘rish <Trophy className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
