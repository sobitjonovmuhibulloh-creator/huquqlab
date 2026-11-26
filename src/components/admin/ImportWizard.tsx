"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Download, FileSpreadsheet, History, Loader2, Pencil, Settings2, Upload, XCircle } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { examCategoryLabel } from "@/data/exams";
import { api } from "@/lib/exam-client";
import { headerRowIndex, KNOWN_COLUMNS, MAX_FILE_BYTES, type Column, type ImportDefaults, type ImportIssue, type ImportPreview, type ImportSheet } from "@/lib/test-import";
import { cn, formatDate } from "@/lib/utils";
import type { ExamCategory } from "@/types/exam";
import { DbNotConfigured } from "./DbStatus";

interface Workbook {
  fileName: string;
  format: "xlsx" | "csv";
  sheets: ImportSheet[];
  mapping: Record<number, (Column | "")[]>;
  defaults: ImportDefaults;
  sheetAsTitle: boolean;
}
type Preview = ImportPreview & { dbConfigured: boolean };
interface Summary {
  testsCreated: number;
  questionsImported: number;
  durationMs: number;
  warnings: number;
}
interface Batch {
  id: string;
  file_name: string;
  imported_by: string;
  tests_created: number;
  questions_imported: number;
  warnings: unknown[];
  created_at: string;
}

const columnLabel: Record<Column, string> = {
  test_title: "Test nomi",
  test_author: "Muallif",
  test_category: "Kategoriya",
  test_description: "Test tavsifi",
  duration_minutes: "Vaqt (daqiqa)",
  price: "Narx",
  is_premium: "Premium/bepul",
  question_text: "Savol matni",
  question_type: "Savol turi (Y-1/Y-2/O)",
  option_a: "Variant A",
  option_b: "Variant B",
  option_c: "Variant C",
  option_d: "Variant D",
  correct_answer: "To‘g‘ri javob",
  explanation: "Izoh",
  topic: "Mavzu",
  difficulty: "Qiyinlik",
  source_title: "Manba",
  source_url: "Manba havolasi",
  legal_article: "Modda",
  exam_type: "Test turi",
  grade_or_audience: "Kim uchun",
};

const issueKey = (i: { sheet?: string; row: number | null }) => `${i.sheet ?? ""}|${i.row}`;

/** Xatolar hisobotini CSV qilib yuklab olish (UTF-8 BOM — Excel o'zbek harflarini to'g'ri ochadi) */
function downloadIssues(issues: ImportIssue[], fileName: string) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "﻿varaq,qator,ustun,kod,xabar\r\n" + issues.map((i) => [i.sheet ?? "", i.row ?? "", i.column ?? "", i.code, i.message].map((v) => esc(String(v))).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${fileName.replace(/\.[^.]+$/, "")}-xatolar.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportWizard({ onViewTests }: { onViewTests: () => void }) {
  const { toast } = useToast();
  const [workbook, setWorkbook] = useState<Workbook | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [phase, setPhase] = useState<"pick" | "parsing" | "review" | "importing" | "done">("pick");
  const [checking, setChecking] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [editing, setEditing] = useState<{ sheet: number; rowIndex: number; issues: ImportIssue[] } | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const first = useRef(true);

  async function pick(f: File) {
    setError(null);
    if (f.size > MAX_FILE_BYTES) return setError(`Fayl ${(f.size / 1024 / 1024).toFixed(1)} MB — ko‘pi bilan ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
    setPhase("parsing");
    const form = new FormData();
    form.append("file", f);
    form.append("action", "parse");
    const res = await fetch("/api/admin/import", { method: "POST", body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Faylni o‘qib bo‘lmadi");
      return setPhase("pick");
    }
    first.current = true;
    setWorkbook({ ...data.workbook, defaults: { is_premium: true }, sheetAsTitle: true });
    setPreview({ ...data.preview, dbConfigured: data.dbConfigured });
    setPhase("review");
  }

  // Sozlama yoki qator o'zgarsa — serverda qayta tekshirish (kechiktirib)
  useEffect(() => {
    if (!workbook || phase !== "review") return;
    if (first.current) {
      first.current = false;
      return;
    }
    setChecking(true);
    const t = window.setTimeout(async () => {
      try {
        setPreview(await api<Preview>("/api/admin/import/workbook", { method: "POST", json: { workbook, commit: false } }));
      } catch (e) {
        toast({ tone: "error", title: "Tekshirib bo‘lmadi", description: e instanceof Error ? e.message : undefined });
      } finally {
        setChecking(false);
      }
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workbook]);

  async function confirmImport() {
    if (!workbook) return;
    setPhase("importing");
    const res = await fetch("/api/admin/import/workbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workbook, commit: true }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      // Xatoda baza o'zgarmaydi (import_tests bitta tranzaksiya)
      toast({ tone: "error", title: "Import bajarilmadi", description: data.error ?? "Bazadagi ma’lumotlar o‘zgarmadi." });
      if (data.tests) setPreview(data);
      return setPhase("review");
    }
    setSummary(data.summary);
    setPhase("done");
    setHistoryKey((k) => k + 1);
  }

  function reset() {
    setWorkbook(null);
    setPreview(null);
    setSummary(null);
    setError(null);
    setPhase("pick");
    if (inputRef.current) inputRef.current.value = "";
  }

  const update = (patch: Partial<Workbook>) => setWorkbook((w) => (w ? { ...w, ...patch } : w));

  function openEditor(issue: ImportIssue) {
    if (!workbook || issue.row === null) return;
    const sheet = Math.max(0, workbook.sheets.findIndex((s) => (s.name.trim() || undefined) === issue.sheet));
    const rows = workbook.sheets[sheet].rows;
    if (issue.row - 1 >= rows.length || issue.row - 1 <= headerRowIndex(rows)) return;
    setEditing({ sheet, rowIndex: issue.row - 1, issues: (preview?.errors ?? []).filter((e) => issueKey(e) === issueKey(issue)) });
  }

  return (
    <div className="space-y-6">
      {(phase === "pick" || phase === "parsing") && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-navy-600 dark:text-navy-300">
              Excel (.xlsx, bir nechta varaq ham) yoki CSV. Ustun nomlari o‘zbek, rus yoki ingliz tilida bo‘lishi mumkin — avtomatik aniqlanadi, keyin moslashtirasiz. Bazaga faqat tasdiqlaganingizdan keyin yoziladi.
            </p>
            <div className="flex gap-2">
              <a href="/templates/huquqlab-test-import.xlsx" download className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-navy-200 px-3 text-sm font-semibold hover:bg-navy-50 dark:border-white/10 dark:hover:bg-white/5">
                <Download className="h-4 w-4" /> Excel shablon
              </a>
              <a href="/templates/huquqlab-test-import.csv" download className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-navy-200 px-3 text-sm font-semibold hover:bg-navy-50 dark:border-white/10 dark:hover:bg-white/5">
                <Download className="h-4 w-4" /> CSV shablon
              </a>
            </div>
          </div>
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) void pick(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
              drag ? "border-brand-500 bg-brand-50 dark:bg-brand-400/10" : "border-navy-200 hover:border-brand-400 dark:border-white/15",
            )}
          >
            {phase === "parsing" ? (
              <>
                <Loader2 className="h-9 w-9 animate-spin text-brand-600" />
                <p className="mt-3 font-semibold">Fayl o‘qilmoqda...</p>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-9 w-9 text-brand-600 dark:text-brand-400" />
                <p className="mt-3 font-semibold">Faylni shu yerga tashlang yoki tanlang</p>
                <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">.xlsx yoki .csv · {MAX_FILE_BYTES / 1024 / 1024} MB gacha · 5000 qatorgacha</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && void pick(e.target.files[0])}
              disabled={phase === "parsing"}
            />
          </label>
          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">
              <XCircle className="h-4 w-4" /> {error}
            </p>
          )}
        </>
      )}

      {(phase === "review" || phase === "importing") && workbook && preview && (
        <>
          {!preview.dbConfigured && <DbNotConfigured what="faylni tekshirish va preview ishlaydi, bazaga import qilib bo‘lmaydi." />}
          <Settings workbook={workbook} onChange={update} />
          <Report preview={preview} checking={checking} />
          {preview.errors.length > 0 && <IssueTable title="Xatolar — tuzating yoki qatorni tahrirlang" issues={preview.errors} fileName={workbook.fileName} tone="error" onEdit={openEditor} />}
          {preview.warnings.length > 0 && <IssueTable title="Ogohlantirishlar" issues={preview.warnings} fileName={workbook.fileName} tone="warning" />}
          <TestsPreview preview={preview} />
          <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-2xl border border-navy-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-navy-900/95">
            <p className="text-sm text-navy-600 dark:text-navy-300">
              {!preview.dbConfigured
                ? "Baza ulanmagan — import tugmasi o‘chiq."
                : preview.canImport
                  ? `${preview.tests.length} ta test va ${preview.tests.reduce((n, t) => n + t.questions.length, 0)} ta savol qoralama sifatida yaratiladi.`
                  : "Avval barcha xatolarni tuzating — import qisman bajarilmaydi."}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={reset} disabled={phase === "importing"}>
                Bekor qilish
              </Button>
              <Button onClick={confirmImport} disabled={phase === "importing" || checking || !preview.canImport || !preview.dbConfigured}>
                {phase === "importing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {phase === "importing" ? "Import qilinmoqda..." : "Importni tasdiqlash"}
              </Button>
            </div>
          </div>
        </>
      )}

      {phase === "done" && summary && preview && (
        <div className="card p-6">
          <p className="flex items-center gap-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" /> Import yakunlandi
          </p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-4">
            {(
              [
                ["Yaratilgan testlar", summary.testsCreated],
                ["Import qilingan savollar", summary.questionsImported],
                ["Boshqa testlarda ham bor", preview.warnings.filter((w) => w.code.startsWith("duplicate")).length],
                ["Vaqt", `${(summary.durationMs / 1000).toFixed(1)} s`],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-navy-50 p-4 dark:bg-white/[0.04]">
                <dt className="text-xs text-navy-500 dark:text-navy-400">{k}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-sm text-navy-600 dark:text-navy-300">
            Yangi testlar <b>qoralama</b> holatida — saytda ko‘rinishi uchun «Testlar bazasi» bo‘limida «E’lon qilish»ni bosing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={onViewTests}>Testlarni ko‘rish</Button>
            <Button variant="secondary" onClick={reset}>
              Yana import qilish
            </Button>
          </div>
        </div>
      )}

      {editing && workbook && (
        <RowEditor
          workbook={workbook}
          target={editing}
          onClose={() => setEditing(null)}
          onSave={(cells) => {
            const sheets = workbook.sheets.map((s, i) => (i === editing.sheet ? { ...s, rows: s.rows.map((r, k) => (k === editing.rowIndex ? cells : r)) } : s));
            update({ sheets });
            setEditing(null);
          }}
        />
      )}

      <ImportHistory refreshKey={historyKey} />
    </div>
  );
}

function Settings({ workbook, onChange }: { workbook: Workbook; onChange: (p: Partial<Workbook>) => void }) {
  const [open, setOpen] = useState(true);
  const d = workbook.defaults;
  const setD = (p: Partial<ImportDefaults>) => onChange({ defaults: { ...d, ...p } });
  const anyTitle = Object.values(workbook.mapping).some((m) => m.includes("test_title"));
  return (
    <section className="card">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2 p-4 text-left font-bold" aria-expanded={open}>
        <Settings2 className="h-4 w-4" /> Import sozlamalari va ustunlar
        <span className="ml-auto text-sm font-normal text-navy-500">{workbook.fileName}</span>
        <ChevronDown className={cn("h-4 w-4 transition", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-5 border-t border-navy-100 p-4 dark:border-white/10">
          <div>
            <p className="text-sm font-semibold">Faylda bo‘lmagan maydonlar uchun standart qiymatlar</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Kategoriya</span>
                <select className="input" value={d.category ?? ""} onChange={(e) => setD({ category: (e.target.value || undefined) as ExamCategory | undefined })}>
                  <option value="">— fayldan —</option>
                  {Object.entries(examCategoryLabel).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Test turi</span>
                <select className="input" value={d.exam_type ?? ""} onChange={(e) => setD({ exam_type: (e.target.value || undefined) as ImportDefaults["exam_type"] })}>
                  <option value="">Mashq (standart)</option>
                  <option value="mock">Mock imtihon</option>
                  <option value="topic">Mavzu testi</option>
                  <option value="attestation">Attestatsiya</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Vaqt (daqiqa)</span>
                <input className="input" type="number" min={1} max={300} value={d.duration_minutes ?? ""} onChange={(e) => setD({ duration_minutes: e.target.value ? Number(e.target.value) : undefined })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Kirish</span>
                <select className="input" value={d.is_premium === false ? "free" : "premium"} onChange={(e) => setD({ is_premium: e.target.value === "premium", price: e.target.value === "free" ? 0 : undefined })}>
                  <option value="premium">Premium</option>
                  <option value="free">Bepul</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Narx (bo‘sh — standart)</span>
                <input className="input" type="number" min={0} step={500} disabled={d.is_premium === false} value={d.price ?? ""} onChange={(e) => setD({ price: e.target.value ? Number(e.target.value) : undefined })} />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-navy-500">Muallif</span>
                <input className="input" value={d.author ?? ""} onChange={(e) => setD({ author: e.target.value || undefined })} placeholder="HuquqLab tahririyati" />
              </label>
            </div>
            {workbook.format === "xlsx" && workbook.sheets.length > 1 && !anyTitle && (
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" checked={workbook.sheetAsTitle} onChange={(e) => onChange({ sheetAsTitle: e.target.checked })} /> «Test nomi» ustuni yo‘q — har bir varaq nomini test nomi sifatida ishlatish
              </label>
            )}
          </div>

          {workbook.sheets.map((sheet, si) => {
            const header = sheet.rows[headerRowIndex(sheet.rows)] ?? [];
            const mapping = workbook.mapping[si] ?? [];
            return (
              <div key={si}>
                <p className="text-sm font-semibold">
                  Ustunlar{workbook.sheets.length > 1 ? ` — «${sheet.name}» varag‘i` : ""} <span className="font-normal text-navy-500">({sheet.rows.length - headerRowIndex(sheet.rows) - 1} qator)</span>
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {header.map((h, ci) => (
                    <label key={ci} className="flex items-center gap-2 rounded-xl border border-navy-100 p-2 text-sm dark:border-white/10">
                      <span className="w-28 shrink-0 truncate font-medium" title={String(h)}>
                        {String(h) || `${ci + 1}-ustun`}
                      </span>
                      <span className="text-navy-400">→</span>
                      <select
                        className={cn("input h-9 py-0 text-sm", !mapping[ci] && "text-navy-400")}
                        value={mapping[ci] ?? ""}
                        onChange={(e) => {
                          const next = [...mapping];
                          next[ci] = e.target.value as Column | "";
                          onChange({ mapping: { ...workbook.mapping, [si]: next } });
                        }}
                      >
                        <option value="">— e’tiborsiz —</option>
                        {KNOWN_COLUMNS.map((c) => (
                          <option key={c} value={c}>
                            {columnLabel[c]}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Report({ preview, checking }: { preview: Preview; checking: boolean }) {
  const invalidRows = new Set(preview.errors.filter((e) => e.row !== null).map(issueKey)).size;
  const questions = preview.tests.reduce((n, t) => n + t.questions.length, 0);
  const duplicates = [...preview.errors, ...preview.warnings].filter((e) => e.code.startsWith("duplicate")).length;
  const stats: [string, number | string, string?][] = [
    ["Jami qatorlar", preview.totalRows],
    ["Yaroqli savollar", Math.max(0, preview.totalRows - invalidRows), "text-emerald-700 dark:text-emerald-300"],
    ["Xatoli savollar", invalidRows, invalidRows ? "text-rose-700 dark:text-rose-300" : undefined],
    ["Takroriylar", duplicates, duplicates ? "text-amber-700 dark:text-amber-300" : undefined],
    ["Testlar", preview.tests.length],
    ["Importga tayyor", preview.canImport ? `${questions} savol` : "Yo‘q", preview.canImport ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"],
  ];
  return (
    <section className="card p-4" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-bold">
        Tekshiruv hisoboti {checking && <Loader2 className="h-4 w-4 animate-spin text-brand-600" />}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map(([k, v, c]) => (
          <div key={k} className="rounded-xl bg-navy-50 p-3 dark:bg-white/[0.04]">
            <dt className="text-xs text-navy-500 dark:text-navy-400">{k}</dt>
            <dd className={cn("mt-0.5 font-display text-xl font-extrabold", c)}>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TestsPreview({ preview }: { preview: Preview }) {
  const [open, setOpen] = useState<number | null>(preview.tests.length === 1 ? 0 : null);
  const [showAll, setShowAll] = useState(false);
  const tests = showAll ? preview.tests : preview.tests.slice(0, 20);
  return (
    <div className="space-y-2">
      {tests.map((t, i) => (
        <div key={t.title} className="card overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full flex-wrap items-center gap-2 p-3.5 text-left" aria-expanded={open === i}>
            <ChevronDown className={cn("h-4 w-4 transition", open === i && "rotate-180")} />
            <span className="font-bold">{t.title}</span>
            <Pill>{examCategoryLabel[t.category]}</Pill>
            <Pill>{t.questions.length} savol</Pill>
            <Pill>{t.duration_minutes || "?"} daq</Pill>
            <Pill>{t.is_premium ? (t.price ? formatPrice(t.price) : "Premium · standart narx") : "Bepul"}</Pill>
            {t.author && <span className="text-xs text-navy-500">{t.author}</span>}
          </button>
          {open === i && (
            <div className="overflow-x-auto border-t border-navy-100 dark:border-white/10">
              <table className="w-full min-w-[860px] text-sm">
                <thead className="text-left text-xs text-navy-500 dark:text-navy-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Qator</th>
                    <th className="px-4 py-2 font-medium">Savol</th>
                    <th className="px-4 py-2 font-medium">Variantlar / javob</th>
                    <th className="px-4 py-2 font-medium">Izoh</th>
                    <th className="px-4 py-2 font-medium">Mavzu · manba</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {t.questions.map((q) => (
                    <tr key={`${q.sheet}-${q.row}`} className="border-t border-navy-100 dark:border-white/[0.06]">
                      <td className="px-4 py-3 tabular-nums text-navy-500">{q.row}</td>
                      <td className="max-w-sm px-4 py-3 whitespace-pre-line">{q.question_text}</td>
                      <td className="px-4 py-3">
                        <ul className="space-y-0.5">
                          {q.options.map((o) => (
                            <li key={o.label} className={cn(o.is_correct && "font-semibold text-emerald-700 dark:text-emerald-300")}>
                              {o.is_correct ? "✓ " : ""}
                              {q.question_type !== "O" && `${o.label}) `}
                              {o.text}
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="max-w-xs px-4 py-3 text-navy-600 dark:text-navy-300">{q.explanation || <span className="text-navy-400">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-navy-600 dark:text-navy-300">
                        <p>{q.topic ?? "—"}</p>
                        <p>{q.source_title ?? ""}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
      {preview.tests.length > 20 && !showAll && (
        <Button variant="secondary" size="sm" onClick={() => setShowAll(true)}>
          Yana {preview.tests.length - 20} ta testni ko‘rsatish
        </Button>
      )}
    </div>
  );
}

function IssueTable({ title, issues, fileName, tone, onEdit }: { title: string; issues: ImportIssue[]; fileName: string; tone: "error" | "warning"; onEdit?: (i: ImportIssue) => void }) {
  const [all, setAll] = useState(false);
  const shown = all ? issues : issues.slice(0, 15);
  const multiSheet = issues.some((i) => i.sheet);
  return (
    <div className={cn("rounded-2xl border p-4", tone === "error" ? "border-rose-200 bg-rose-50/60 dark:border-rose-400/20 dark:bg-rose-400/[0.05]" : "border-amber-200 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/[0.05]")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-bold">
          {tone === "error" ? <XCircle className="h-4 w-4 text-rose-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />} {title} ({issues.length})
        </p>
        <Button size="sm" variant="secondary" onClick={() => downloadIssues(issues, fileName)}>
          <Download className="h-4 w-4" /> Hisobot (CSV)
        </Button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs text-navy-500">
            <tr>
              {multiSheet && <th className="py-1 pr-4 font-medium">Varaq</th>}
              <th className="py-1 pr-4 font-medium">Qator</th>
              <th className="py-1 pr-4 font-medium">Ustun</th>
              <th className="py-1 font-medium">Muammo</th>
              {onEdit && <th />}
            </tr>
          </thead>
          <tbody>
            {shown.map((i, k) => (
              <tr key={k} className="border-t border-black/5 dark:border-white/5">
                {multiSheet && <td className="py-1.5 pr-4">{i.sheet ?? "—"}</td>}
                <td className="py-1.5 pr-4 font-semibold tabular-nums">{i.row ?? "fayl"}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{i.column ?? "—"}</td>
                <td className="py-1.5">{i.message}</td>
                {onEdit && (
                  <td className="py-1.5 text-right">
                    {i.row !== null && i.code !== "missing_column" && (
                      <button onClick={() => onEdit(i)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-white dark:text-brand-300 dark:hover:bg-white/10">
                        <Pencil className="h-3.5 w-3.5" /> Tahrirlash
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {issues.length > 15 && (
        <button onClick={() => setAll((a) => !a)} className="mt-2 text-sm font-semibold underline">
          {all ? "Kamroq ko‘rsatish" : `Yana ${issues.length - 15} tasini ko‘rsatish`}
        </button>
      )}
    </div>
  );
}

/** Xatoli qatorni import oldidan tahrirlash: faqat shu fayldagi nusxa o'zgaradi */
function RowEditor({ workbook, target, onClose, onSave }: { workbook: Workbook; target: { sheet: number; rowIndex: number; issues: ImportIssue[] }; onClose: () => void; onSave: (cells: unknown[]) => void }) {
  const sheet = workbook.sheets[target.sheet];
  const header = sheet.rows[headerRowIndex(sheet.rows)] ?? [];
  const mapping = workbook.mapping[target.sheet] ?? [];
  const [cells, setCells] = useState<string[]>(() => header.map((_, i) => String(sheet.rows[target.rowIndex]?.[i] ?? "")));
  return (
    <Modal
      open
      onClose={onClose}
      title={`${target.rowIndex + 1}-qatorni tahrirlash${sheet.name ? ` («${sheet.name}»)` : ""}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => onSave(cells)}>Saqlash va qayta tekshirish</Button>
        </>
      }
    >
      <ul className="mb-4 space-y-1 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">
        {target.issues.map((i, k) => (
          <li key={k}>• {i.message}</li>
        ))}
      </ul>
      <div className="grid gap-3 sm:grid-cols-2">
        {header.map((h, i) => {
          const col = mapping[i];
          const hasError = target.issues.some((x) => x.column === col);
          const long = col === "question_text" || col === "explanation" || col === "test_description";
          return (
            <label key={i} className={cn("text-sm", long && "sm:col-span-2")}>
              <span className={cn("mb-1 block font-medium", hasError ? "text-rose-700 dark:text-rose-300" : "text-navy-600 dark:text-navy-300")}>
                {String(h) || `${i + 1}-ustun`} {col ? <span className="font-normal text-navy-400">· {columnLabel[col]}</span> : <span className="font-normal text-navy-400">· e’tiborsiz</span>}
              </span>
              {long ? (
                <textarea className={cn("input min-h-20 py-2", hasError && "border-rose-400")} value={cells[i]} onChange={(e) => setCells(cells.map((c, k) => (k === i ? e.target.value : c)))} />
              ) : (
                <input className={cn("input", hasError && "border-rose-400")} value={cells[i]} onChange={(e) => setCells(cells.map((c, k) => (k === i ? e.target.value : c)))} />
              )}
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-navy-500">O‘zgarish faqat shu importdagi nusxaga tegishli — asl faylingiz o‘zgarmaydi.</p>
    </Modal>
  );
}

function ImportHistory({ refreshKey }: { refreshKey: number }) {
  const [state, setState] = useState<{ dbConfigured: boolean; batches: Batch[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(() => {
    api<{ dbConfigured: boolean; batches: Batch[] }>("/api/admin/import/history")
      .then(setState)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(load, [load, refreshKey]);

  return (
    <section className="card p-5">
      <h3 className="flex items-center gap-2 font-bold">
        <History className="h-4 w-4" /> Import tarixi
      </h3>
      {error ? (
        <p className="mt-2 text-sm text-rose-600">{error}</p>
      ) : !state ? (
        <Skeleton className="mt-3 h-16" />
      ) : !state.dbConfigured ? (
        <p className="mt-2 text-sm text-navy-500">Baza ulanmagan — tarix saqlanmaydi.</p>
      ) : state.batches.length === 0 ? (
        <p className="mt-2 text-sm text-navy-500">Hali import qilinmagan.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-left text-xs text-navy-500">
              <tr>
                <th className="py-1.5 pr-4 font-medium">Fayl</th>
                <th className="py-1.5 pr-4 font-medium">Sana</th>
                <th className="py-1.5 pr-4 font-medium">Kim</th>
                <th className="py-1.5 pr-4 font-medium">Testlar</th>
                <th className="py-1.5 pr-4 font-medium">Savollar</th>
                <th className="py-1.5 font-medium">Holat</th>
              </tr>
            </thead>
            <tbody>
              {state.batches.map((b) => (
                <tr key={b.id} className="border-t border-navy-100 dark:border-white/[0.06]">
                  <td className="py-2 pr-4 font-medium">{b.file_name}</td>
                  <td className="py-2 pr-4 text-navy-500">{formatDate(b.created_at)}</td>
                  <td className="py-2 pr-4">{b.imported_by}</td>
                  <td className="py-2 pr-4 tabular-nums">{b.tests_created}</td>
                  <td className="py-2 pr-4 tabular-nums">{b.questions_imported}</td>
                  <td className="py-2">
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                      Bajarildi{b.warnings?.length ? ` · ${b.warnings.length} ogohl.` : ""}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-navy-500">Muvaffaqiyatsiz importlar bazaga hech narsa yozmaydi, shuning uchun tarixda faqat bajarilganlari turadi.</p>
        </div>
      )}
    </section>
  );
}
