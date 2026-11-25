"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import type { QuizQuestion, Topic } from "@/types";

const letters = ["A", "B", "C", "D"];

const emptyQuestion = (): QuizQuestion => ({
  id: `q-${Date.now().toString(36)}`,
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  explanation: "",
});

export function QuestionManager() {
  const { topics, saveTopic } = useContent();
  const { toast } = useToast();
  const [topicId, setTopicId] = useState(topics[0]?.id ?? "");
  const [editing, setEditing] = useState<QuizQuestion | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  // Tanlangan mavzu o'chirilgan yoki import qilingan bo'lsa — birinchisiga qaytamiz
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];

  if (topics.length === 0) return <EmptyState title="Mavzular yo‘q" description="Avval mavzu qo‘shing." />;

  async function persist(next: Topic, message: string) {
    try {
      await saveTopic(next);
      toast({ tone: "success", title: message });
      return true;
    } catch (e) {
      toast({ tone: "error", title: "Saqlab bo‘lmadi", description: e instanceof Error ? e.message : undefined });
      return false;
    }
  }

  async function saveQuestion() {
    if (!topic || !editing) return;
    if (editing.question.trim().length < 5) return setError("Savol matnini kiriting");
    if (editing.options.some((o) => !o.trim())) return setError("Barcha 4 ta variantni to‘ldiring");
    if (new Set(editing.options.map((o) => o.trim().toLowerCase())).size < 4) return setError("Variantlar takrorlanmasin");
    if (!editing.explanation.trim()) return setError("To‘g‘ri javob izohini yozing");
    setError(null);
    const cleaned: QuizQuestion = {
      ...editing,
      question: editing.question.trim(),
      options: editing.options.map((o) => o.trim()) as QuizQuestion["options"],
      explanation: editing.explanation.trim(),
    };
    const quiz = isNew ? [...topic.quiz, cleaned] : topic.quiz.map((q) => (q.id === cleaned.id ? cleaned : q));
    if (await persist({ ...topic, quiz }, isNew ? "Savol qo‘shildi" : "Savol yangilandi")) setEditing(null);
  }

  async function remove(id: string) {
    if (!topic) return;
    if (!(await confirm({ title: "Savolni o‘chirasizmi?", description: "Bu amalni ortga qaytarib bo‘lmaydi." }))) return;
    await persist({ ...topic, quiz: topic.quiz.filter((q) => q.id !== id) }, "Savol o‘chirildi");
  }

  return (
    <div className="space-y-5">
      {confirmDialog}
      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="label mb-0 shrink-0" htmlFor="topic-select">
          Mavzu:
        </label>
        <select
          id="topic-select"
          className="input"
          value={topic?.id ?? ""}
          onChange={(e) => {
            setTopicId(e.target.value);
            setEditing(null);
          }}
        >
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.quiz.length} savol)
            </option>
          ))}
        </select>
        <Button
          onClick={() => {
            setEditing(emptyQuestion());
            setIsNew(true);
            setError(null);
          }}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" /> Savol qo‘shish
        </Button>
      </div>

      {editing && (
        <div className="card p-5 animate-fade-up sm:p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-navy-900 dark:text-white">{isNew ? "Yangi savol" : "Savolni tahrirlash"}</h3>
            <Button variant="ghost" size="sm" onClick={() => setEditing(null)} aria-label="Yopish">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <label className="label mt-4" htmlFor="q-text">
            Savol
          </label>
          <textarea id="q-text" rows={2} className="input" value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} />
          <p className="label mt-4">Variantlar (to‘g‘ri javobni belgilang)</p>
          <div className="grid gap-2">
            {editing.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing({ ...editing, correctIndex: i as QuizQuestion["correctIndex"] })}
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold transition",
                    editing.correctIndex === i ? "bg-emerald-500 text-white" : "bg-navy-100 text-navy-600 dark:bg-white/10 dark:text-navy-300",
                  )}
                  aria-label={`${letters[i]} variantini to‘g‘ri javob qilish`}
                  aria-pressed={editing.correctIndex === i}
                >
                  {editing.correctIndex === i ? <CheckCircle2 className="h-5 w-5" /> : letters[i]}
                </button>
                <input
                  className="input"
                  value={opt}
                  placeholder={`${letters[i]} variant`}
                  onChange={(e) => {
                    const options = [...editing.options] as QuizQuestion["options"];
                    options[i] = e.target.value;
                    setEditing({ ...editing, options });
                  }}
                />
              </div>
            ))}
          </div>
          <label className="label mt-4" htmlFor="q-exp">
            Izoh (javobdan keyin ko‘rsatiladi)
          </label>
          <textarea id="q-exp" rows={2} className="input" value={editing.explanation} onChange={(e) => setEditing({ ...editing, explanation: e.target.value })} />
          {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Bekor qilish
            </Button>
            <Button onClick={saveQuestion}>
              <Save className="h-4 w-4" /> Saqlash
            </Button>
          </div>
        </div>
      )}

      {topic && topic.quiz.length === 0 ? (
        <EmptyState title="Bu mavzuda savol yo‘q" description="«Savol qo‘shish» tugmasi orqali birinchi savolni yarating." />
      ) : (
        <ul className="space-y-3">
          {topic?.quiz.map((q, i) => (
            <li key={q.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-navy-900 dark:text-white">
                  <span className="text-navy-400">{i + 1}.</span> {q.question}
                </p>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing({ ...q, options: [...q.options] as QuizQuestion["options"] });
                      setIsNew(false);
                      setError(null);
                    }}
                    aria-label="Tahrirlash"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(q.id)} aria-label="O‘chirish">
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              </div>
              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((o, oi) => (
                  <li
                    key={oi}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm",
                      oi === q.correctIndex
                        ? "bg-emerald-50 font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"
                        : "bg-navy-50 text-navy-600 dark:bg-white/[0.03] dark:text-navy-400",
                    )}
                  >
                    {letters[oi]}. {o}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
