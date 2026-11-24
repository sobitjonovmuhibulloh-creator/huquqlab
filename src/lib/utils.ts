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

export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export const difficultyLabel: Record<string, string> = {
  oson: "Oson",
  "o'rta": "O‘rta",
  murakkab: "Murakkab",
};
