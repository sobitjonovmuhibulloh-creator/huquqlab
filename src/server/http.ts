import "server-only";
import { NextResponse } from "next/server";
import { DbError } from "./db";
import { ConfigError } from "./signing";

export function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

/** Route handler'ni o'raydi: sozlanmagan server (ConfigError) → 503, kutilmagan xato → 500 */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof ConfigError) return jsonError(`Server sozlanmagan: ${e.message}`, 503);
      if (e instanceof DbError) {
        // Postgres xato kodlari: 23505 — unikal (band nom, takroriy savol), 23514/P0001 — tekshiruv
        const status = e.code === "23505" ? 409 : e.code === "23514" || e.code === "P0001" || e.status === 400 ? 400 : e.status === 503 ? 503 : 502;
        return jsonError(e.message, status);
      }
      console.error(e);
      return jsonError("Serverda kutilmagan xato. Birozdan keyin qayta urinib ko‘ring.", 500);
    }
  };
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
