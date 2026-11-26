"use client";

import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { AlertCircle, Check, Layers, ListChecks, RotateCcw, Search, Wallet, X } from "lucide-react";
import { Chip } from "@/components/topics/TopicsExplorer";
import { Button } from "@/components/ui/Button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { audienceLabel, examCategoryLabel } from "@/data/exams";
import { singlePrice } from "@/lib/market";
import { cn, difficultyLabel, normalizeSearch } from "@/lib/utils";
import type { Audience, Difficulty, ExamCategory } from "@/types/exam";
import { ExamCard, type ExamOwnership } from "./ExamCard";
import { useMarket } from "./useMarket";

type AccessFilter = "all" | "free" | "premium" | "owned";

const PAGE = 12;

const audiences = Object.keys(audienceLabel) as Audience[];

export function MarketView() {
  const { pricing, access, catalog, error, refresh, loading, totalCredits } = useMarket();
  const usedCategories = [...new Set(catalog.map((e) => e.category))] as ExamCategory[];
  const [category, setCategory] = useState<ExamCategory | null>(null);
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("all");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const deferredQuery = useDeferredValue(query);

  const ownership = (id: string, free: boolean): ExamOwnership => (free ? "free" : access?.exams.includes(id) ? "owned" : "locked");

  const filtered = useMemo(
    () =>
      catalog
        .filter((e) => !category || e.category === category)
        .filter((e) => !audience || e.audience.includes(audience))
        .filter((e) => !difficulty || e.difficulty === difficulty)
        .filter((e) => {
          const q = normalizeSearch(deferredQuery.trim());
          return !q || normalizeSearch(`${e.title} ${e.description} ${e.author}`).includes(q);
        })
        .filter((e) => {
          if (accessFilter === "free") return e.access === "free";
          if (accessFilter === "premium") return e.access === "premium";
          if (accessFilter === "owned") return e.access === "free" || access?.exams.includes(e.id);
          return true;
        })
        // Tayyor testlar oldinda
        .sort((a, b) => Number(a.status === "coming_soon") - Number(b.status === "coming_soon")),
    [catalog, category, audience, difficulty, deferredQuery, accessFilter, access],
  );

  const bundles = pricing?.products.filter((p) => p.kind === "bundle") ?? [];

  return (
    <div className="space-y-12">
      <section aria-labelledby="katalog">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="katalog" className="text-2xl font-bold text-navy-900 dark:text-white">
              Test katalogi
            </h2>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Har bir test: taymer, savollar navigatsiyasi, batafsil natija va xatolar tahlili.</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/testlar/xatolar"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-navy-200 bg-white px-3.5 text-sm font-semibold text-navy-800 transition hover:bg-navy-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              <RotateCcw className="h-4 w-4" /> Xatolar ustida ishlash
            </Link>
            <Link
              href="/mening-testlarim"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-navy-900 px-3.5 text-sm font-semibold text-white transition hover:bg-navy-800 dark:bg-white dark:text-navy-950"
            >
              <ListChecks className="h-4 w-4" /> Mening testlarim
              {totalCredits > 0 && <span className="rounded-md bg-emerald-500 px-1.5 text-xs text-white">{totalCredits}</span>}
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE);
              }}
              placeholder="Test nomi, mavzu yoki muallif bo‘yicha qidirish"
              className="input h-11 pr-10 pl-10"
              aria-label="Testlarni qidirish"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute top-1/2 right-2.5 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-white/10" aria-label="Qidiruvni tozalash">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Kategoriya">
            <Chip active={!category} onClick={() => setCategory(null)}>
              Barchasi
            </Chip>
            {usedCategories.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                {examCategoryLabel[c]}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", "Hammasi"],
                ["free", "Bepul"],
                ["premium", "Premium"],
                ["owned", "Menga ochiq"],
              ] as const
            ).map(([v, label]) => (
              <Chip key={v} tone="emerald" active={accessFilter === v} onClick={() => setAccessFilter(v)}>
                {label}
              </Chip>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-navy-200 sm:block dark:bg-white/10" />
            <label className="sr-only" htmlFor="audience">
              Kim uchun
            </label>
            <select
              aria-label="Qiyinlik"
              value={difficulty ?? ""}
              onChange={(e) => setDifficulty((e.target.value || null) as Difficulty | null)}
              className="h-9 rounded-full border border-navy-200 bg-white px-3 text-sm font-medium text-navy-700 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200"
            >
              <option value="">Qiyinlik: barchasi</option>
              {(["oson", "o'rta", "murakkab"] as const).map((d) => (
                <option key={d} value={d}>
                  {difficultyLabel[d]}
                </option>
              ))}
            </select>
            <select
              id="audience"
              value={audience ?? ""}
              onChange={(e) => setAudience((e.target.value || null) as Audience | null)}
              className="h-9 rounded-full border border-navy-200 bg-white px-3 text-sm font-medium text-navy-700 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200"
            >
              <option value="">Kim uchun: barchasi</option>
              {audiences.map((a) => (
                <option key={a} value={a}>
                  {audienceLabel[a]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-400/20 dark:bg-rose-400/[0.06] dark:text-rose-200">
            <AlertCircle className="h-4 w-4" /> {error}
            <Button size="sm" variant="secondary" onClick={() => void refresh()}>
              Qayta urinish
            </Button>
          </div>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Mos test topilmadi"
              description="Filtrlarni o‘zgartirib ko‘ring."
              action={
                <Button variant="secondary" onClick={() => (setCategory(null), setAudience(null), setDifficulty(null), setQuery(""), setAccessFilter("all"))}>
                  Filtrlarni tozalash
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, limit).map((e, i) => (
              <ExamCard key={e.id} exam={e} index={i % PAGE} ownership={ownership(e.id, e.access === "free")} price={pricing ? singlePrice(pricing.products, e) : undefined} />
            ))}
          </div>
        )}
        {!loading && filtered.length > limit && (
          <div className="mt-6 flex flex-col items-center gap-1">
            <Button variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
              Yana ko‘rsatish
            </Button>
            <p className="text-xs text-navy-500">
              {Math.min(limit, filtered.length)} / {filtered.length} ta test
            </p>
          </div>
        )}
      </section>

      <section id="paketlar" aria-labelledby="paketlar-title" className="scroll-mt-24">
        <h2 id="paketlar-title" className="flex items-center gap-2 text-2xl font-bold text-navy-900 dark:text-white">
          <Layers className="h-6 w-6 text-brand-600 dark:text-brand-400" /> Paketlar
        </h2>
        <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Paket — testlarni o‘zingiz tanlab ochadigan kreditlar. Kredit test sahifasida «Paketdan ochish» orqali ishlatiladi.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-52" />)
            : bundles.map((p) => {
                const single = pricing?.products.find((x) => x.id === "single");
                const saving = single && p.categories.length === 0 ? single.price * p.credits - p.price : 0;
                return (
                  <div
                    key={p.id}
                    className={cn(
                      "card relative flex flex-col p-6",
                      p.highlight && "border-brand-500 ring-2 ring-brand-500/20 dark:border-brand-400",
                    )}
                  >
                    {p.highlight && (
                      <span className="absolute -top-3 left-6 rounded-full bg-brand-600 px-3 py-1 text-xs font-bold text-white dark:bg-brand-500">Eng foydali</span>
                    )}
                    <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white">{p.title}</h3>
                    <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">{p.description}</p>
                    <p className="mt-5 font-display text-3xl font-extrabold text-navy-900 dark:text-white">{formatPrice(p.price)}</p>
                    <ul className="mt-4 space-y-2 text-sm text-navy-700 dark:text-navy-300">
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-emerald-600" /> {p.credits} ta testni ochish
                      </li>
                      <li className="flex gap-2">
                        <Check className="h-4 w-4 text-emerald-600" /> {p.categories.length ? p.categories.map((c) => examCategoryLabel[c]).join(", ") : "Barcha premium testlar"}
                      </li>
                      {saving > 0 && (
                        <li className="flex gap-2">
                          <Check className="h-4 w-4 text-emerald-600" /> {formatPrice(saving)} tejaysiz
                        </li>
                      )}
                    </ul>
                    <div className="mt-auto pt-6">
                      <BuyButton productId={p.id} disabledReason={pricing && !pricing.payments.enabled ? pricing.payments.reason : undefined} />
                    </div>
                  </div>
                );
              })}
        </div>
        {pricing && !pricing.payments.enabled && (
          <p className="mt-4 flex items-center gap-2 text-sm text-navy-500 dark:text-navy-400">
            <Wallet className="h-4 w-4" /> {pricing.payments.reason}
          </p>
        )}
        {pricing?.payments.enabled && pricing.payments.mock && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            Development rejimi: to‘lovlar sinov (mock) provayderi orqali. Production’da bu rejim o‘chiq.
          </p>
        )}
      </section>
    </div>
  );
}

export function BuyButton({ productId, examId, label = "Sotib olish", disabledReason }: { productId: string; examId?: string; label?: string; disabledReason?: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId, examId }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Xatolik");
      window.location.assign(data.redirectUrl);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xatolik");
      setBusy(false);
    }
  }

  return (
    <div>
      <Button className="w-full" onClick={buy} disabled={busy || Boolean(disabledReason)} title={disabledReason}>
        {busy ? "Yo‘naltirilmoqda..." : label}
      </Button>
      {err && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{err}</p>}
    </div>
  );
}
