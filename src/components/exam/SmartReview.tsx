"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain, CheckCircle2, Repeat2, RotateCcw, Trophy } from "lucide-react";
import { Chip } from "@/components/topics/TopicsExplorer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { sectionLabel } from "@/data/exams";
import { collectMistakes, loadMastered, loadResults, setMastered, type Mistake } from "@/lib/exam-client";
import { normalizeAnswer } from "@/lib/grading";
import type { AnswerValue } from "@/types/exam";
import { kindLabel, QuestionBody } from "./QuestionBody";
import { ReviewItem } from "./ResultView";

/**
 * Smart Review — barcha urinishlardagi xatolar bir joyda.
 * Faqat real natijalar asosida: oxirgi urinishda to'g'ri yechilgan savol ro'yxatdan chiqadi,
 * mashqda to'g'ri javob berilsa «o'zlashtirildi» deb belgilanadi.
 */
export function SmartReview() {
  const [mistakes, setMistakes] = useState<Mistake[] | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "practice">("list");

  const reload = () => setMistakes(collectMistakes(loadResults(), loadMastered()));
  useEffect(reload, []);

  const sections = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of mistakes ?? []) m.set(x.item.question.spec, (m.get(x.item.question.spec) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [mistakes]);

  const list = (mistakes ?? []).filter((m) => !section || m.item.question.spec === section);
  const repeated = (mistakes ?? []).filter((m) => m.wrongCount > 1).length;

  if (mistakes === null) return <Skeleton className="h-64" />;

  if (mistakes.length === 0) {
    const hasResults = loadResults().length > 0;
    return (
      <EmptyState
        icon={hasResults ? <Trophy className="h-7 w-7" /> : <Brain className="h-7 w-7" />}
        title={hasResults ? "Ochiq xatolar yo‘q" : "Hali test topshirilmagan"}
        description={
          hasResults
            ? "Barcha xatolar ustida ishlangan. Yangi test topshirib bilimingizni tekshiring."
            : "Test topshirganingizdan keyin xato javoblar shu yerda to‘planadi va ularni qayta mashq qilasiz."
        }
        action={<ButtonLink href={hasResults ? "/testlar" : "/testlar/diagnostika"}>{hasResults ? "Testlar katalogi" : "Bepul diagnostik test"}</ButtonLink>}
      />
    );
  }

  if (mode === "practice") {
    return (
      <Practice
        queue={list}
        onExit={() => {
          reload();
          setMode("list");
        }}
      />
    );
  }

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Ochiq xatolar" value={mistakes.length} />
        <Stat label="Takroriy xatolar" value={repeated} hint="2+ marta xato qilingan" />
        <Stat label="Eng zaif bo‘lim" value={sections[0] ? sectionLabel(sections[0][0]) : "—"} small />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Chip active={!section} onClick={() => setSection(null)}>
            Barchasi · {mistakes.length}
          </Chip>
          {sections.map(([s, n]) => (
            <Chip key={s} active={section === s} onClick={() => setSection(section === s ? null : s)}>
              {sectionLabel(s)} · {n}
            </Chip>
          ))}
        </div>
        <Button onClick={() => setMode("practice")} className="shrink-0">
          <Repeat2 className="h-4 w-4" /> Mashqni boshlash ({list.length})
        </Button>
      </div>

      <ol className="mt-6 space-y-4">
        {list.map((m) => (
          <ReviewItem
            key={m.item.question.id}
            item={m.item}
            extra={
              <>
                <span className="text-xs text-navy-500 dark:text-navy-400">{m.examTitle}</span>
                {m.wrongCount > 1 && (
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-400/10 dark:text-rose-300">{m.wrongCount} marta xato</span>
                )}
              </>
            }
          />
        ))}
      </ol>
    </div>
  );
}

function Stat({ label, value, hint, small }: { label: string; value: number | string; hint?: string; small?: boolean }) {
  return (
    <div className="card p-5">
      <p className="text-sm text-navy-500 dark:text-navy-400">{label}</p>
      <p className={small ? "mt-1 font-display text-lg leading-snug font-bold text-navy-900 dark:text-white" : "mt-1 font-display text-3xl font-extrabold text-navy-900 dark:text-white"}>{value}</p>
      {hint && <p className="text-xs text-navy-400">{hint}</p>}
    </div>
  );
}

function Practice({ queue, onExit }: { queue: Mistake[]; onExit: () => void }) {
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState<AnswerValue>(null);
  const [checked, setChecked] = useState<boolean | null>(null);
  const [solved, setSolved] = useState(0);

  const m = queue[i];
  if (!m) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
        <h2 className="mt-4 text-xl font-bold text-navy-900 dark:text-white">Mashq tugadi</h2>
        <p className="mt-2 text-navy-600 dark:text-navy-400">
          {queue.length} ta savoldan {solved} tasini to‘g‘ri yechdingiz — ular «o‘zlashtirildi» deb belgilandi.
        </p>
        <Button className="mt-6" onClick={onExit}>
          Ro‘yxatga qaytish
        </Button>
      </div>
    );
  }

  const q = m.item.question;
  const correctIndex = "options" in q ? "ABCD".indexOf(m.item.correctAnswer[0]) : undefined;

  function check() {
    const ok = "options" in q ? answer === correctIndex : typeof answer === "string" && normalizeAnswer(answer) === normalizeAnswer(m.item.correctAnswer);
    setChecked(ok);
    if (ok) {
      setMastered(q.id, true);
      setSolved((s) => s + 1);
    }
  }

  function next() {
    setI((x) => x + 1);
    setAnswer(null);
    setChecked(null);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="font-semibold text-navy-700 dark:text-navy-300">
          {i + 1} / {queue.length} · {kindLabel[q.kind]}
        </span>
        <Button variant="ghost" size="sm" onClick={onExit}>
          <RotateCcw className="h-4 w-4" /> Chiqish
        </Button>
      </div>
      <div className="card p-6">
        <QuestionBody key={q.id} question={q} value={answer} onChange={checked === null ? setAnswer : undefined} readOnly={checked !== null} reveal={checked !== null ? { correctIndex, correct: checked } : undefined} />
        {checked !== null && (
          <div className={checked ? "mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-200" : "mt-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-900 dark:bg-rose-400/10 dark:text-rose-200"}>
            <p className="font-semibold">{checked ? "To‘g‘ri! Savol o‘zlashtirildi." : `Noto‘g‘ri. To‘g‘ri javob: ${m.item.correctAnswer}`}</p>
            <p className="mt-1">{m.item.explanation}</p>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          {checked === null ? (
            <Button onClick={check} disabled={answer === null || answer === ""}>
              Tekshirish
            </Button>
          ) : (
            <Button onClick={next}>{i + 1 < queue.length ? "Keyingi" : "Yakunlash"}</Button>
          )}
        </div>
      </div>
    </div>
  );
}
