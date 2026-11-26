"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Coins, History, Info, Receipt } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { loadResults, percent } from "@/lib/exam-client";
import { formatDate } from "@/lib/utils";
import type { ExamResult } from "@/types/exam";
import { useMarket } from "./useMarket";

export function MyTests() {
  const { pricing, access, catalog, error, refresh, loading } = useMarket();
  const [results, setResults] = useState<ExamResult[]>([]);
  useEffect(() => setResults(loadResults()), []);

  if (loading) return <Skeleton className="h-72" />;
  if (error || !access)
    return (
      <EmptyState
        icon={<AlertCircle className="h-7 w-7" />}
        title="Ma’lumotlarni yuklab bo‘lmadi"
        description={error ?? undefined}
        action={<Button onClick={() => void refresh()}>Qayta urinish</Button>}
      />
    );

  const owned = catalog.filter((e) => e.access === "premium" && access.exams.includes(e.id));
  const productTitle = (id: string) => pricing?.products.find((p) => p.id === id)?.title ?? id;
  const credits = Object.entries(access.credits).filter(([, n]) => n > 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <div className="space-y-10">
        <section>
          <h2 className="text-xl font-bold text-navy-900 dark:text-white">Ochiq premium testlar</h2>
          {owned.length === 0 ? (
            <p className="mt-3 text-navy-500 dark:text-navy-400">
              Hozircha premium test yo‘q.{" "}
              <Link href="/testlar" className="font-semibold text-brand-700 underline dark:text-brand-300">
                Katalogni ko‘ring
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {owned.map((e) => {
                const best = results.filter((r) => r.examId === e.id).reduce((b, r) => Math.max(b, percent(r.correct, r.total)), -1);
                return (
                  <li key={e.id}>
                    <Link href={`/testlar/${e.id}`} className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-navy-900 dark:text-white">{e.title}</span>
                        <span className="text-sm text-navy-500 dark:text-navy-400">{best >= 0 ? `Eng yaxshi natija: ${best}%` : "Hali topshirilmagan"}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand-600" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold text-navy-900 dark:text-white">
            <History className="h-5 w-5" /> Urinishlar tarixi
          </h2>
          {results.length === 0 ? (
            <p className="mt-3 text-navy-500 dark:text-navy-400">Hali test topshirilmagan.</p>
          ) : (
            <div className="card mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-navy-100 text-left text-navy-500 dark:border-white/10 dark:text-navy-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Test</th>
                    <th className="px-4 py-3 font-medium">Sana</th>
                    <th className="px-4 py-3 text-right font-medium">Natija</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {results.map((r) => (
                    <tr key={r.attemptId} className="border-b border-navy-100 last:border-0 dark:border-white/[0.06]">
                      <td className="px-4 py-3 font-medium text-navy-900 dark:text-white">{r.examTitle}</td>
                      <td className="px-4 py-3 text-navy-600 dark:text-navy-400">{formatDate(r.finishedAt)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-navy-900 dark:text-white">
                        {r.correct}/{r.total} · {percent(r.correct, r.total)}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/testlar/natija/${r.attemptId}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">
                          Tahlil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-5">
        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
            <Coins className="h-4 w-4" /> Paket kreditlari
          </h2>
          {credits.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">Kredit yo‘q.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {credits.map(([pid, n]) => (
                <li key={pid} className="flex justify-between">
                  <span className="text-navy-600 dark:text-navy-300">{productTitle(pid)}</span>
                  <b className="text-navy-900 dark:text-white">{n} ta</b>
                </li>
              ))}
            </ul>
          )}
          {credits.length > 0 && <p className="mt-3 text-xs text-navy-500 dark:text-navy-400">Kreditni ishlatish uchun premium test sahifasida «Paketdan ochish» tugmasini bosing.</p>}
          <ButtonLink href="/testlar#paketlar" variant="secondary" size="sm" className="mt-4 w-full">
            Paket sotib olish
          </ButtonLink>
        </div>

        <div className="card p-5">
          <h2 className="flex items-center gap-2 font-bold text-navy-900 dark:text-white">
            <Receipt className="h-4 w-4" /> Xaridlar tarixi
          </h2>
          {access.purchases.length === 0 ? (
            <p className="mt-2 text-sm text-navy-500 dark:text-navy-400">Xaridlar yo‘q.</p>
          ) : (
            <ul className="mt-3 divide-y divide-navy-100 text-sm dark:divide-white/[0.06]">
              {[...access.purchases].reverse().map((p) => (
                <li key={p.orderId} className="py-2.5">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-navy-900 dark:text-white">{p.examId ? catalog.find((e) => e.id === p.examId)?.title ?? "Test" : productTitle(p.productId)}</span>
                    <span className="shrink-0 tabular-nums text-navy-700 dark:text-navy-300">{formatPrice(p.amount)}</span>
                  </div>
                  <p className="text-xs text-navy-500 dark:text-navy-400">{formatDate(p.at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="flex gap-2 px-1 text-xs text-navy-500 dark:text-navy-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Xaridlar va natijalar hozircha shu brauzerga bog‘langan. Akkaunt tizimi qo‘shilgach, ular barcha qurilmalaringizda ko‘rinadi.
        </p>
      </aside>
    </div>
  );
}
