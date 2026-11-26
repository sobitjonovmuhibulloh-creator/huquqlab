import "server-only";
import { randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import type { AccessState, ExamMeta } from "@/types/exam";
export { productCovers } from "@/lib/market";
import { sign, verify } from "./signing";

/**
 * Premium access holati — imzolangan httpOnly cookie'da.
 *
 * Bu ro'yxatdan o'tishsiz MVP uchun: access shu brauzerga bog'langan.
 * Foydalanuvchi akkauntlari va DB qo'shilganda (docs/ARCHITECTURE.md, «Entitlements»)
 * manba DB bo'ladi, cookie esa faqat sessiya identifikatori bo'lib qoladi.
 */

export const ACCESS_COOKIE = "huquqlab_access";
const MAX_AGE = 60 * 60 * 24 * 365 * 2;
const MAX_PURCHASES = 50;

export function emptyAccess(): AccessState {
  return { v: 1, uid: randomUUID(), exams: [], credits: {}, purchases: [] };
}

export function readAccess(request: NextRequest): AccessState {
  const state = verify<AccessState>(request.cookies.get(ACCESS_COOKIE)?.value);
  return state && state.v === 1 && typeof state.uid === "string" ? state : emptyAccess();
}

export function writeAccess(response: NextResponse, state: AccessState) {
  const trimmed = { ...state, purchases: state.purchases.slice(-MAX_PURCHASES) };
  response.cookies.set(ACCESS_COOKIE, sign(trimmed), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function hasAccess(state: AccessState, exam: ExamMeta) {
  return exam.access === "free" || state.exams.includes(exam.id);
}

/** Ochiq (klientga qaytariladigan) ko'rinish — uid'siz */
export function publicAccess(state: AccessState) {
  return { exams: state.exams, credits: state.credits, purchases: state.purchases };
}
