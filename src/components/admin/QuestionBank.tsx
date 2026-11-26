"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState, Pill, Skeleton } from "@/components/ui/misc";
import { api } from "@/lib/exam-client";
import { DbNotConfigured } from "./DbStatus";
import { TestPreview } from "./TestsManager";

interface BankRow {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  topic: string | null;
  source_title: string | null;
  tests: { title: string; status: string } | null;
}

/** Savollar banki: bazadagi barcha savollar bo'yicha qidiruv; bosilganda savol tahrirlash oynasi ochiladi */
export function QuestionBank() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<{ dbConfigured: boolean; questions: BankRow[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<BankRow | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      api<{ dbConfigured: boolean; questions: BankRow[] }>(`/api/admin/questions?q=${encodeURIComponent(query.trim())}`)
        .then((d) => {
          setData(d);
          setError(null);
        })
        .catch((e) => setError(e.message));
    }, 250);
    return () => window.clearTimeout(t);
  }, [query]);

  if (error) return <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">{error}</p>;
  if (!data) return <Skeleton className="h-64" />;
  if (!data.dbConfigured) return <DbNotConfigured what="savollar banki bazadan o‘qiladi." />;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Savol matni bo‘yicha qidirish" className="input pl-10" aria-label="Savollarni qidirish" />
      </div>
      {data.questions.length === 0 ? (
        <EmptyState title="Savol topilmadi" description={query ? "Boshqa so‘z bilan qidiring." : "Bazada hali savol yo‘q — «Import» orqali yuklang."} />
      ) : (
        <ul className="card divide-y divide-navy-100 dark:divide-white/[0.06]">
          {data.questions.map((q) => (
            <li key={q.id}>
              <button onClick={() => setOpen(q)} className="w-full px-4 py-3 text-left transition hover:bg-navy-50 dark:hover:bg-white/[0.03]">
                <p className="line-clamp-2 text-sm font-medium">{q.question_text}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Pill>{q.question_type}</Pill>
                  {q.topic && <Pill>{q.topic}</Pill>}
                  <Pill>{q.tests?.title ?? "—"}</Pill>
                  {q.tests?.status !== "published" && <Pill>qoralama</Pill>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {data.questions.length === 100 && <p className="text-xs text-navy-500">Birinchi 100 ta natija ko‘rsatildi — qidiruvni aniqlashtiring.</p>}
      {open && <TestPreview id={open.test_id} focusQuestion={open.id} onClose={() => setOpen(null)} />}
    </div>
  );
}
