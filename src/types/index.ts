/**
 * HuquqLab domen type'lari.
 * Ushbu tuzilma prisma/schema.prisma bilan mos keladi — keyinchalik
 * PostgreSQL + Prisma'ga o'tishda shu type'lar saqlanib qoladi.
 */

export type Grade = 7 | 8 | 9 | 10 | 11;

export const GRADES: Grade[] = [7, 8, 9, 10, 11];

export type CategoryId =
  | "inson-huquqlari"
  | "talim"
  | "mulk"
  | "raqamli"
  | "fuqarolik"
  | "mehnat"
  | "javobgarlik"
  | "davlat"
  | "xavfsizlik"
  | "oila";

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  /** lucide-react ikonka nomi (components/ui/CategoryIcon orqali chiziladi) */
  icon: string;
  /** Tailwind rang kaliti */
  color: "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "teal" | "orange" | "fuchsia" | "lime";
}

/**
 * Huquqiy manba holati:
 * - "verified"  — hujjat nomi rasmiy manbada (lex.uz) mavjud;
 * - "needs_verification" — modda raqami yoki tafsilot rasmiy manba bilan
 *   solishtirilmagan, "tekshirish talab etiladi" deb ko'rsatiladi.
 */
export type LegalStatus = "verified" | "needs_verification";

export interface LegalReference {
  id: string;
  document: string;
  article?: string;
  summary: string;
  status: LegalStatus;
}

export interface KeyConcept {
  term: string;
  definition: string;
}

export interface CaseStudy {
  situation: string;
  question: string;
  analysis: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  /** Har doim 4 ta variant */
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface Topic {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  categoryId: CategoryId;
  grades: Grade[];
  durationMinutes: number;
  difficulty: "oson" | "o'rta" | "murakkab";
  popular?: boolean;
  /** Mavzuga bog'liq simulyator (ixtiyoriy) */
  simulatorId?: string;
  intro: string;
  explanation: string[];
  concepts: KeyConcept[];
  legalBasis: LegalReference[];
  example: string;
  caseStudy: CaseStudy;
  summary: string[];
  quiz: QuizQuestion[];
  updatedAt: string;
}

/* ---------------- Simulyatorlar ---------------- */

export type OutcomeTone = "good" | "neutral" | "bad";

export interface ChoiceOutcome {
  title: string;
  description: string;
  /** Huquqiy izoh */
  legalNote: string;
  /** Axloqiy izoh */
  ethicsNote: string;
  points: number;
  tone: OutcomeTone;
  /** Agar mavjud bo'lsa — keyingi qadam, aks holda ssenariy tugaydi */
  nextStepId?: string;
  /** Yakun identifikatori (mukofotlar uchun) */
  endingId?: string;
  legalStatus?: LegalStatus;
}

export interface ScenarioChoice {
  id: string;
  label: string;
  hint?: string;
  outcome: ChoiceOutcome;
}

export interface ScenarioStep {
  id: string;
  title: string;
  narrative: string;
  choices: ScenarioChoice[];
}

export interface SimulatorReward {
  /** Ushbu yakunlardan biriga erishilganda beriladi */
  endingIds: string[];
  badgeId: string;
}

export interface Scenario {
  id: string;
  title: string;
  tagline: string;
  description: string;
  grades: Grade[];
  categoryId: CategoryId;
  durationMinutes: number;
  emoji: string;
  startStepId: string;
  steps: Record<string, ScenarioStep>;
  rewards: SimulatorReward[];
  relatedTopicSlug?: string;
}

/* ---------------- Gamification ---------------- */

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export type ActivityType = "topic" | "quiz" | "simulator";

export interface ActivityEntry {
  type: ActivityType;
  refId: string;
  at: string;
  /** quiz uchun foiz, simulator uchun ball */
  value?: number;
}

export interface QuizResult {
  best: number;
  total: number;
  attempts: number;
  lastAt: string;
}

export interface SimulatorResult {
  bestScore: number;
  maxScore: number;
  plays: number;
  endings: string[];
  lastAt: string;
}

export interface UserProgress {
  version: 1;
  /** Salomlashish uchun ixtiyoriy ism (faqat shu brauzerda) */
  name?: string;
  xp: number;
  completedTopics: string[];
  quizResults: Record<string, QuizResult>;
  simulatorResults: Record<string, SimulatorResult>;
  badges: Record<string, string>;
  activity: ActivityEntry[];
  claimedChallenges: string[];
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  type: ActivityType;
  target: number;
  /** quiz uchun minimal foiz */
  minValue?: number;
  rewardXp: number;
}

/* ---------------- Kutubxona ---------------- */

export interface Book {
  id: string;
  title: string;
  grade: Grade;
  language: "uz" | "ru";
  /** Faqat manbada tasdiqlangan mualliflar; noma'lum bo'lsa bo'sh qoldiriladi */
  authors?: string[];
  /** Rasmiy portaldagi PDF manzili — fayl saytga ko'chirilmaydi */
  url: string;
  sizeMb?: number;
  /** Manzil oxirgi marta tekshirilgan sana */
  checkedAt: string;
}

/* ---------------- Qonunlar (huquqiy hujjatlar) ---------------- */

export type LegalDocumentType = "konstitutsiya" | "kodeks" | "qonun" | "xalqaro";

export interface LegalKeyPoint {
  text: string;
  status: LegalStatus;
}

export interface LegalDocument {
  slug: string;
  title: string;
  shortTitle: string;
  type: LegalDocumentType;
  /** Hujjat raqami, masalan «O‘RQ-637» */
  number?: string;
  /** Qabul qilingan sana — faqat rasmiy manbada tekshirilgan bo'lsa */
  adoptedAt?: string;
  effectiveAt?: string;
  /** lex.uz'dagi hujjat ID'si — faqat tekshirilganlari; bo'lmasa qidiruv havolasi beriladi */
  lexId?: string;
  categoryIds: CategoryId[];
  grades: Grade[];
  /** Hujjat nimani tartibga soladi — 1–2 jumla */
  summary: string;
  /** O'quvchi uchun eng muhim qoidalar */
  keyPoints: LegalKeyPoint[];
  /** Mavzulardagi legalBasis.document bilan moslash uchun kalit so'zlar (normalizeSearch ko'rinishida) */
  match: string[];
  checkedAt: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  /** Atama uchraydigan mavzular (slug) */
  topicSlugs: string[];
}
