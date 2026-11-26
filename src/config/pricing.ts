import type { PricingConfig } from "@/types/exam";

/**
 * Boshlang'ich narxlar — biznes model uchun dastlabki taklif.
 * Bu faqat standart qiymatlar: admin panel orqali saqlangan narxlar
 * (server/pricing-store) ular ustidan yoziladi. Narxni komponentlarga
 * qattiq yozmang — doim getPricing() / /api/pricing orqali oling.
 */
export const DEFAULT_PRICING: PricingConfig = {
  currency: "UZS",
  updatedAt: "2026-11-26",
  products: [
    {
      id: "single",
      kind: "single",
      title: "1 ta premium test",
      description: "Tanlangan bitta testga doimiy kirish, cheksiz qayta topshirish.",
      price: 3_000,
      credits: 1,
      categories: [],
      active: true,
    },
    {
      id: "single-milliy",
      kind: "single",
      title: "Milliy sertifikat mock testi",
      description: "Rasmiy formatdagi 45 topshiriqli, 90 daqiqalik mock test.",
      price: 5_000,
      credits: 1,
      categories: ["milliy-sertifikat"],
      active: true,
    },
    {
      id: "bundle-5",
      kind: "bundle",
      title: "5 ta test paketi",
      description: "Istalgan 5 ta premium testni o‘zingiz tanlab ochasiz.",
      price: 10_000,
      credits: 5,
      categories: [],
      active: true,
    },
    {
      id: "bundle-10",
      kind: "bundle",
      title: "10 ta test paketi",
      description: "Imtihonga jiddiy tayyorgarlik uchun eng foydali tanlov.",
      price: 18_000,
      credits: 10,
      categories: [],
      active: true,
      highlight: true,
    },
  ],
};

export function formatPrice(amount: number) {
  // Intl ishlatilmaydi: server va brauzerda bir xil chiqishi kerak (hydration)
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}
