"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnswerValue, PublicQuestion, QuestionKind } from "@/types/exam";

export const kindLabel: Record<QuestionKind, string> = {
  "Y-1": "Y-1 · yopiq",
  "Y-2": "Y-2 · vaziyatli",
  O: "O · ochiq javob",
};

const LETTERS = "ABCD";

/**
 * Savol matni va javob maydoni.
 * reveal berilsa — to'g'ri/noto'g'ri variantlar ranglanadi (natija va Smart Review uchun).
 */
export function QuestionBody({
  question,
  value = null,
  onChange,
  readOnly,
  reveal,
}: {
  question: PublicQuestion;
  value?: AnswerValue;
  onChange?: (v: AnswerValue) => void;
  readOnly?: boolean;
  reveal?: { correctIndex?: number; correct?: boolean };
}) {
  return (
    <div>
      {question.context && (
        <div className="mb-4 rounded-xl border-l-4 border-brand-500 bg-brand-50/60 p-4 text-[15px] leading-relaxed text-navy-800 dark:bg-brand-400/[0.06] dark:text-navy-200">
          <p className="mb-1 text-xs font-bold tracking-wide text-brand-700 uppercase dark:text-brand-300">Vaziyat</p>
          {question.context}
        </div>
      )}
      <p className="text-[17px] leading-relaxed font-semibold whitespace-pre-line text-navy-900 dark:text-white">{question.prompt}</p>

      {"options" in question ? (
        <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label="Javob variantlari">
          {question.options.map((opt, i) => {
            const selected = value === i;
            const isRight = reveal?.correctIndex === i;
            const isWrongPick = reveal && selected && !isRight;
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={readOnly}
                onClick={() => onChange?.(selected ? null : i)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-[15px] transition",
                  readOnly ? "cursor-default" : "hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-white/[0.03]",
                  isRight
                    ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400/60 dark:bg-emerald-400/10"
                    : isWrongPick
                      ? "border-rose-400 bg-rose-50 dark:border-rose-400/60 dark:bg-rose-400/10"
                      : selected
                        ? "border-brand-600 bg-brand-50 ring-2 ring-brand-500/20 dark:border-brand-400 dark:bg-brand-400/10"
                        : "border-navy-200 bg-white dark:border-white/10 dark:bg-white/[0.02]",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-bold",
                    isRight ? "bg-emerald-600 text-white" : isWrongPick ? "bg-rose-500 text-white" : selected ? "bg-brand-600 text-white dark:bg-brand-500" : "bg-navy-100 text-navy-600 dark:bg-white/10 dark:text-navy-300",
                  )}
                >
                  {isRight ? <Check className="h-4 w-4" /> : isWrongPick ? <X className="h-4 w-4" /> : LETTERS[i]}
                </span>
                <span className="pt-0.5 text-navy-800 dark:text-navy-200">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <label htmlFor={`ans-${question.id}`} className="text-sm font-medium text-navy-600 dark:text-navy-400">
            Javobingiz <span className="text-navy-400">({question.answerHint})</span>
          </label>
          <input
            id={`ans-${question.id}`}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange?.(e.target.value || null)}
            readOnly={readOnly}
            maxLength={200}
            autoComplete="off"
            spellCheck={false}
            placeholder={readOnly ? "Javob shu yerga yoziladi" : "Javobni yozing"}
            className={cn(
              "input mt-2 h-12 text-base",
              reveal && (reveal.correct ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-400/10" : "border-rose-400 bg-rose-50 dark:bg-rose-400/10"),
            )}
          />
        </div>
      )}
    </div>
  );
}
