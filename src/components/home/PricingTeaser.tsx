"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { api, type PricingView } from "@/lib/exam-client";
import { cn } from "@/lib/utils";

/** Bosh sahifadagi narxlar — admin paneldagi joriy narxlardan (kodga yozilmagan) */
export function PricingTeaser() {
  const [pricing, setPricing] = useState<PricingView | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    api<PricingView>("/api/pricing")
      .then(setPricing)
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;
  if (!pricing)
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );

  const single = pricing.products.find((p) => p.kind === "single" && p.categories.length === 0);
  const plans = [
    { title: "Bepul testlar", price: "0 so‘m", note: "Diagnostika, mavzu testlari", highlight: false, href: "/testlar/diagnostika" },
    ...pricing.products.map((p) => ({
      title: p.title,
      price: formatPrice(p.price),
      note:
        p.kind === "bundle"
          ? `${p.credits} ta test${single && single.price * p.credits > p.price ? ` · ${formatPrice(single.price * p.credits - p.price)} tejaysiz` : ""}`
          : p.categories.length
            ? "Rasmiy formatdagi mock"
            : "Bitta test, doimiy kirish",
      highlight: Boolean(p.highlight),
      href: "/testlar#paketlar",
    })),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {plans.map((p) => (
        <Link key={p.title} href={p.href} className={cn("card p-5 transition hover:-translate-y-0.5 hover:shadow-lg", p.highlight && "border-brand-500 ring-2 ring-brand-500/15")}>
          <p className="text-sm font-semibold text-navy-600 dark:text-navy-300">{p.title}</p>
          <p className="mt-2 font-display text-2xl font-extrabold text-navy-900 dark:text-white">{p.price}</p>
          <p className="mt-2 flex items-start gap-1.5 text-xs text-navy-500 dark:text-navy-400">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /> {p.note}
          </p>
        </Link>
      ))}
    </div>
  );
}
