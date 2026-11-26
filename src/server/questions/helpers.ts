import "server-only";
import type { ChoiceQuestion, Difficulty, OpenQuestion, QuestionSource, SpecCode } from "@/types/exam";

/**
 * Savol yozishni qisqartiruvchi yordamchilar.
 * Manbalarda lexId faqat lex.uz'da ochib tekshirilgan hujjatlar uchun yoziladi;
 * modda raqami esa rasmiy matn bilan solishtirilmaguncha yozilmaydi.
 */

export const SRC = {
  konstitutsiya: { document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023)", lexId: "6445145" },
  fk: { document: "Fuqarolik kodeksi", lexId: "111189" },
  jk: { document: "Jinoyat kodeksi", lexId: "111453" },
  mjtk: { document: "Ma’muriy javobgarlik to‘g‘risidagi kodeks", lexId: "97664" },
  mk: { document: "Mehnat kodeksi", lexId: "6257288" },
  ok: { document: "Oila kodeksi", lexId: "104720" },
  saylov: { document: "Saylov kodeksi", lexId: "4386848" },
  nazariya: { document: "Davlat va huquq asoslari (o‘quv dasturi)" },
  istemol: { document: "«Iste’molchilarning huquqlarini himoya qilish to‘g‘risida»gi Qonun" },
  tabiat: { document: "«Tabiatni muhofaza qilish to‘g‘risida»gi Qonun" },
} satisfies Record<string, QuestionSource>;

type Opts = { context?: string; difficulty?: Difficulty };

export function y1(
  id: string,
  spec: SpecCode,
  prompt: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  source: QuestionSource,
  opts: Opts = {},
): ChoiceQuestion {
  return { id, kind: "Y-1", spec, difficulty: opts.difficulty ?? "o'rta", prompt, options, correctIndex, explanation, source, context: opts.context };
}

export function y2(
  id: string,
  spec: SpecCode,
  context: string,
  prompt: string,
  options: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
  explanation: string,
  source: QuestionSource,
  difficulty: Difficulty = "murakkab",
): ChoiceQuestion {
  return { id, kind: "Y-2", spec, difficulty, context, prompt, options, correctIndex, explanation, source };
}

export function open(
  id: string,
  spec: SpecCode,
  prompt: string,
  accepted: string[],
  answerHint: string,
  explanation: string,
  source: QuestionSource,
  difficulty: Difficulty = "o'rta",
): OpenQuestion {
  return { id, kind: "O", spec, difficulty, prompt, accepted, answerHint, explanation, source };
}
