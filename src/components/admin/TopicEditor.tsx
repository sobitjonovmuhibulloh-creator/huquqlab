"use client";

import { useState } from "react";
import { Plus, Save, Trash2, X } from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { categories } from "@/data/categories";
import { cn, slugify } from "@/lib/utils";
import { GRADES, type CategoryId, type Grade, type LegalReference, type Topic } from "@/types";

/** Forma uchun qulay ko'rinish: ro'yxatlar matn sifatida tahrirlanadi */
interface Draft {
  id: string;
  title: string;
  slug: string;
  slugTouched: boolean;
  shortDescription: string;
  categoryId: CategoryId;
  grades: Grade[];
  durationMinutes: number;
  difficulty: Topic["difficulty"];
  popular: boolean;
  simulatorId: string;
  intro: string;
  explanation: string;
  concepts: string;
  legalBasis: LegalReference[];
  example: string;
  situation: string;
  question: string;
  analysis: string;
  summary: string;
}

const toDraft = (t?: Topic): Draft => ({
  id: t?.id ?? `t-${Date.now().toString(36)}`,
  title: t?.title ?? "",
  slug: t?.slug ?? "",
  slugTouched: Boolean(t),
  shortDescription: t?.shortDescription ?? "",
  categoryId: t?.categoryId ?? "inson-huquqlari",
  grades: t?.grades ?? [7],
  durationMinutes: t?.durationMinutes ?? 10,
  difficulty: t?.difficulty ?? "oson",
  popular: t?.popular ?? false,
  simulatorId: t?.simulatorId ?? "",
  intro: t?.intro ?? "",
  explanation: t?.explanation.join("\n\n") ?? "",
  concepts: t?.concepts.map((c) => `${c.term} — ${c.definition}`).join("\n") ?? "",
  legalBasis: t?.legalBasis ?? [],
  example: t?.example ?? "",
  situation: t?.caseStudy.situation ?? "",
  question: t?.caseStudy.question ?? "",
  analysis: t?.caseStudy.analysis ?? "",
  summary: t?.summary.join("\n") ?? "",
});

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

function validate(d: Draft): Record<string, string> {
  const e: Record<string, string> = {};
  if (d.title.trim().length < 5) e.title = "Sarlavha kamida 5 ta belgidan iborat bo‘lsin";
  if (!/^[a-z0-9-]+$/.test(d.slug)) e.slug = "Faqat lotin kichik harflari, raqam va «-»";
  if (d.shortDescription.trim().length < 10) e.shortDescription = "Qisqa tavsif kiriting";
  if (d.grades.length === 0) e.grades = "Kamida bitta sinf tanlang";
  if (d.intro.trim().length < 20) e.intro = "Kirish matni juda qisqa";
  if (lines(d.explanation).length === 0) e.explanation = "Tushuntirish kiriting";
  if (lines(d.concepts).some((l) => !l.includes("—") && !l.includes(" - "))) e.concepts = "Har bir qator: «Atama — ta’rif» formatida";
  if (d.legalBasis.some((l) => !l.document.trim())) e.legalBasis = "Har bir manbada hujjat nomi bo‘lishi shart";
  if (lines(d.summary).length === 0) e.summary = "Kamida bitta xulosa yozing";
  return e;
}

export function TopicEditor({ topic, onClose }: { topic?: Topic; onClose: () => void }) {
  const { saveTopic, scenarios } = useContent();
  const { toast } = useToast();
  const [d, setD] = useState<Draft>(() => toDraft(topic));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setD((prev) => ({ ...prev, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(d);
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast({ tone: "error", title: "Formada xatolar bor", description: "Belgilangan maydonlarni to‘g‘rilang." });
      return;
    }
    const result: Topic = {
      id: d.id,
      slug: d.slug,
      title: d.title.trim(),
      shortDescription: d.shortDescription.trim(),
      categoryId: d.categoryId,
      grades: [...d.grades].sort((a, b) => a - b),
      durationMinutes: d.durationMinutes,
      difficulty: d.difficulty,
      popular: d.popular,
      simulatorId: d.simulatorId || undefined,
      intro: d.intro.trim(),
      explanation: d.explanation.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      concepts: lines(d.concepts).map((l) => {
        const [term, ...rest] = l.split(/\s+[—-]\s+/);
        return { term: term.trim(), definition: rest.join(" — ").trim() };
      }),
      legalBasis: d.legalBasis,
      example: d.example.trim(),
      caseStudy: { situation: d.situation.trim(), question: d.question.trim(), analysis: d.analysis.trim() },
      summary: lines(d.summary),
      quiz: topic?.quiz ?? [],
      updatedAt: topic?.updatedAt ?? "",
    };
    setSaving(true);
    try {
      await saveTopic(result);
      toast({ tone: "success", title: topic ? "Mavzu yangilandi" : "Yangi mavzu qo‘shildi", description: result.title });
      onClose();
    } catch (err) {
      toast({ tone: "error", title: "Saqlab bo‘lmadi", description: err instanceof Error ? err.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  const updateLegal = (i: number, patch: Partial<LegalReference>) =>
    set("legalBasis", d.legalBasis.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  return (
    <form onSubmit={submit} className="card animate-fade-up p-5 sm:p-7" noValidate>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{topic ? "Mavzuni tahrirlash" : "Yangi mavzu"}</h3>
        <Button type="button" variant="ghost" size="sm" onClick={onClose} aria-label="Yopish">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Sarlavha" error={errors.title} className="md:col-span-2">
          <input
            className="input"
            value={d.title}
            onChange={(e) => {
              const title = e.target.value;
              setD((p) => ({ ...p, title, slug: p.slugTouched ? p.slug : slugify(title) }));
            }}
            placeholder="Masalan: Bola huquqlari"
          />
        </Field>
        <Field label="Slug (URL manzil)" error={errors.slug} hint={`/mavzular/${d.slug || "..."}`}>
          <input className="input font-mono" value={d.slug} onChange={(e) => setD((p) => ({ ...p, slug: e.target.value, slugTouched: true }))} />
        </Field>
        <Field label="Kategoriya">
          <select className="input" value={d.categoryId} onChange={(e) => set("categoryId", e.target.value as CategoryId)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Qisqa tavsif" error={errors.shortDescription} className="md:col-span-2">
          <input className="input" value={d.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
        </Field>
        <Field label="Sinflar" error={errors.grades}>
          <div className="flex flex-wrap gap-2">
            {GRADES.map((g) => {
              const on = d.grades.includes(g);
              return (
                <button
                  type="button"
                  key={g}
                  onClick={() => set("grades", on ? d.grades.filter((x) => x !== g) : [...d.grades, g])}
                  className={cn(
                    "h-10 w-14 rounded-xl border text-sm font-bold transition",
                    on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-600 dark:border-white/10 dark:text-slate-300",
                  )}
                  aria-pressed={on}
                >
                  {g}
                </button>
              );
            })}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Davomiylik (daq)">
            <input type="number" min={1} max={120} className="input" value={d.durationMinutes} onChange={(e) => set("durationMinutes", Math.max(1, Number(e.target.value) || 1))} />
          </Field>
          <Field label="Qiyinlik">
            <select className="input" value={d.difficulty} onChange={(e) => set("difficulty", e.target.value as Topic["difficulty"])}>
              <option value="oson">Oson</option>
              <option value="o'rta">O‘rta</option>
              <option value="murakkab">Murakkab</option>
            </select>
          </Field>
        </div>
        <Field label="Bog‘liq simulyator">
          <select className="input" value={d.simulatorId} onChange={(e) => set("simulatorId", e.target.value)}>
            <option value="">— Yo‘q —</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-white/10 dark:text-slate-300">
          <input type="checkbox" checked={d.popular} onChange={(e) => set("popular", e.target.checked)} className="h-4 w-4 accent-brand-600" />
          Bosh sahifada «Ommabop» sifatida ko‘rsatish
        </label>

        <Field label="Kirish" error={errors.intro} className="md:col-span-2">
          <textarea rows={3} className="input" value={d.intro} onChange={(e) => set("intro", e.target.value)} />
        </Field>
        <Field label="Sodda tushuntirish" hint="Har bir paragrafni bo‘sh qator bilan ajrating" error={errors.explanation} className="md:col-span-2">
          <textarea rows={6} className="input" value={d.explanation} onChange={(e) => set("explanation", e.target.value)} />
        </Field>
        <Field label="Asosiy tushunchalar" hint="Har bir qator: Atama — ta’rif" error={errors.concepts} className="md:col-span-2">
          <textarea rows={4} className="input" value={d.concepts} onChange={(e) => set("concepts", e.target.value)} />
        </Field>

        <div className="md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="label">Huquqiy asos</span>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() =>
                set("legalBasis", [...d.legalBasis, { id: `lb-${Date.now().toString(36)}`, document: "", summary: "", status: "needs_verification" }])
              }
            >
              <Plus className="h-4 w-4" /> Manba qo‘shish
            </Button>
          </div>
          {errors.legalBasis && <p className="mt-1 text-xs font-medium text-rose-600">{errors.legalBasis}</p>}
          <p className="mt-1 text-xs text-slate-500">
            Rasmiy matn bilan solishtirilmagan modda va tafsilotlarni «Tekshirish talab etiladi» deb belgilang.
          </p>
          <div className="mt-3 space-y-3">
            {d.legalBasis.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500 dark:border-white/15">Manba qo‘shilmagan</p>}
            {d.legalBasis.map((l, i) => (
              <div key={l.id} className="grid gap-2 rounded-2xl border border-slate-200 p-3 sm:grid-cols-[1fr_160px_auto] dark:border-white/10">
                <input className="input" placeholder="Hujjat nomi" value={l.document} onChange={(e) => updateLegal(i, { document: e.target.value })} />
                <input className="input" placeholder="Modda (ixtiyoriy)" value={l.article ?? ""} onChange={(e) => updateLegal(i, { article: e.target.value || undefined })} />
                <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => set("legalBasis", d.legalBasis.filter((_, idx) => idx !== i))} aria-label="Manbani o‘chirish">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
                <input className="input sm:col-span-2" placeholder="Qisqa mazmuni" value={l.summary} onChange={(e) => updateLegal(i, { summary: e.target.value })} />
                <select className="input" value={l.status} onChange={(e) => updateLegal(i, { status: e.target.value as LegalReference["status"] })}>
                  <option value="needs_verification">Tekshirish talab etiladi</option>
                  <option value="verified">Rasmiy hujjat</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <Field label="Hayotiy misol" className="md:col-span-2">
          <textarea rows={3} className="input" value={d.example} onChange={(e) => set("example", e.target.value)} />
        </Field>
        <Field label="Vaziyat tahlili — vaziyat" className="md:col-span-2">
          <textarea rows={2} className="input" value={d.situation} onChange={(e) => set("situation", e.target.value)} />
        </Field>
        <Field label="Vaziyat tahlili — savol">
          <input className="input" value={d.question} onChange={(e) => set("question", e.target.value)} />
        </Field>
        <Field label="Vaziyat tahlili — tahlil">
          <textarea rows={2} className="input" value={d.analysis} onChange={(e) => set("analysis", e.target.value)} />
        </Field>
        <Field label="Xulosa" hint="Har bir qator — alohida punkt" error={errors.summary} className="md:col-span-2">
          <textarea rows={4} className="input" value={d.summary} onChange={(e) => set("summary", e.target.value)} />
        </Field>
      </div>

      <div className="mt-7 flex flex-col-reverse justify-end gap-2 border-t border-slate-200/70 pt-5 sm:flex-row dark:border-white/[0.06]">
        <Button type="button" variant="secondary" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
