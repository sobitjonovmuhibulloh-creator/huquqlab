import type { Audience, Difficulty, ExamCategory, QuestionKind } from "@/types/exam";

/** Bazadagi qatorlar (Supabase va lokal PGlite uchun bir xil — bitta migratsiya) */

export interface DbTestRow {
  id: string;
  title: string;
  description: string;
  category: ExamCategory;
  exam_type: string;
  grade_or_audience: Audience[];
  question_count: number;
  duration_minutes: number;
  price: number | null;
  is_premium: boolean;
  status: "draft" | "published" | "archived";
  difficulty: Difficulty;
  author: string;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOptionRow {
  id: string;
  option_label: string;
  option_text: string;
  is_correct: boolean;
}

export interface DbQuestionRow {
  id: string;
  test_id: string;
  question_text: string;
  question_type: QuestionKind;
  topic: string | null;
  difficulty: Difficulty;
  explanation: string;
  source_title: string | null;
  source_url: string | null;
  legal_article: string | null;
  sort_order: number;
  question_options: DbOptionRow[];
}

export interface BankRow {
  id: string;
  test_id: string;
  question_text: string;
  question_type: string;
  topic: string | null;
  difficulty: Difficulty;
  source_title: string | null;
  created_at: string;
  tests: { title: string; status: string } | null;
}

export interface ImportBatchRow {
  id: string;
  file_name: string;
  file_format: string;
  imported_by: string;
  tests_created: number;
  questions_imported: number;
  warnings: unknown[];
  created_at: string;
}

export interface ImportResult {
  batch_id: string;
  tests_created: number;
  questions_imported: number;
  test_ids: string[];
}

export type TestPatch = Partial<Pick<DbTestRow, "title" | "description" | "status" | "is_premium" | "price" | "duration_minutes" | "category" | "difficulty">>;

export interface AttemptRecord {
  testId: string;
  userId: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  total: number;
  status: "submitted" | "auto_submitted";
  answers: { questionId: string; optionIndex: number | null; answerText: string | null; isCorrect: boolean }[];
}

/**
 * Testlar ombori. Ikki implementatsiya: Supabase (production) va lokal PGlite
 * (faqat development, .data/pglite — git'ga ham, deploy'ga ham tushmaydi).
 * Ikkalasi ham supabase/migrations dagi bir xil SQL bilan ishlaydi.
 */
export interface TestStore {
  kind: "supabase" | "local";
  label: string;
  listTests(opts: { publishedOnly: boolean }): Promise<DbTestRow[]>;
  getTest(id: string, opts: { publishedOnly: boolean }): Promise<DbTestRow | undefined>;
  getQuestions(testId: string): Promise<DbQuestionRow[]>;
  allTitles(): Promise<string[]>;
  findDuplicates(normalizedTexts: string[]): Promise<{ normalized_text: string; test_title: string }[]>;
  importTests(args: { tests: unknown[]; fileName: string; format: string; importedBy: string; warnings: unknown[] }): Promise<ImportResult>;
  updateTest(id: string, patch: TestPatch): Promise<DbTestRow | undefined>;
  deleteTest(id: string): Promise<void>;
  searchQuestions(query: string, testId?: string): Promise<BankRow[]>;
  updateQuestion(id: string, patch: Record<string, unknown>): Promise<void>;
  deleteQuestion(id: string): Promise<void>;
  listImports(): Promise<ImportBatchRow[]>;
  recordAttempt(a: AttemptRecord): Promise<void>;
}
