"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, XCircle } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/misc";
import { formatPrice } from "@/config/pricing";
import { api } from "@/lib/exam-client";
import type { OrderStatus } from "@/types/exam";

interface OrderView {
  id: string;
  status: OrderStatus;
  claimed: boolean;
  amount: number;
  productTitle: string;
  credits: number;
  exam: { id: string; title?: string } | null;
  mock: boolean;
}

/**
 * Checkout holati: buyurtma ma'lumoti → to'lov → statusni tekshirish → access berish.
 * Access faqat server «paid» deb tasdiqlagandan keyin (/claim) beriladi.
 */
export function CheckoutStatus({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<OrderView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [granted, setGranted] = useState(false);
  const claimedRef = useRef(false);

  const load = useCallback(async () => {
    try {
      const o = await api<OrderView>(`/api/orders/${orderId}`);
      setOrder(o);
      if (o.status === "paid" && !claimedRef.current) {
        claimedRef.current = true;
        await api(`/api/orders/${orderId}/claim`, { method: "POST" });
        setGranted(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Haqiqiy provayderda to'lov tashqarida tasdiqlanadi — holatni davriy tekshiramiz
  useEffect(() => {
    if (order?.status !== "pending" || order.mock) return;
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
  }, [order?.status, order?.mock, load]);

  async function mockPay(outcome: "paid" | "failed") {
    setBusy(true);
    try {
      await api("/api/payments/mock", { method: "POST", json: { orderId, outcome } });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) {
    return (
      <Panel icon={<AlertCircle className="h-7 w-7 text-rose-500" />} title="Buyurtma topilmadi" text={error}>
        <ButtonLink href="/testlar">Testlar katalogi</ButtonLink>
      </Panel>
    );
  }
  if (!order) return <Skeleton className="mx-auto h-72 max-w-lg" />;

  const what = order.exam ? order.exam.title ?? order.exam.id : `${order.productTitle} (${order.credits} ta test)`;

  if (order.status === "paid") {
    return (
      <Panel
        icon={<CheckCircle2 className="h-7 w-7 text-emerald-500" />}
        title={granted || order.claimed ? "To‘lov tasdiqlandi" : "To‘lov tasdiqlandi — access berilmoqda..."}
        text={
          !(granted || order.claimed)
            ? "Bir necha soniya kuting."
            : order.exam
              ? `«${what}» testi sizda ochildi.`
              : `${order.credits} ta kredit hisobingizga qo‘shildi. Testni tanlab «Paketdan ochish» tugmasini bosing.`
        }
      >
        {order.exam ? <ButtonLink href={`/testlar/${order.exam.id}`}>Testga o‘tish</ButtonLink> : <ButtonLink href="/testlar">Test tanlash</ButtonLink>}
        <ButtonLink href="/mening-testlarim" variant="secondary">
          Mening testlarim
        </ButtonLink>
      </Panel>
    );
  }

  if (order.status !== "pending") {
    const label: Record<string, string> = { failed: "To‘lov amalga oshmadi", cancelled: "To‘lov bekor qilindi", expired: "Buyurtma muddati tugadi" };
    return (
      <Panel icon={<XCircle className="h-7 w-7 text-rose-500" />} title={label[order.status] ?? "To‘lov yakunlanmadi"} text="Hisobingizdan pul yechilmagan bo‘lsa, qayta urinib ko‘ring.">
        <ButtonLink href={order.exam ? `/testlar/${order.exam.id}` : "/testlar#paketlar"}>Qayta urinish</ButtonLink>
      </Panel>
    );
  }

  return (
    <div className="card mx-auto max-w-lg p-6 sm:p-8">
      <h1 className="flex items-center gap-2 text-xl font-bold text-navy-900 dark:text-white">
        <CreditCard className="h-5 w-5" /> To‘lov
      </h1>
      <dl className="mt-5 space-y-3 text-sm">
        <Row label="Mahsulot" value={what} />
        <Row label="Summa" value={formatPrice(order.amount)} strong />
        <Row label="Buyurtma" value={order.id.slice(0, 8)} />
      </dl>

      {order.mock ? (
        <div className="mt-6 rounded-2xl border border-dashed border-amber-400 bg-amber-50 p-5 dark:bg-amber-400/[0.06]">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Sinov to‘lovi (faqat development)</p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">Haqiqiy pul yechilmaydi. Production’da bu blok yo‘q — u yerda Click/Payme sahifasi ochiladi.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="success" disabled={busy} onClick={() => void mockPay("paid")}>
              To‘lovni tasdiqlash
            </Button>
            <Button variant="secondary" disabled={busy} onClick={() => void mockPay("failed")}>
              Rad etish
            </Button>
          </div>
        </div>
      ) : (
        <p className="mt-6 flex items-center gap-2 text-sm text-navy-600 dark:text-navy-400">
          <Loader2 className="h-4 w-4 animate-spin" /> To‘lov holati tekshirilmoqda...
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-navy-500 dark:text-navy-400">{label}</dt>
      <dd className={strong ? "font-display text-lg font-extrabold text-navy-900 dark:text-white" : "text-right font-medium text-navy-900 dark:text-white"}>{value}</dd>
    </div>
  );
}

function Panel({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-navy-50 dark:bg-white/5">{icon}</span>
      <h1 className="mt-4 text-xl font-bold text-navy-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-navy-600 dark:text-navy-400">{text}</p>
      {children && <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  );
}
