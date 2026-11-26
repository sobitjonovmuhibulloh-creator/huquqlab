import { twMerge } from "tailwind-merge";

/** Klasslarni birlashtiradi; to'qnashuvda keyingisi ustun (masalan, bg-* override) */
export function cn(...classes: (string | false | null | undefined)[]) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function slugify(input: string) {
  return normalizeSearch(input)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Qidiruv uchun normalizatsiya: o‘/o', g‘/g' va registr farqlarini yo'qotadi */
export function normalizeSearch(input: string) {
  return input.toLowerCase().replace(/[‘’'ʻʼ`]/g, "");
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

/**
 * «2023-yil 30-aprel». Intl'ning uz-UZ lokali brauzerlarda turlicha
 * («2023 M04 30») chiqadi va server/klient farqi hydration xatosiga olib keladi.
 */
export function formatDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  return `${m[1]}-yil ${Number(m[3])}-${MONTHS[Number(m[2]) - 1]}`;
}

export const difficultyLabel: Record<string, string> = {
  oson: "Oson",
  "o'rta": "O‘rta",
  murakkab: "Murakkab",
};
