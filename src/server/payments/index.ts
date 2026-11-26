import "server-only";
import type { Order } from "@/types/exam";

/**
 * To'lov provayderi abstraksiyasi.
 *
 * Haqiqiy provayderni ulash (Click, Payme, Uzum) — docs/ARCHITECTURE.md, «Payments»:
 *  1. Shu interfeysni implement qiling (createPayment → provayder sahifasiga redirect URL).
 *  2. Provayder callback'i uchun route yarating (masalan, /api/payments/click/callback):
 *     imzoni tekshiring, summani buyurtma bilan solishtiring, orderStore.setStatus(id, "paid").
 *  3. getPaymentProvider() ichida PAYMENT_PROVIDER bo'yicha qaytaring.
 * Access faqat order.status === "paid" bo'lganda beriladi (/api/orders/[id]/claim).
 */
export interface PaymentProvider {
  id: string;
  /** Foydalanuvchi to'lov uchun yo'naltiriladigan manzil */
  createPayment(order: Order): Promise<{ redirectUrl: string }>;
}

/** Mock — faqat development. Production'da hech qachon qaytarilmaydi. */
const mockProvider: PaymentProvider = {
  id: "mock",
  async createPayment(order) {
    return { redirectUrl: `/tolov/${order.id}` };
  },
};

export function isMockPaymentsAllowed() {
  return process.env.NODE_ENV !== "production" && (process.env.PAYMENT_PROVIDER ?? "mock") === "mock";
}

export function getPaymentProvider(): { provider: PaymentProvider } | { provider: null; reason: string } {
  if (isMockPaymentsAllowed()) return { provider: mockProvider };
  const configured = process.env.PAYMENT_PROVIDER;
  if (!configured) return { provider: null, reason: "Onlayn to‘lov hali ulanmagan. Tez orada Click va Payme orqali to‘lash mumkin bo‘ladi." };
  return { provider: null, reason: `«${configured}» to‘lov provayderi hali integratsiya qilinmagan.` };
}
