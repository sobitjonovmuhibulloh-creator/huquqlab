/**
 * O'qituvchi paneli uchun parol va sessiya.
 * Faqat Web Crypto ishlatiladi — middleware (edge) va route handler'larda bir xil ishlaydi.
 *
 * Sessiya tokeni: "<amal qilish muddati ms>.<HMAC-SHA256 imzo>".
 * Imzo kaliti ADMIN_SESSION_SECRET + ADMIN_PASSWORD dan olinadi, shuning uchun
 * parol o'zgarsa, barcha eski sessiyalar avtomatik bekor bo'ladi.
 */

export const ADMIN_COOKIE = "huquqlab_admin";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const encoder = new TextEncoder();

export function getAdminConfig() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) return null;
  return { password, secret };
}

async function hmac(key: string, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}

function toHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Parolni doimiy vaqtda solishtiradi (uzunlik ham sizib chiqmasligi uchun ikkala qiymat HMAC'lanadi) */
export async function verifyPassword(input: string, config: { password: string; secret: string }) {
  const [a, b] = await Promise.all([hmac(config.secret, input), hmac(config.secret, config.password)]);
  return timingSafeEqual(a, b);
}

export async function createSessionToken(config: { password: string; secret: string }) {
  const exp = String(Date.now() + SESSION_TTL_SECONDS * 1000);
  const sig = toHex(await hmac(config.secret + config.password, exp));
  return `${exp}.${sig}`;
}

export async function verifySessionToken(token: string | undefined, config: { password: string; secret: string } | null) {
  if (!token || !config) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = toHex(await hmac(config.secret + config.password, exp));
  return timingSafeEqual(encoder.encode(sig), encoder.encode(expected));
}

/** Kirishdan keyin faqat /admin ichidagi manzilga qaytaramiz (open redirect'ning oldini olish) */
export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/kirish")) return "/admin";
  return next;
}
