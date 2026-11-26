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
      description: "Tanlangan bitta premium testga doimiy kirish.",
      price: 11_000,
      credits: 1,
      categories: [],
      active: true,
    },
    {
      id: "bundle-5",
      kind: "bundle",
      title: "5 ta test paketi",
      description: "Istalgan 5 ta premium testni o‘zingiz tanlab ochasiz.",
      price: 45_000,
      credits: 5,
      categories: [],
      active: true,
    },
    {
      id: "bundle-10",
      kind: "bundle",
      title: "10 ta test paketi",
      description: "Imtihonga jiddiy tayyorgarlik uchun eng foydali tanlov.",
      price: 79_000,
      credits: 10,
      categories: [],
      active: true,
      highlight: true,
    },
    {
      id: "attestatsiya-1",
      kind: "bundle",
      title: "Attestatsiya paketi",
      description: "Attestatsiya va o‘qituvchilar uchun testlardan bittasini ochadi.",
      price: 11_000,
      credits: 1,
      categories: ["attestatsiya", "oqituvchilar"],
      active: true,
    },
  ],
};

export function formatPrice(amount: number) {
  // Intl ishlatilmaydi: server va brauzerda bir xil chiqishi kerak (hydration)
  return `${String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so‘m`;
}
