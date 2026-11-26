"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Download, FileSpreadsheet, History, Loader2, Upload, XCircle } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Pill, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { examCategoryLabel } from "@/data/exams";
import { api } from "@/lib/exam-client";
import { MAX_FILE_BYTES, type ImportIssue, type ImportPreview } from "@/lib/test-import";
import { cn, formatDate } from "@/lib/utils";
import { DbNotConfigured } from "./DbStatus";

type PreviewResponse = ImportPreview & { dbConfigured: boolean };
interface Summary {
  batchId: string;
  testsCreated: number;
  questionsImported: number;
  testIds: string[];
  durationMs: number;
  warnings: number;
}
interface Batch {
  id: string;
  file_name: string;
  file_format: string;
  tests_created: number;
  questions_imported: number;
  warnings: unknown[];
  created_at: string;
}

type Step = { kind: "pick" } | { kind: "checking" } | { kind: "preview"; data: PreviewResponse } | { kind: "importing"; data: PreviewResponse } | { kind: "done"; summary: Summary; data: PreviewResponse };

async function postFile(file: File, action: "preview" | "commit") {
  const form = new FormData();
  form.append("file", file);
  form.append("action", action);
  const res = await fetch("/api/admin/import", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

/** Xatolar hisobotini CSV qilib yuklab olish (UTF-8 BOM — Excel o'zbek harflarini to'g'ri ochadi) */
function downloadIssues(issues: ImportIssue[], fileName: string) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "﻿qator,ustun,kod,xabar\r\n" + issues.map((i) => [i.row ?? "", i.column ?? "", i.code, i.message].map((v) => esc(String(v))).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `${fileName.replace(/\.[^.]+$/, "")}-xatolar.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

export function ImportWizard({ onViewTests }: { onViewTests: () => void }) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function check(f: File) {
    setFile(f);
    setError(null);
    if (f.size > MAX_FILE_BYTES) {
      setError(`Fayl ${(f.size / 1024 / 1024).toFixed(1)} MB — ko‘pi bilan ${MAX_FILE_BYTES / 1024 / 1024} MB.`);
      return;
    }
    setStep({ kind: "checking" });
    const { ok, data } = await postFile(f, "preview");
    if (!ok) {
      setError(data.error ?? "Faylni tekshirib bo‘lmadi");
      setStep({ kind: "pick" });
      return;
    }
    setStep({ kind: "preview", data });
  }

  async function confirmImport() {
    if (!file || step.kind !== "preview") return;
    const data = step.data;
    setStep({ kind: "importing", data });
    const res = await postFile(file, "commit");
    if (!res.ok) {
      // Xatoda baza o'zgarmaydi (import_tests bitta tranzaksiya) — yangilangan preview'ni ko'rsatamiz
      toast({ tone: "error", title: "Import bajarilmadi", description: res.data.error ?? "Bazadagi ma’lumotlar o‘zgarmadi." });
      setStep({ kind: "preview", data: res.data.tests ? res.data : data });
      return;
    }
    setStep({ kind: "done", summary: res.data.summary, data });
    setHistoryKey((k) => k + 1);
  }

  function reset() {
    setFile(null);
    setError(null);
    setStep({ kind: "pick" });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      {(step.kind === "pick" || step.kind === "checking") && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-navy-600 dark:text-navy-300">
              Excel (.xlsx) yoki CSV (UTF-8). Har bir qator — bitta savol; bir xil <code>test_title</code> qatorlar bitta testga birlashadi.
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
              if (f) void check(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-14 text-center transition",
              drag ? "border-brand-500 bg-brand-50 dark:bg-brand-400/10" : "border-navy-200 hover:border-brand-400 dark:border-white/15",
            )}
          >
            {step.kind === "checking" ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                <p className="mt-3 font-semibold">«{file?.name}» tekshirilmoqda...</p>
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-10 w-10 text-brand-600 dark:text-brand-400" />
                <p className="mt-3 font-semibold">Faylni shu yerga tashlang yoki tanlang</p>
                <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">.xlsx yoki .csv · {MAX_FILE_BYTES / 1024 / 1024} MB gacha · 5000 qatorgacha</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && void check(e.target.files[0])}
              disabled={step.kind === "checking"}
            />
          </label>
          {error && (
            <p className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">
              <XCircle className="h-4 w-4" /> {error}
            </p>
          )}
        </>
      )}

      {(step.kind === "preview" || step.kind === "importing") && (
        <PreviewPanel data={step.data} busy={step.kind === "importing"} onCancel={reset} onConfirm={confirmImport} />
      )}

      {step.kind === "done" && (
        <div className="card p-6">
          <p className="flex items-center gap-2 text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" /> Import yakunlandi
          </p>
          <dl className="mt-5 grid gap-3 sm:grid-cols-5">
            {(
              [
                ["Yaratilgan testlar", step.summary.testsCreated],
                ["Import qilingan savollar", step.summary.questionsImported],
                ["Xatolar", 0],
                ["Boshqa testlarda ham bor", step.data.warnings.filter((w) => w.code.startsWith("duplicate")).length],
                ["Vaqt", `${(step.summary.durationMs / 1000).toFixed(1)} s`],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="rounded-xl bg-navy-50 p-4 dark:bg-white/[0.04]">
                <dt className="text-xs text-navy-500 dark:text-navy-400">{k}</dt>
                <dd className="mt-1 font-display text-2xl font-extrabold">{v}</dd>
              </div>
            ))}
          </dl>
          {step.summary.warnings > 0 && <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">{step.summary.warnings} ta ogohlantirish (masalan, bo‘sh qatorlar) — import tarixida saqlandi.</p>}
          <p className="mt-4 text-sm text-navy-600 dark:text-navy-300">
            Yangi testlar <b>qoralama</b> holatida — saytda ko‘rinishi uchun «Testlar» bo‘limida tekshirib, «E’lon qilish»ni bosing.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={onViewTests}>Testlarni ko‘rish</Button>
            <Button variant="secondary" onClick={reset}>
              Yana import qilish
            </Button>
          </div>
        </div>
      )}

      <ImportHistory refreshKey={historyKey} />
    </div>
  );
}

function PreviewPanel({ data, busy, onCancel, onConfirm }: { data: PreviewResponse; busy: boolean; onCancel: () => void; onConfirm: () => void }) {
  const [open, setOpen] = useState<number | null>(data.tests.length === 1 ? 0 : null);
  const questions = data.tests.reduce((n, t) => n + t.questions.length, 0);
  const duplicates = [...data.errors, ...data.warnings].filter((e) => e.code.startsWith("duplicate")).length;

  return (
    <div className="space-y-5">
      {!data.dbConfigured && <DbNotConfigured what="faylni tekshirish va preview ishlaydi, bazaga import qilib bo‘lmaydi." />}

      <div className="card flex flex-wrap items-center gap-2 p-4">
        <FileSpreadsheet className="h-5 w-5 text-brand-600" />
        <span className="font-semibold">{data.fileName}</span>
        <Pill>{data.format.toUpperCase()}</Pill>
        <Pill>{data.totalRows} qator</Pill>
        <Pill>{data.tests.length} test</Pill>
        <Pill>{questions} savol</Pill>
        <Pill className={data.errors.length ? "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"}>
          {data.errors.length} xato
        </Pill>
        {duplicates > 0 && <Pill className="bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300">{duplicates} takroriy</Pill>}
        {data.warnings.length > 0 && <Pill>{data.warnings.length} ogohlantirish</Pill>}
      </div>

      {data.errors.length > 0 && <IssueTable title="Xatolar — import qilish uchun tuzating" issues={data.errors} fileName={data.fileName} tone="error" />}
      {data.warnings.length > 0 && <IssueTable title="Ogohlantirishlar" issues={data.warnings} fileName={data.fileName} tone="warning" />}

      <div className="space-y-3">
        {data.tests.map((t, i) => (
          <div key={t.title} className="card overflow-hidden">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full flex-wrap items-center gap-2 p-4 text-left" aria-expanded={open === i}>
              <ChevronDown className={cn("h-4 w-4 transition", open === i && "rotate-180")} />
              <span className="font-bold">{t.title}</span>
              <Pill>{examCategoryLabel[t.category]}</Pill>
              <Pill>{t.questions.length} savol</Pill>
              <Pill>{t.duration_minutes || "?"} daq</Pill>
              <Pill>{t.is_premium ? (t.price ? formatPrice(t.price) : "Premium · standart narx") : "Bepul"}</Pill>
              <span className="ml-auto text-xs text-navy-500">{t.firstRow}-qatordan</span>
            </button>
            {open === i && (
              <div className="overflow-x-auto border-t border-navy-100 dark:border-white/10">
                {t.description && <p className="px-4 pt-3 text-sm text-navy-600 dark:text-navy-300">{t.description}</p>}
                <table className="w-full min-w-[900px] text-sm">
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
                      <tr key={q.row} className="border-t border-navy-100 dark:border-white/[0.06]">
                        <td className="px-4 py-3 tabular-nums text-navy-500">{q.row}</td>
                        <td className="max-w-xs px-4 py-3">
                          <Pill className="mb-1">{q.question_type}</Pill>
                          <p>{q.question_text}</p>
                        </td>
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
                        <td className="max-w-xs px-4 py-3 text-navy-600 dark:text-navy-300">{q.explanation || <span className="text-amber-600">izohsiz</span>}</td>
                        <td className="px-4 py-3 text-navy-600 dark:text-navy-300">
                          <p>{q.topic ?? "—"}</p>
                          <p className="text-xs">{q.source_title ?? ""}</p>
                          {q.source_url && (
                            <a href={q.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-700 underline dark:text-brand-300">
                              havola
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-2xl border border-navy-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-navy-900/95">
        <p className="text-sm text-navy-600 dark:text-navy-300">
          {!data.dbConfigured
            ? "Baza ulanmagan — import tugmasi o‘chiq."
            : data.canImport
              ? `${data.tests.length} ta test va ${questions} ta savol qoralama sifatida yaratiladi.`
              : "Avval barcha xatolarni tuzating — import qisman bajarilmaydi."}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Bekor qilish
          </Button>
          <Button onClick={onConfirm} disabled={busy || !data.canImport || !data.dbConfigured}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {busy ? "Import qilinmoqda..." : "Importni tasdiqlash"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function IssueTable({ title, issues, fileName, tone }: { title: string; issues: ImportIssue[]; fileName: string; tone: "error" | "warning" }) {
  const [all, setAll] = useState(false);
  const shown = all ? issues : issues.slice(0, 20);
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
              <th className="py-1 pr-4 font-medium">Qator</th>
              <th className="py-1 pr-4 font-medium">Ustun</th>
              <th className="py-1 font-medium">Muammo</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i, k) => (
              <tr key={k} className="border-t border-black/5 dark:border-white/5">
                <td className="py-1.5 pr-4 font-semibold tabular-nums">{i.row ?? "fayl"}</td>
                <td className="py-1.5 pr-4 font-mono text-xs">{i.column ?? "—"}</td>
                <td className="py-1.5">{i.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {issues.length > 20 && (
        <button onClick={() => setAll((a) => !a)} className="mt-2 text-sm font-semibold underline">
          {all ? "Kamroq ko‘rsatish" : `Yana ${issues.length - 20} tasini ko‘rsatish`}
        </button>
      )}
    </div>
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
        <ul className="mt-3 divide-y divide-navy-100 text-sm dark:divide-white/[0.06]">
          {state.batches.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="font-medium">{b.file_name}</span>
              <span className="text-navy-500 dark:text-navy-400">
                {b.tests_created} test · {b.questions_imported} savol{b.warnings?.length ? ` · ${b.warnings.length} ogohlantirish` : ""} · {formatDate(b.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
