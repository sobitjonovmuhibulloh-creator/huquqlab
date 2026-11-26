/**
 * Test Market va imtihon rejimi type'lari.
 *
 * Savollar ikki ko'rinishda yuradi:
 *  - ExamQuestion — serverdagi to'liq savol (to'g'ri javob, izoh, manba bilan);
 *  - PublicQuestion — brauzerga yuboriladigan ko'rinish (javobsiz).
 * To'g'ri javoblar faqat test topshirilgandan keyin natija ichida qaytadi.
 */

/** Rasmiy spetsifikatsiyadagi topshiriq turlari: Y-1 yopiq, Y-2 vaziyatli yopiq, O — qisqa javobli ochiq */
export type QuestionKind = "Y-1" | "Y-2" | "O";

/** Spetsifikatsiyadagi fan mazmuni kodi: 1.1 … 4.1 */
export type SpecCode = "1.1" | "1.2" | "1.3" | "1.4" | "2.1" | "2.2" | "2.3" | "2.4" | "2.5" | "3.1" | "3.2" | "3.3" | "3.4" | "3.5" | "3.6" | "4.1";

export type Difficulty = "oson" | "o'rta" | "murakkab";

export interface QuestionSource {
  /** Hujjat nomi, masalan «Konstitutsiya» */
  document: string;
  /** To'liq havola (bazadan import qilingan savollar uchun) */
  url?: string;
  /** Modda — faqat rasmiy matn bilan solishtirilgan bo'lsa */
  article?: string;
  /** lex.uz hujjat ID'si */
  lexId?: string;
}

interface QuestionBase {
  id: string;
  kind: QuestionKind;
  /** Spetsifikatsiya kodi; bazadagi savollarda erkin mavzu nomi ham bo'lishi mumkin */
  spec: SpecCode | (string & {});
  difficulty: Difficulty;
  /** Vaziyat matni (Y-2 uchun) */
  context?: string;
  prompt: string;
  explanation: string;
  source: QuestionSource;
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "Y-1" | "Y-2";
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface OpenQuestion extends QuestionBase {
  kind: "O";
  /** Qabul qilinadigan javoblar (normalizatsiyadan keyin solishtiriladi) */
  accepted: string[];
  /** Javob formati bo'yicha ko'rsatma, masalan «Bitta so'z» yoki «Son» */
  answerHint: string;
}

export type ExamQuestion = ChoiceQuestion | OpenQuestion;

export type PublicQuestion =
  | Omit<ChoiceQuestion, "correctIndex" | "explanation">
  | Omit<OpenQuestion, "accepted" | "explanation">;

/* ---------------- Katalog ---------------- */

export type ExamCategory =
  | "milliy-sertifikat"
  | "attestatsiya"
  | "mavzulashtirilgan"
  | "konstitutsiya"
  | "kodekslar"
  | "otm"
  | "oqituvchilar"
  | "talabalar";

export type ExamAccess = "free" | "premium";

/** «available» — savollar bazada bor; «coming_soon» — katalogda ko'rinadi, lekin boshlab bo'lmaydi */
export type ExamStatus = "available" | "coming_soon";

export interface ExamMeta {
  id: string;
  title: string;
  category: ExamCategory;
  description: string;
  access: ExamAccess;
  status: ExamStatus;
  durationMinutes: number;
  difficulty: Difficulty;
  /** Rejadagi savollar soni (available bo'lsa — bazadagi haqiqiy son bilan tekshiriladi) */
  questionCount: number;
  author: string;
  updatedAt: string;
  /** Preview'da ko'rsatiladigan savollar soni (javobsiz) */
  previewCount: number;
  /** Kimlar uchun */
  audience: Audience[];
  /** Testning o'z narxi (bazadan); bo'lmasa standart «1 ta premium test» narxi */
  price?: number | null;
  /** Qayerdan: kod ichidagi savollar bazasi yoki Supabase */
  source?: "static" | "db";
}

export type Audience = "abituriyent" | "oqituvchi" | "repetitor" | "talaba" | "oquvchi";

/* ---------------- Narxlar va xaridlar ---------------- */

export type ProductKind = "single" | "bundle";

export interface Product {
  id: string;
  kind: ProductKind;
  title: string;
  description: string;
  /** UZS, butun so'm */
  price: number;
  /** bundle: nechta testni ochish huquqi (kredit) */
  credits: number;
  /** Faqat shu kategoriyalardagi testlarga ishlatiladi; bo'sh — barcha premium testlar */
  categories: ExamCategory[];
  active: boolean;
  /** Katalogda «eng foydali» belgisi */
  highlight?: boolean;
}

export interface PricingConfig {
  currency: "UZS";
  products: Product[];
  updatedAt: string;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled" | "expired";

export interface Order {
  id: string;
  /** Xaridorning anonim identifikatori (access cookie'dagi uid) */
  uid: string;
  productId: string;
  /** single mahsulot uchun — qaysi test */
  examId?: string;
  amount: number;
  status: OrderStatus;
  provider: string;
  createdAt: string;
  updatedAt: string;
  /** Access berilganmi (ikki marta berilmasligi uchun) */
  claimed: boolean;
}

export interface PurchaseRecord {
  orderId: string;
  productId: string;
  examId?: string;
  amount: number;
  at: string;
}

/** Imzolangan cookie ichidagi access holati */
export interface AccessState {
  v: 1;
  uid: string;
  /** Ochilgan premium testlar */
  exams: string[];
  /** Paketdan qolgan kreditlar: productId → qolgan son */
  credits: Record<string, number>;
  purchases: PurchaseRecord[];
}

/* ---------------- Urinish va natija ---------------- */

export type AnswerValue = number | string | null;

export interface QuestionResult {
  question: PublicQuestion;
  answer: AnswerValue;
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

export interface SectionScore {
  spec: string;
  label: string;
  correct: number;
  total: number;
}

export interface ExamResult {
  attemptId: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  /** Vaqt tugab avtomatik topshirildimi */
  autoSubmitted: boolean;
  correct: number;
  total: number;
  byKind: Record<QuestionKind, { correct: number; total: number }>;
  bySection: SectionScore[];
  items: QuestionResult[];
}
