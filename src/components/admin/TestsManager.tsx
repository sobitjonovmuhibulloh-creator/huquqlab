"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Pencil, Search, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, Pill, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { examCategoryLabel } from "@/data/exams";
import { api } from "@/lib/exam-client";
import { cn, difficultyLabel, formatDate, normalizeSearch } from "@/lib/utils";
import type { DbQuestionRow, DbTestRow } from "@/server/exam-repository";
import type { ExamCategory, ExamMeta } from "@/types/exam";
import { DbNotConfigured } from "./DbStatus";

interface ListResponse {
  dbConfigured: boolean;
  dbTests: DbTestRow[];
  staticTests: ExamMeta[];
}

const statusLabel: Record<DbTestRow["status"], string> = { draft: "Qoralama", published: "E’lon qilingan", archived: "Arxiv" };

export function TestsManager() {
  const { toast } = useToast();
  const [confirm, confirmDialog] = useConfirm();
  const [data, setData] = useState<ListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<DbTestRow | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const load = useCallback(() => {
    api<ListResponse>("/api/admin/tests")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  async function patch(id: string, body: Partial<DbTestRow>, okText: string) {
    try {
      await api(`/api/admin/tests/${id}`, { method: "PATCH", json: body });
      toast({ tone: "success", title: okText });
      load();
      return true;
    } catch (e) {
      toast({ tone: "error", title: "Saqlanmadi", description: e instanceof Error ? e.message : undefined });
      return false;
    }
  }

  async function remove(t: DbTestRow) {
    if (!(await confirm({ title: `«${t.title}» o‘chirilsinmi?`, description: `${t.question_count} ta savol ham o‘chadi. Bu amalni qaytarib bo‘lmaydi.` }))) return;
    try {
      await api(`/api/admin/tests/${t.id}`, { method: "DELETE" });
      toast({ tone: "success", title: "Test o‘chirildi" });
      load();
    } catch (e) {
      toast({ tone: "error", title: "O‘chirilmadi", description: e instanceof Error ? e.message : undefined });
    }
  }

  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">{error}</p>;
  if (!data) return <Skeleton className="h-72" />;

  const q = normalizeSearch(query.trim());
  const dbTests = data.dbTests.filter((t) => !q || normalizeSearch(t.title).includes(q));

  return (
    <div className="space-y-6">
      {confirmDialog}
      {!data.dbConfigured && <DbNotConfigured what="bazadagi testlar ro‘yxati bo‘sh; faqat kod ichidagi testlar ko‘rsatiladi." />}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Test nomi bo‘yicha qidirish" className="input pl-10" aria-label="Testlarni qidirish" />
      </div>

      {data.dbConfigured &&
        (dbTests.length === 0 ? (
          <EmptyState title="Bazada test yo‘q" description="«Import» bo‘limi orqali Excel yoki CSV fayldan testlar yuklang." />
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-navy-100 text-left text-xs text-navy-500 dark:border-white/10 dark:text-navy-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Test</th>
                  <th className="px-4 py-3 font-medium">Savollar</th>
                  <th className="px-4 py-3 font-medium">Holat</th>
                  <th className="px-4 py-3 font-medium">Narx</th>
                  <th className="px-4 py-3 font-medium">Yangilangan</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {dbTests.map((t) => (
                  <tr key={t.id} className="border-b border-navy-100 last:border-0 dark:border-white/[0.06]">
                    <td className="px-4 py-3">
                      <p className="font-semibold">{t.title}</p>
                      <p className="text-xs text-navy-500">
                        {examCategoryLabel[t.category]} · {t.duration_minutes} daq · {difficultyLabel[t.difficulty]}
                      </p>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{t.question_count}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold",
                          t.status === "published" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300" : "bg-navy-100 text-navy-600 dark:bg-white/10 dark:text-navy-300",
                        )}
                      >
                        {statusLabel[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">{t.is_premium ? (t.price ? formatPrice(t.price) : "Standart narx") : "Bepul"}</td>
                    <td className="px-4 py-3 text-navy-500">{formatDate(t.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewId(t.id)} title="Preview va savollarni tahrirlash">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(t)} title="Tahrirlash">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {t.status === "published" ? (
                          <Button size="sm" variant="secondary" onClick={() => patch(t.id, { status: "draft" }, "Test nashrdan olindi")}>
                            <EyeOff className="h-4 w-4" /> Nashrdan olish
                          </Button>
                        ) : (
                          <>
                            <Button size="sm" onClick={() => patch(t.id, { status: "published" }, "Test e’lon qilindi — katalogda ko‘rinadi")}>
                              E’lon qilish
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => remove(t)} title="O‘chirish">
                              <Trash2 className="h-4 w-4 text-rose-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

      <section>
        <h3 className="flex items-center gap-2 font-bold">
          <Lock className="h-4 w-4" /> Kod ichidagi testlar <span className="text-sm font-normal text-navy-500">· faqat o‘qish (src/server/questions)</span>
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {data.staticTests
            .filter((t) => !q || normalizeSearch(t.title).includes(q))
            .map((t) => (
              <li key={t.id} className="card flex items-center justify-between gap-3 p-3 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{t.title}</span>
                  <span className="text-xs text-navy-500">
                    {examCategoryLabel[t.category]} · {t.questionCount} savol · {t.access === "free" ? "Bepul" : "Premium"}
                  </span>
                </span>
                <Pill>{t.status === "available" ? "Faol" : "Tez orada"}</Pill>
              </li>
            ))}
        </ul>
      </section>

      {editing && <TestEditor test={editing} onClose={() => setEditing(null)} onSave={async (body) => (await patch(editing.id, body, "Test saqlandi")) && setEditing(null)} />}
      {previewId && <TestPreview id={previewId} onClose={() => (setPreviewId(null), load())} />}
    </div>
  );
}

function TestEditor({ test, onClose, onSave }: { test: DbTestRow; onClose: () => void; onSave: (b: Partial<DbTestRow>) => void }) {
  const [form, setForm] = useState({
    title: test.title,
    description: test.description,
    category: test.category,
    difficulty: test.difficulty,
    duration_minutes: String(test.duration_minutes),
    is_premium: test.is_premium,
    price: test.price === null ? "" : String(test.price),
  });
  const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
  return (
    <Modal
      open
      onClose={onClose}
      title="Testni tahrirlash"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button
            onClick={() =>
              onSave({
                title: form.title,
                description: form.description,
                category: form.category,
                difficulty: form.difficulty,
                duration_minutes: Number(form.duration_minutes),
                is_premium: form.is_premium,
                price: form.is_premium ? (form.price === "" ? null : Number(form.price)) : 0,
              })
            }
          >
            Saqlash
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Nomi">
          <input className="input" value={form.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Tavsif">
          <textarea className="input min-h-20 py-2" value={form.description} onChange={(e) => set({ description: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Kategoriya">
            <select className="input" value={form.category} onChange={(e) => set({ category: e.target.value as ExamCategory })}>
              {Object.entries(examCategoryLabel).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qiyinlik">
            <select className="input" value={form.difficulty} onChange={(e) => set({ difficulty: e.target.value as DbTestRow["difficulty"] })}>
              <option value="oson">Oson</option>
              <option value="o'rta">O‘rta</option>
              <option value="murakkab">Murakkab</option>
            </select>
          </Field>
          <Field label="Davomiylik (daq)">
            <input type="number" min={1} max={300} className="input" value={form.duration_minutes} onChange={(e) => set({ duration_minutes: e.target.value })} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.is_premium} onChange={(e) => set({ is_premium: e.target.checked })} /> Premium (pullik)
          </label>
          <Field label="Narx (so‘m) — bo‘sh: standart narx">
            <input type="number" min={0} step={1000} className="input" disabled={!form.is_premium} value={form.is_premium ? form.price : "0"} onChange={(e) => set({ price: e.target.value })} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-navy-600 dark:text-navy-300">{label}</span>
      {children}
    </label>
  );
}

/** Admin preview: savollar to'g'ri javoblari bilan + tahrirlash */
export function TestPreview({ id, onClose, focusQuestion }: { id: string; onClose: () => void; focusQuestion?: string }) {
  const [data, setData] = useState<{ test: DbTestRow; questions: DbQuestionRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<DbQuestionRow | null>(null);

  const load = useCallback(() => {
    api<{ test: DbTestRow; questions: DbQuestionRow[] }>(`/api/admin/tests/${id}`)
      .then((d) => {
        setData(d);
        if (focusQuestion) setEditing(d.questions.find((q) => q.id === focusQuestion) ?? null);
      })
      .catch((e) => setError(e.message));
  }, [id, focusQuestion]);
  useEffect(load, [load]);

  return (
    <Modal open onClose={onClose} title={data ? data.test.title : "Test"} size="xl">
      {error ? (
        <p className="text-rose-600">{error}</p>
      ) : !data ? (
        <Skeleton className="h-64" />
      ) : (
        <ol className="space-y-3">
          {data.questions.map((q, i) => (
            <li key={q.id} className="rounded-2xl border border-navy-200 p-4 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold">{i + 1}.</span>
                <Pill>{q.question_type}</Pill>
                {q.topic && <Pill>{q.topic}</Pill>}
                <Pill>{difficultyLabel[q.difficulty]}</Pill>
                <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setEditing(q)}>
                  <Pencil className="h-4 w-4" /> Tahrirlash
                </Button>
              </div>
              <p className="mt-2 font-medium">{q.question_text}</p>
              <ul className="mt-2 space-y-0.5 text-sm">
                {[...q.question_options]
                  .sort((a, b) => a.option_label.localeCompare(b.option_label, "en", { numeric: true }))
                  .map((o) => (
                    <li key={o.id} className={cn(o.is_correct && "font-semibold text-emerald-700 dark:text-emerald-300")}>
                      {o.is_correct ? "✓ " : ""}
                      {q.question_type !== "O" && `${o.option_label}) `}
                      {o.option_text}
                    </li>
                  ))}
              </ul>
              {q.explanation && <p className="mt-2 text-sm text-navy-600 dark:text-navy-300">{q.explanation}</p>}
              {(q.source_title || q.source_url) && (
                <p className="mt-1 text-xs text-navy-500">
                  Manba: {q.source_title}
                  {q.legal_article ? `, ${q.legal_article}` : ""} {q.source_url && <a href={q.source_url} target="_blank" rel="noopener noreferrer" className="underline">havola</a>}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      {editing && (
        <QuestionEditor
          question={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </Modal>
  );
}

function QuestionEditor({ question, onClose, onSaved }: { question: DbQuestionRow; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const sorted = [...question.question_options].sort((a, b) => a.option_label.localeCompare(b.option_label, "en", { numeric: true }));
  const isOpen = question.question_type === "O";
  const [form, setForm] = useState({
    question_text: question.question_text,
    explanation: question.explanation,
    topic: question.topic ?? "",
    difficulty: question.difficulty,
    source_title: question.source_title ?? "",
    source_url: question.source_url ?? "",
    legal_article: question.legal_article ?? "",
  });
  const [options, setOptions] = useState(sorted.map((o) => o.option_text));
  const [correct, setCorrect] = useState(Math.max(0, sorted.findIndex((o) => o.is_correct)));
  const [accepted, setAccepted] = useState(sorted.map((o) => o.option_text).join("\n"));
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const opts = isOpen
      ? accepted.split("\n").map((s) => s.trim()).filter(Boolean).map((t, i) => ({ label: `O${i + 1}`, text: t, is_correct: true }))
      : options.map((t, i) => ({ label: "ABCD"[i], text: t, is_correct: i === correct }));
    try {
      await api(`/api/admin/questions/${question.id}`, { method: "PATCH", json: { ...form, options: opts } });
      toast({ tone: "success", title: "Savol saqlandi" });
      onSaved();
    } catch (e) {
      toast({ tone: "error", title: "Saqlanmadi", description: e instanceof Error ? e.message : undefined });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Savolni tahrirlash"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={save} disabled={busy}>
            {busy ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <Field label="Savol matni">
          <textarea className="input min-h-24 py-2" value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} />
        </Field>
        {isOpen ? (
          <Field label="Qabul qilinadigan javoblar (har biri yangi qatorda)">
            <textarea className="input min-h-20 py-2" value={accepted} onChange={(e) => setAccepted(e.target.value)} />
          </Field>
        ) : (
          <fieldset className="grid gap-2">
            <legend className="mb-1 text-sm font-medium text-navy-600 dark:text-navy-300">Variantlar (to‘g‘risini belgilang)</legend>
            {options.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={correct === i} onChange={() => setCorrect(i)} aria-label={`${"ABCD"[i]} to‘g‘ri javob`} />
                <span className="w-5 font-bold">{"ABCD"[i]}</span>
                <input className="input" value={o} onChange={(e) => setOptions(options.map((x, k) => (k === i ? e.target.value : x)))} />
              </div>
            ))}
          </fieldset>
        )}
        <Field label="Izoh">
          <textarea className="input min-h-20 py-2" value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mavzu (masalan, 2.4)">
            <input className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </Field>
          <Field label="Qiyinlik">
            <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as DbQuestionRow["difficulty"] })}>
              <option value="oson">Oson</option>
              <option value="o'rta">O‘rta</option>
              <option value="murakkab">Murakkab</option>
            </select>
          </Field>
          <Field label="Manba nomi">
            <input className="input" value={form.source_title} onChange={(e) => setForm({ ...form, source_title: e.target.value })} />
          </Field>
          <Field label="Modda">
            <input className="input" value={form.legal_article} onChange={(e) => setForm({ ...form, legal_article: e.target.value })} />
          </Field>
        </div>
        <Field label="Manba havolasi (https://…)">
          <input className="input" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}
