"use client";

import { readJSON, writeJSON } from "@/lib/storage";
import type { AnswerValue, ExamResult, Product, PublicQuestion, PurchaseRecord } from "@/types/exam";

/** Klient tomondagi API chaqiruvlari va urinishlar tarixi (localStorage) */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: init?.json !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Internet aloqasini tekshiring va qayta urinib ko‘ring.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError((data as { error?: string }).error ?? "Noma’lum xato", res.status);
  return data as T;
}

export interface AccessView {
  exams: string[];
  credits: Record<string, number>;
  purchases: PurchaseRecord[];
}

export interface PricingView {
  currency: "UZS";
  products: Product[];
  payments: { enabled: true; mock: boolean } | { enabled: false; reason: string };
}

export interface StartResponse {
  attemptToken: string;
  attemptId: string;
  startedAt: number;
  deadline: number;
  serverNow: number;
  questions: PublicQuestion[];
}

/* ---------------- Davom etayotgan urinish (sahifa yangilansa ham saqlanadi) ---------------- */

export interface SavedAttempt extends StartResponse {
  examId: string;
  answers: Record<string, AnswerValue>;
  flagged: string[];
  current: number;
  /** server va brauzer soati orasidagi farq */
  clockOffset: number;
}

const attemptKey = (examId: string) => `huquqlab:attempt:${examId}`;

export function loadAttempt(examId: string): SavedAttempt | null {
  const a = readJSON<SavedAttempt | null>(attemptKey(examId), null);
  // Muddati o'tgan (+2 daqiqa) urinishni tiklamaymiz — server uni baribir kech deb biladi
  if (!a || a.examId !== examId || Date.now() + a.clockOffset > a.deadline + 120_000) return null;
  return a;
}

export function saveAttempt(a: SavedAttempt) {
  writeJSON(attemptKey(a.examId), a);
}

export function clearAttempt(examId: string) {
  try {
    window.localStorage.removeItem(attemptKey(examId));
  } catch {
    /* e'tiborsiz */
  }
}

/* ---------------- Natijalar tarixi ---------------- */

const HISTORY_KEY = "huquqlab:exam-results:v1";
const MASTERED_KEY = "huquqlab:review-mastered:v1";
const MAX_RESULTS = 30;

export function loadResults(): ExamResult[] {
  const list = readJSON<ExamResult[]>(HISTORY_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveResult(result: ExamResult) {
  const list = loadResults().filter((r) => r.attemptId !== result.attemptId);
  list.unshift(result);
  writeJSON(HISTORY_KEY, list.slice(0, MAX_RESULTS));
}

export function loadMastered(): Record<string, string> {
  return readJSON<Record<string, string>>(MASTERED_KEY, {});
}

export function setMastered(questionId: string, mastered: boolean) {
  const m = loadMastered();
  if (mastered) m[questionId] = new Date().toISOString();
  else delete m[questionId];
  writeJSON(MASTERED_KEY, m);
}

export interface Mistake {
  item: ExamResult["items"][number];
  examId: string;
  examTitle: string;
  /** Shu savolda necha marta xato qilingan */
  wrongCount: number;
  lastAt: string;
}

/**
 * Smart Review uchun xatolar: har bir savol bo'yicha eng so'nggi urinish olinadi.
 * Agar oxirgi urinishda to'g'ri javob berilgan bo'lsa — xato ro'yxatidan chiqadi.
 */
export function collectMistakes(results: ExamResult[], mastered: Record<string, string>): Mistake[] {
  const latest = new Map<string, Mistake>();
  const wrongCounts = new Map<string, number>();
  // Eskidan yangiga — oxirgisi ustun yozadi
  for (const r of [...results].reverse()) {
    for (const item of r.items) {
      const id = item.question.id;
      if (!item.correct) wrongCounts.set(id, (wrongCounts.get(id) ?? 0) + 1);
      latest.set(id, { item, examId: r.examId, examTitle: r.examTitle, wrongCount: 0, lastAt: r.finishedAt });
    }
  }
  return [...latest.values()]
    .filter((m) => !m.item.correct && !mastered[m.item.question.id])
    .map((m) => ({ ...m, wrongCount: wrongCounts.get(m.item.question.id) ?? 1 }))
    .sort((a, b) => b.wrongCount - a.wrongCount || b.lastAt.localeCompare(a.lastAt));
}

export function percent(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0;
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/* ---------------- Statistika va tavsiyalar (faqat haqiqiy natijalardan) ---------------- */

export interface LearnerStats {
  attempts: number;
  testsTaken: number;
  averagePct: number;
  bestPct: number;
  last7Days: number;
  /** Eng zaif bo'limlar: kamida 3 ta savol bo'yicha, foizi eng past */
  weak: { label: string; correct: number; total: number; pct: number }[];
}

export function learnerStats(results: ExamResult[], now = Date.now()): LearnerStats | null {
  if (results.length === 0) return null;
  const sections = new Map<string, { label: string; correct: number; total: number }>();
  for (const r of results)
    for (const s of r.bySection) {
      const cur = sections.get(s.label) ?? { label: s.label, correct: 0, total: 0 };
      cur.correct += s.correct;
      cur.total += s.total;
      sections.set(s.label, cur);
    }
  const pcts = results.map((r) => percent(r.correct, r.total));
  return {
    attempts: results.length,
    testsTaken: new Set(results.map((r) => r.examId)).size,
    averagePct: Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length),
    bestPct: Math.max(...pcts),
    last7Days: results.filter((r) => now - Date.parse(r.finishedAt) < 7 * 86_400_000).length,
    weak: [...sections.values()]
      .filter((s) => s.total >= 3)
      .map((s) => ({ ...s, pct: percent(s.correct, s.total) }))
      .filter((s) => s.pct < 70)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3),
  };
}

/**
 * Keyingi testlar: hali topshirilmaganlar; avval oxirgi testning kategoriyasidagilar,
 * keyin bepul, keyin ochiq (sotib olingan) testlar.
 */
export function recommendTests<T extends { id: string; category: string; access: string; status: string }>(catalog: T[], results: ExamResult[], owned: string[], limit = 3): T[] {
  const taken = new Set(results.map((r) => r.examId));
  const lastCategory = catalog.find((e) => e.id === results[0]?.examId)?.category;
  const score = (e: T) => (e.category === lastCategory ? 4 : 0) + (e.access === "free" ? 2 : 0) + (owned.includes(e.id) ? 1 : 0);
  return catalog
    .filter((e) => e.status === "available" && !taken.has(e.id))
    .map((e, i) => ({ e, s: score(e), i }))
    .sort((a, b) => b.s - a.s || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.e);
}
