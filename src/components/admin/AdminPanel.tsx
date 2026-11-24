"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileQuestion,
  Gamepad2,
  LayoutList,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useContent } from "@/components/providers/ContentProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { EmptyState, Pill } from "@/components/ui/misc";
import { categoryById } from "@/data/categories";
import { countEndings, countSteps, getMaxScore, validateScenario } from "@/lib/scenario";
import { cn, formatDate, normalizeSearch } from "@/lib/utils";
import type { Topic } from "@/types";
import { QuestionManager } from "./QuestionManager";
import { TopicEditor } from "./TopicEditor";

const tabs = [
  { id: "topics", label: "Mavzular", icon: LayoutList },
  { id: "questions", label: "Test savollari", icon: FileQuestion },
  { id: "simulators", label: "Simulyatorlar", icon: Gamepad2 },
  { id: "content", label: "Kontent boshqaruvi", icon: Database },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminPanel() {
  const [tab, setTab] = useState<TabId>("topics");

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <b>Demo rejim.</b> Panel parol bilan himoyalangan, lekin kontent o‘zgarishlari hozircha faqat shu brauzerda (localStorage)
          saqlanadi va boshqa foydalanuvchilarga ko‘rinmaydi. Umumiy kontent uchun PostgreSQL + Prisma ulanadi.
        </p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4">
        <div className="card inline-flex min-w-full gap-1 p-1.5 sm:min-w-0" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition",
                tab === t.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-600/20 dark:bg-brand-500"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {tab === "topics" && <TopicManager />}
        {tab === "questions" && <QuestionManager />}
        {tab === "simulators" && <SimulatorList />}
        {tab === "content" && <ContentTools />}
      </div>
    </div>
  );
}

function TopicManager() {
  const { topics, deleteTopic, ready } = useContent();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Topic | "new" | null>(null);
  const [query, setQuery] = useState("");

  const filtered = topics.filter((t) => normalizeSearch(t.title).includes(normalizeSearch(query)));

  async function remove(t: Topic) {
    if (!window.confirm(`«${t.title}» mavzusini o‘chirasizmi?`)) return;
    try {
      await deleteTopic(t.id);
      toast({ tone: "success", title: "Mavzu o‘chirildi" });
    } catch (e) {
      toast({ tone: "error", title: "O‘chirib bo‘lmadi", description: e instanceof Error ? e.message : undefined });
    }
  }

  if (editing) {
    return <TopicEditor topic={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Mavzu qidirish..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Button onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> Mavzu qo‘shish
        </Button>
      </div>

      {!ready ? (
        <p className="text-sm text-slate-500">Yuklanmoqda...</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="Mavzu topilmadi" action={<Button onClick={() => setEditing("new")}>Yangi mavzu</Button>} />
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-white/[0.06]">
          {filtered.map((t) => (
            <div key={t.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <CategoryIcon categoryId={t.categoryId} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{t.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <Pill>{categoryById[t.categoryId]?.name}</Pill>
                    <Pill>{t.grades.join(", ")}-sinf</Pill>
                    <Pill>{t.quiz.length} savol</Pill>
                    {t.legalBasis.some((l) => l.status === "needs_verification") && (
                      <Pill className="bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">Tekshiruv kerak</Pill>
                    )}
                    {t.updatedAt && <Pill>{formatDate(t.updatedAt)}</Pill>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <ButtonLink href={`/mavzular/${t.slug}`} variant="ghost" size="sm">
                  Ko‘rish
                </ButtonLink>
                <Button variant="secondary" size="sm" onClick={() => setEditing(t)}>
                  <Pencil className="h-4 w-4" /> Tahrirlash
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(t)} aria-label="O‘chirish">
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SimulatorList() {
  const { scenarios } = useContent();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {scenarios.map((s) => {
          const errors = validateScenario(s);
          return (
            <div key={s.id} className="card p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{s.title}</p>
                  <p className="font-mono text-xs text-slate-500">{s.id}</p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ["Vaziyat", countSteps(s)],
                  ["Yakun", countEndings(s)],
                  ["Maks. ball", getMaxScore(s)],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 p-2 dark:bg-white/[0.03]">
                    <dd className="text-lg font-extrabold text-slate-900 dark:text-white">{v}</dd>
                    <dt className="text-[11px] text-slate-500">{k}</dt>
                  </div>
                ))}
              </dl>
              <p
                className={cn(
                  "mt-3 flex items-center gap-1.5 text-sm font-semibold",
                  errors.length ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400",
                )}
              >
                {errors.length ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                {errors.length ? `${errors.length} ta xato` : "Ssenariy grafi to‘g‘ri"}
              </p>
              {errors.length > 0 && (
                <ul className="mt-1 list-disc pl-5 text-xs text-rose-600">
                  {errors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              )}
              <ButtonLink href={`/simulyatorlar/${s.id}`} variant="secondary" size="sm" className="mt-4 w-full">
                <Play className="h-4 w-4" /> Sinab ko‘rish
              </ButtonLink>
            </div>
          );
        })}
      </div>
      <div className="card p-5 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-bold text-slate-900 dark:text-white">Yangi simulyator qo‘shish</p>
        <p className="mt-1">
          Simulyatorlar qadamlar grafi sifatida tuzilgan. Yangi ssenariy qo‘shish uchun <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-white/10">src/data/simulators.ts</code>{" "}
          fayliga yangi obyekt qo‘shing — player komponenti avtomatik ishlaydi, bu sahifa esa grafni tekshirib beradi.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs text-slate-100">{`{
  id: "yangi-ssenariy", title: "...", startStepId: "start",
  steps: {
    start: { id: "start", title: "...", narrative: "...",
      choices: [{ id: "a", label: "...",
        outcome: { title, description, legalNote, ethicsNote,
                   points: 30, tone: "good", nextStepId: "keyingi" } }] },
    keyingi: { ... choices: [{ ... outcome: { ..., endingId: "yakun-1" } }] }
  },
  rewards: [{ endingIds: ["yakun-1"], badgeId: "..." }]
}`}</pre>
      </div>
    </div>
  );
}

function ContentTools() {
  const { topics, replaceTopics, resetContent } = useContent();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const questionCount = topics.reduce((n, t) => n + t.quiz.length, 0);
  const unverified = topics.reduce((n, t) => n + t.legalBasis.filter((l) => l.status === "needs_verification").length, 0);

  function exportJson() {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), topics }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `huquqlab-kontent-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ tone: "success", title: "Kontent eksport qilindi" });
  }

  async function importJson(file: File) {
    try {
      const data = JSON.parse(await file.text());
      const list: unknown = Array.isArray(data) ? data : data?.topics;
      if (!Array.isArray(list) || list.length === 0) throw new Error("Faylda mavzular ro‘yxati topilmadi");
      const valid = list.every(
        (t) => t && typeof t.id === "string" && typeof t.slug === "string" && typeof t.title === "string" && Array.isArray(t.quiz) && Array.isArray(t.grades),
      );
      if (!valid) throw new Error("Fayl tuzilmasi noto‘g‘ri (id, slug, title, grades, quiz maydonlari shart)");
      await replaceTopics(list as Topic[]);
      toast({ tone: "success", title: "Import muvaffaqiyatli", description: `${list.length} ta mavzu yuklandi` });
    } catch (e) {
      toast({ tone: "error", title: "Import xatosi", description: e instanceof Error ? e.message : "Noma’lum xato" });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Mavzular", topics.length],
          ["Test savollari", questionCount],
          ["Tekshiruv kerak bo‘lgan manbalar", unverified],
          ["Sinflar", "7–11"],
        ].map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="font-display text-3xl font-extrabold text-slate-900 dark:text-white">{v}</p>
            <p className="text-sm text-slate-500">{k}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <Download className="h-6 w-6 text-brand-600" />
          <p className="mt-3 font-bold text-slate-900 dark:text-white">Eksport (JSON)</p>
          <p className="mt-1 text-sm text-slate-500">Barcha mavzu va savollarni faylga yuklab olish — zaxira yoki boshqa qurilmaga ko‘chirish uchun.</p>
          <Button variant="secondary" className="mt-4 w-full" onClick={exportJson}>
            Yuklab olish
          </Button>
        </div>
        <div className="card p-5">
          <Upload className="h-6 w-6 text-emerald-600" />
          <p className="mt-3 font-bold text-slate-900 dark:text-white">Import (JSON)</p>
          <p className="mt-1 text-sm text-slate-500">Eksport qilingan faylni yuklash. Joriy kontent almashtiriladi.</p>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          <Button variant="secondary" className="mt-4 w-full" onClick={() => fileRef.current?.click()}>
            Fayl tanlash
          </Button>
        </div>
        <div className="card p-5">
          <RotateCcw className="h-6 w-6 text-rose-600" />
          <p className="mt-3 font-bold text-slate-900 dark:text-white">Demo kontentni tiklash</p>
          <p className="mt-1 text-sm text-slate-500">Barcha o‘zgarishlarni bekor qilib, boshlang‘ich demo mavzularni qaytarish.</p>
          {confirmReset ? (
            <div className="mt-4 flex gap-2">
              <Button
                variant="danger"
                className="flex-1"
                onClick={async () => {
                  await resetContent();
                  setConfirmReset(false);
                  toast({ tone: "info", title: "Demo kontent tiklandi" });
                }}
              >
                Tasdiqlash
              </Button>
              <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                Yo‘q
              </Button>
            </div>
          ) : (
            <Button variant="secondary" className="mt-4 w-full" onClick={() => setConfirmReset(true)}>
              Tiklash
            </Button>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">
        Ma’lumotlar bazasi sxemasi: <code>prisma/schema.prisma</code> · Arxitektura: <Link href="/haqida" className="underline">Loyiha haqida</Link>
      </p>
    </div>
  );
}
