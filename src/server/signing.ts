import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Imzolangan tokenlar (access cookie, urinish tokeni): "<base64url(JSON)>.<base64url(HMAC-SHA256)>".
 * Mijoz tokenni o'qiy oladi, lekin o'zgartira olmaydi.
 *
 * ACCESS_TOKEN_SECRET production'da majburiy (kamida 32 belgi). Development'da
 * u bo'lmasa vaqtinchalik kalit ishlatiladi — u bilan yaratilgan tokenlar faqat
 * lokal sinov uchun.
 */

const DEV_FALLBACK = "huquqlab-dev-only-secret-do-not-use-in-production";

export class ConfigError extends Error {}

function secret() {
  const s = process.env.ACCESS_TOKEN_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new ConfigError("ACCESS_TOKEN_SECRET sozlanmagan (kamida 32 belgi).");
  }
  return DEV_FALLBACK;
}

function mac(data: string) {
  return createHmac("sha256", secret()).update(data).digest("base64url");
}

export function sign(payload: unknown): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(body)}`;
}

export function verify<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(mac(body));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}
