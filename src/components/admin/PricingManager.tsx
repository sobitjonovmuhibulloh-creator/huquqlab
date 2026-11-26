"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Info, Save } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { examCategoryLabel } from "@/data/exams";
import { api } from "@/lib/exam-client";
import { formatDate } from "@/lib/utils";
import type { PricingConfig, Product } from "@/types/exam";

/** Narxlarni boshqarish: server tomonda tekshiriladi va saqlanadi (/api/admin/pricing) */
export function PricingManager() {
  const { toast } = useToast();
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<PricingConfig>("/api/admin/pricing")
      .then(setConfig)
      .catch((e) => setError(e.message));
  }, []);

  function patch(id: string, p: Partial<Product>) {
    setConfig((c) => (c ? { ...c, products: c.products.map((x) => (x.id === id ? { ...x, ...p } : x)) } : c));
  }

  async function save() {
    if (!config) return;
    setSaving(true);
    try {
      setConfig(await api<PricingConfig>("/api/admin/pricing", { method: "PUT", json: config }));
      toast({ tone: "success", title: "Narxlar saqlandi", description: "Katalog va checkout yangi narxlardan foydalanadi." });
    } catch (e) {
      toast({ tone: "error", title: "Saqlanmadi", description: e instanceof Error ? e.message : undefined });
    } finally {
      setSaving(false);
    }
  }

  if (error)
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-sm text-rose-800 dark:bg-rose-400/10 dark:text-rose-200">
        <AlertCircle className="h-4 w-4" /> {error}
      </p>
    );
  if (!config) return <Skeleton className="h-80" />;

  return (
    <div className="space-y-5">
      <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Narx o‘zgarishi faqat yangi buyurtmalarga ta’sir qiladi — avval sotib olingan testlar va kreditlar saqlanib qoladi. Oxirgi o‘zgarish: {formatDate(config.updatedAt)}.
        </p>
      </div>

      <div className="card divide-y divide-navy-100 dark:divide-white/[0.06]">
        {config.products.map((p) => (
          <div key={p.id} className="grid gap-4 p-5 md:grid-cols-[1fr_160px_120px_auto] md:items-end">
            <div>
              <label className="text-xs font-semibold text-navy-500 dark:text-navy-400" htmlFor={`t-${p.id}`}>
                Nomi · <span className="font-mono">{p.id}</span>
              </label>
              <input id={`t-${p.id}`} className="input mt-1" value={p.title} onChange={(e) => patch(p.id, { title: e.target.value })} />
              <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">
                {p.categories.length ? p.categories.map((c) => examCategoryLabel[c]).join(", ") : "Barcha premium testlar"}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 dark:text-navy-400" htmlFor={`p-${p.id}`}>
                Narx (so‘m)
              </label>
              <input
                id={`p-${p.id}`}
                type="number"
                min={1000}
                step={1000}
                className="input mt-1 tabular-nums"
                value={p.price}
                onChange={(e) => patch(p.id, { price: Number(e.target.value) })}
              />
              <p className="mt-1 text-xs text-navy-500 dark:text-navy-400">{formatPrice(p.price || 0)}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-navy-500 dark:text-navy-400" htmlFor={`c-${p.id}`}>
                Testlar soni
              </label>
              <input
                id={`c-${p.id}`}
                type="number"
                min={1}
                className="input mt-1 tabular-nums"
                value={p.credits}
                disabled={p.kind === "single"}
                onChange={(e) => patch(p.id, { credits: Number(e.target.value) })}
              />
            </div>
            <div className="flex gap-4 pb-2.5 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.active} onChange={(e) => patch(p.id, { active: e.target.checked })} /> Faol
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={Boolean(p.highlight)} onChange={(e) => patch(p.id, { highlight: e.target.checked })} /> Ajratish
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saqlanmoqda..." : "Narxlarni saqlash"}
        </Button>
      </div>
    </div>
  );
}
