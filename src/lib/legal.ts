import { documents } from "@/data/documents";
import { generalTerms } from "@/data/glossary";
import { normalizeSearch } from "@/lib/utils";
import type { GlossaryTerm, LegalDocument, Topic } from "@/types";

/** Mavzudagi huquqiy asos matniga mos hujjat (birinchi mos kelgani) */
export function findDocument(reference: string): LegalDocument | undefined {
  const text = normalizeSearch(reference);
  return documents.find((d) => d.match.some((m) => text.includes(m)));
}

/** Hujjatga tayangan mavzular («MJtK / Jinoyat kodeksi» kabi havola ikkala hujjatga ham hisoblanadi) */
export function topicsForDocument(doc: LegalDocument, topics: Topic[]) {
  return topics.filter((t) => t.legalBasis.some((l) => doc.match.some((m) => normalizeSearch(l.document).includes(m))));
}

/**
 * Lug'at: umumiy atamalar + mavzulardagi tushunchalar.
 * Bir xil atama bir necha mavzuda bo'lsa — birinchi ta'rif olinadi, mavzular jamlanadi.
 */
export function buildGlossary(topics: Topic[]): GlossaryTerm[] {
  const map = new Map<string, GlossaryTerm>();
  for (const g of generalTerms) map.set(normalizeSearch(g.term), { ...g, topicSlugs: [] });
  for (const t of topics) {
    for (const c of t.concepts) {
      const key = normalizeSearch(c.term);
      const existing = map.get(key);
      if (existing) {
        if (!existing.topicSlugs.includes(t.slug)) existing.topicSlugs.push(t.slug);
      } else {
        map.set(key, { term: c.term, definition: c.definition, topicSlugs: [t.slug] });
      }
    }
  }
  return [...map.values()].sort((a, b) => (sortKey(a.term) < sortKey(b.term) ? -1 : 1));
}

/**
 * O'zbek alifbosi tartibi (… X Y Z O‘ G‘ Sh Ch). localeCompare("uz") ishlatilmaydi:
 * Node va brauzer ICU'si turlicha saralab, hydration xatosini beradi.
 */
function sortKey(term: string) {
  return term
    .toLowerCase()
    .replace(/o[‘’'ʻ]/g, "{")
    .replace(/g[‘’'ʻ]/g, "|")
    .replace(/sh/g, "}")
    .replace(/ch/g, "~")
    .replace(/[‘’'ʻʼ`«»]/g, "");
}

/** Lug'at harfi: o‘/g‘ va sh/ch digraflari alohida harf sifatida */
export function initialOf(term: string) {
  const t = term.trim();
  const two = t.slice(0, 2).toUpperCase();
  if (["SH", "CH"].includes(two)) return two;
  const first = t[0]?.toUpperCase() ?? "";
  if ((first === "O" || first === "G") && /[‘’'ʻ]/.test(t[1] ?? "")) return `${first}‘`;
  return first;
}
