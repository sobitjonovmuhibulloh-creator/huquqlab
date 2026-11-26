import "server-only";
import { db } from "../db";
import type { BankRow, DbQuestionRow, DbTestRow, ImportBatchRow, ImportResult, TestStore } from "./types";

export const TEST_COLUMNS =
  "id,title,description,category,exam_type,grade_or_audience,question_count,duration_minutes,price,is_premium,status,difficulty,author,import_batch_id,created_at,updated_at";
export const QUESTION_COLUMNS =
  "id,test_id,question_text,question_type,topic,difficulty,explanation,source_title,source_url,legal_article,sort_order,question_options(id,option_label,option_text,is_correct)";

/** Supabase (PostgREST) orqali — service_role kaliti bilan, faqat serverda */
export const supabaseStore: TestStore = {
  kind: "supabase",
  label: "Supabase",

  listTests: ({ publishedOnly }) =>
    db.select<DbTestRow>("tests", `select=${TEST_COLUMNS}${publishedOnly ? "&status=eq.published" : ""}&order=created_at.desc`),

  async getTest(id, { publishedOnly }) {
    const [row] = await db.select<DbTestRow>("tests", `select=${TEST_COLUMNS}&id=eq.${id}${publishedOnly ? "&status=eq.published" : ""}`);
    return row;
  },

  getQuestions: (testId) => db.select<DbQuestionRow>("questions", `select=${QUESTION_COLUMNS}&test_id=eq.${testId}&order=sort_order.asc`),

  async allTitles() {
    return (await db.select<{ title: string }>("tests", "select=title")).map((t) => t.title);
  },

  findDuplicates: (texts) => db.rpc("find_duplicate_questions", { p_texts: texts }),

  importTests: ({ tests, fileName, format, importedBy, warnings }) =>
    db.rpc<ImportResult>("import_tests", { p_tests: tests, p_file_name: fileName, p_file_format: format, p_imported_by: importedBy, p_warnings: warnings }),

  async updateTest(id, patch) {
    const [row] = await db.update<DbTestRow>("tests", `id=eq.${id}`, patch);
    return row;
  },

  async deleteTest(id) {
    await db.remove("tests", `id=eq.${id}`);
  },

  searchQuestions(query, testId) {
    const filters = [
      "select=id,test_id,question_text,question_type,topic,difficulty,source_title,created_at,tests(title,status)",
      "order=created_at.desc",
      "limit=100",
    ];
    // PostgREST ilike: * — joker; PostgREST sintaksisidagi maxsus belgilarni olib tashlaymiz
    if (query) filters.push(`question_text=ilike.*${encodeURIComponent(query.replace(/[*,()%]/g, " "))}*`);
    if (testId) filters.push(`test_id=eq.${testId}`);
    return db.select<BankRow>("questions", filters.join("&"));
  },

  async updateQuestion(id, patch) {
    await db.rpc("update_question", { p_id: id, p_patch: patch });
  },

  async deleteQuestion(id) {
    await db.remove("questions", `id=eq.${id}`);
  },

  listImports: () =>
    db.select<ImportBatchRow>("import_batches", "select=id,file_name,file_format,imported_by,tests_created,questions_imported,warnings,created_at&order=created_at.desc&limit=50"),

  async recordAttempt(a) {
    const [attempt] = await db.insert<{ id: string }>("test_attempts", {
      user_id: a.userId,
      test_id: a.testId,
      started_at: a.startedAt,
      finished_at: a.finishedAt,
      score: a.score,
      total: a.total,
      status: a.status,
    });
    const rows = await db.select<{ id: string; question_options: { id: string; option_label: string }[] }>(
      "questions",
      `select=id,question_options(id,option_label)&test_id=eq.${a.testId}`,
    );
    const optionIds = new Map(rows.map((r) => [r.id, [...r.question_options].sort((x, y) => x.option_label.localeCompare(y.option_label)).map((o) => o.id)]));
    await db.insert(
      "attempt_answers",
      a.answers.map((x) => ({
        attempt_id: attempt.id,
        question_id: x.questionId,
        selected_option_id: x.optionIndex === null ? null : optionIds.get(x.questionId)?.[x.optionIndex] ?? null,
        answer_text: x.answerText,
        is_correct: x.isCorrect,
      })),
    );
  },
};
