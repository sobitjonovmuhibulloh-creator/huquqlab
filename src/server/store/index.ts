import "server-only";
import type { TestStore } from "./types";

/**
 * Qaysi ombor ishlatiladi:
 *   1. SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → Supabase (production);
 *   2. LOCAL_DB=pglite va production EMAS → lokal PGlite (.data/pglite);
 *   3. aks holda — baza yo'q: sayt kod ichidagi testlar bilan ishlaydi, import faqat preview.
 */
export function storeKind(): TestStore["kind"] | null {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return "supabase";
  if (process.env.LOCAL_DB === "pglite" && process.env.NODE_ENV !== "production") return "local";
  return null;
}

export function isDbConfigured() {
  return storeKind() !== null;
}

export async function getStore(): Promise<TestStore | null> {
  const kind = storeKind();
  if (kind === "supabase") return (await import("./supabase")).supabaseStore;
  if (kind === "local") return (await import("./local")).localStore;
  return null;
}

export type * from "./types";
