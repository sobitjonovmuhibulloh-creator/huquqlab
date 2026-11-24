import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, createSessionToken, getAdminConfig, SESSION_TTL_SECONDS, verifyPassword } from "@/lib/admin-auth";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

/**
 * Oddiy xotiradagi urinishlar cheklovi (IP bo'yicha). Bitta server jarayoni uchun ishlaydi;
 * bir nechta instansiyali production'da Redis kabi umumiy xotira kerak bo'ladi.
 * globalThis'da saqlanadi — aks holda modul qayta yuklanganda (dev/HMR) hisoblagich nolga tushadi.
 */
const store = globalThis as typeof globalThis & { __huquqlabLoginAttempts?: Map<string, { count: number; resetAt: number }> };
const attempts = (store.__huquqlabLoginAttempts ??= new Map());

/** Cloudflare orqali kelganda haqiqiy IP cf-connecting-ip'da; x-forwarded-for'ni mijoz soxtalashtirishi mumkin */
function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
    "local"
  );
}

export async function POST(request: NextRequest) {
  const config = getAdminConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Server sozlanmagan: .env.local faylida ADMIN_PASSWORD va ADMIN_SESSION_SECRET (kamida 32 belgi) bo‘lishi kerak." },
      { status: 500 },
    );
  }

  const ip = clientIp(request);
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.resetAt > now && entry.count >= MAX_ATTEMPTS) {
    const minutes = Math.ceil((entry.resetAt - now) / 60000);
    return NextResponse.json({ error: `Juda ko‘p noto‘g‘ri urinish. ${minutes} daqiqadan keyin qayta urinib ko‘ring.` }, { status: 429 });
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "Noto‘g‘ri so‘rov" }, { status: 400 });
  }

  if (!password || !(await verifyPassword(password, config))) {
    const current = entry && entry.resetAt > now ? entry : { count: 0, resetAt: now + WINDOW_MS };
    current.count++;
    attempts.set(ip, current);
    const left = MAX_ATTEMPTS - current.count;
    return NextResponse.json(
      { error: left > 0 ? `Parol noto‘g‘ri. Yana ${left} ta urinish qoldi.` : "Parol noto‘g‘ri. Kirish 15 daqiqaga bloklandi." },
      { status: 401 },
    );
  }

  attempts.delete(ip);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await createSessionToken(config), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return response;
}
