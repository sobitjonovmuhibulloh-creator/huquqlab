import type { Book } from "@/types";

/**
 * Huquq fanidan maktab darsliklari.
 *
 * Darsliklar mualliflik huquqi bilan himoyalangan, shuning uchun PDF'lar
 * saytga ko'chirilmaydi — faqat rasmiy ta'lim portalidagi (eduportal.uz)
 * nusxaga havola beriladi. Har bir manzil 2026-11-24 da tekshirilgan
 * (HTTP 200, application/pdf). Mualliflar faqat manbada aniq ko'ringan
 * holatda yozilgan.
 */

export const BOOKS_SOURCE = {
  name: "eduportal.uz — rasmiy ta’lim portali",
  url: "https://old.eduportal.uz/",
};

const BASE = "https://old.eduportal.uz/Umumiyfiles/darsliklar";
const CHECKED = "2026-11-24";

export const books: Book[] = [
  { id: "huquq-8-uz", title: "O‘zbekiston davlati va huquqi asoslari", grade: 8, language: "uz", url: `${BASE}/8/ozbekiston_davlati_va_huquqi_asoslari_8_uzb.pdf`, sizeMb: 9.3, checkedAt: CHECKED },
  { id: "huquq-8-ru", title: "O‘zbekiston davlati va huquqi asoslari", grade: 8, language: "ru", url: `${BASE}/8/ozbekiston_davlati_va_huquqi_asoslari_8_rus.pdf`, sizeMb: 9.0, checkedAt: CHECKED },
  { id: "huquq-9-uz", title: "Konstitutsiyaviy huquq asoslari", grade: 9, language: "uz", authors: ["G. M. Tansikbayeva", "V. A. Kostetskiy"], url: `${BASE}/9/konstitutsiyaviy_huquq_asoslari_9_uzb.pdf`, sizeMb: 4.4, checkedAt: CHECKED },
  { id: "huquq-9-ru", title: "Konstitutsiyaviy huquq asoslari", grade: 9, language: "ru", url: `${BASE}/9/konstitutsiyaviy_huquq_asoslari_9_rus.pdf`, checkedAt: CHECKED },
  { id: "huquq-10-uz", title: "Davlat va huquq asoslari", grade: 10, language: "uz", url: `${BASE}/10/davlat_va_huquq_asoslari_10_uzb.pdf`, sizeMb: 2.0, checkedAt: CHECKED },
  { id: "huquq-10-ru", title: "Davlat va huquq asoslari", grade: 10, language: "ru", url: `${BASE}/10/davlat_va_huquq_asoslari_10_rus.pdf`, sizeMb: 2.0, checkedAt: CHECKED },
  { id: "huquq-11-uz", title: "Davlat va huquq asoslari", grade: 11, language: "uz", url: `${BASE}/11/davlat_va_huquq_asoslari_11_uzb.pdf`, sizeMb: 2.1, checkedAt: CHECKED },
  { id: "huquq-11-ru", title: "Davlat va huquq asoslari", grade: 11, language: "ru", url: `${BASE}/11/davlat_va_huquq_asoslari_11_rus.pdf`, sizeMb: 2.2, checkedAt: CHECKED },
];

export const languageLabel: Record<Book["language"], string> = { uz: "O‘zbekcha", ru: "Ruscha" };
