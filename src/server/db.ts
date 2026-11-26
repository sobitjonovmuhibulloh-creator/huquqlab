import "server-only";

/**
 * Supabase (PostgREST) uchun minimal server klient.
 *
 * SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY faqat server env'ida turadi
 * (NEXT_PUBLIC_ prefiksisiz) — brauzerga hech qachon chiqmaydi. service_role
 * RLS'ni chetlab o'tadi, shuning uchun har bir route o'zi access'ni tekshiradi.
 * Ulanmagan bo'lsa isDbConfigured() = false va sayt kod ichidagi testlar bilan ishlaydi.
 */

export class DbError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

function config() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

async function request<T>(path: string, init: RequestInit & { prefer?: string } = {}): Promise<T> {
  const cfg = config();
  if (!cfg) throw new DbError("Ma’lumotlar bazasi ulanmagan (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).", 503);
  const res = await fetch(`${cfg.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      ...(init.prefer ? { Prefer: init.prefer } : {}),
    },
    cache: "no-store",
    signal: init.signal ?? AbortSignal.timeout(15_000),
  });
  const body = await res.text();
  const data = body ? JSON.parse(body) : null;
  if (!res.ok) {
    const msg = (data as { message?: string } | null)?.message ?? `Baza xatosi (${res.status})`;
    throw new DbError(msg, res.status, (data as { code?: string } | null)?.code);
  }
  return data as T;
}

export const db = {
  select: <T>(table: string, query: string) => request<T[]>(`${table}?${query}`),
  insert: <T>(table: string, rows: unknown) => request<T[]>(table, { method: "POST", body: JSON.stringify(rows), prefer: "return=representation" }),
  update: <T>(table: string, filter: string, patch: unknown) => request<T[]>(`${table}?${filter}`, { method: "PATCH", body: JSON.stringify(patch), prefer: "return=representation" }),
  remove: (table: string, filter: string) => request<null>(`${table}?${filter}`, { method: "DELETE" }),
  rpc: <T>(fn: string, args: unknown) => request<T>(`rpc/${fn}`, { method: "POST", body: JSON.stringify(args) }),
};

/** PostgREST filtri uchun qiymatni xavfsiz qochirish */
export const inList = (values: string[]) => `(${values.map((v) => `"${v.replace(/["\\]/g, (m) => `\\${m}`)}"`).join(",")})`;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
