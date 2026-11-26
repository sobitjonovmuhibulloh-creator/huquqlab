/**
 * Bulk import tekshiruvlari: CSV parser, format/kodirovka, validatsiya (qator raqamlari bilan),
 * xlsx yozib-o'qish va server oqimi (bazasiz).
 * Ishga tushirish: npm run check (check-content.ts dan keyin)
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { readSheet } from "read-excel-file/node";
import writeExcelFile from "write-excel-file/node";
import { decodeUtf8, detectFormat, parseCsv, templateCsv, validateImport, type IssueCode } from "../src/lib/test-import";
import { isCorrect, toPublic } from "../src/lib/grading";
import { toExamQuestion } from "../src/server/exam-repository";
import { commitImport, previewImport } from "../src/server/test-import";

let failed = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failed++;
};
const opts = { format: "csv" as const, fileName: "t.csv", existingTitles: new Set<string>(), existingQuestions: new Map<string, string>() };

async function main() {
  // ---- CSV parser
  const csvRows = parseCsv('a,b,c\r\n"1,5","ko‘p\nqatorli","u ""dedi"""\n');
  check("CSV: qo‘shtirnoq ichidagi vergul, yangi qator va \"\"", JSON.stringify(csvRows[1]) === JSON.stringify(["1,5", "ko‘p\nqatorli", 'u "dedi"']));
  check("CSV: nuqtali vergul ajratuvchisi aniqlanadi", parseCsv("x;y\n1;2")[1][1] === "2");

  // ---- Format va kodirovka
  check("Format: xlsx (ZIP sarlavhasi)", detectFormat(new Uint8Array([0x50, 0x4b, 3, 4]), "a.bin") === "xlsx");
  check("Format: eski .xls rad etiladi", detectFormat(new Uint8Array([0xd0, 0xcf, 0x11, 0xe0]), "a.xls") === "xls");
  check("Format: kengaytmasi .xlsx, lekin aslida matn → csv deb aniqlanadi", detectFormat(new TextEncoder().encode("a,b"), "fake.xlsx") === "csv");
  check("Kodirovka: UTF-8 BOM olib tashlanadi", (decodeUtf8(new Uint8Array([0xef, 0xbb, 0xbf, 0x61])) as { text: string }).text === "a");
  check("Kodirovka: Windows-1251 bayti xato beradi", !decodeUtf8(new Uint8Array([0x61, 0xc0, 0xe9])).ok);

  // ---- Shablon to'g'ri import qilinadi
  const tpl = validateImport(parseCsv(templateCsv().slice(1)), opts);
  const t0 = tpl.tests[0];
  check("Shablon: 1 test, 2 savol, xatosiz", tpl.canImport && tpl.tests.length === 1 && t0.questions.length === 2, `${tpl.errors.map((e) => e.message).join("; ")}`);
  check("Shablon: narx 11 000, premium, 20 daqiqa", t0.price === 11000 && t0.is_premium && t0.duration_minutes === 20);
  check("Shablon: yopiq savolda bitta to‘g‘ri (A)", t0.questions[0].options.filter((o) => o.is_correct).map((o) => o.label).join() === "A");
  check("Shablon: ochiq savol javobi O1=150", t0.questions[1].question_type === "O" && t0.questions[1].options[0].text === "150");

  // ---- Har bir xato turi to'g'ri qator raqami bilan
  const H = "test_title,test_category,duration_minutes,price,is_premium,question_text,question_type,option_a,option_b,option_c,option_d,correct_answer";
  const lines = [
    H, //                                                                                         1
    "Test bir,konstitutsiya,20,15000,ha,Savol bir,Y-1,a,b,c,d,A", //                                   2 — yaxshi
    ",konstitutsiya,20,,,Nomsiz test savoli,Y-1,a,b,c,d,A", //                                   3 missing_title
    "Test bir,,,,,,Y-1,a,b,c,d,A", //                                                                  4 missing_question
    "Test bir,,,,,Savol uch,Y-1,a,b,,d,A", //                                                          5 missing_options
    "Test bir,,,,,Savol to‘rt,Y-1,a,b,c,d,E", //                                                       6 invalid_correct
    "Test bir,,,,,Savol BIR!,Y-1,a,b,c,d,B", //                                                        7 duplicate_in_file (shu test, 2-qator)
    "Test bir,,,,,Savol besh,Y-3,a,b,c,d,A", //                                                        8 unsupported_type
    ",,,,,,,,,,,", //                                                                            9 empty_row (warning)
    "Test bir,,30,,,Savol olti,Y-1,a,b,c,d,A", //                                                     10 conflicting duration
    "Test ikki,mavjud-emas,0,abc,,Ikkinchi test savoli,Y-1,a,b,c,d,A", //                                         11 invalid_category/duration/price
    "Test uch,otm,20,5000,yo‘q,Bepul pullik,Y-1,a,b,c,d,A", //                                        12 bepul testga narx
    "Test tort,otm,20,,,Bazadagi savol,Y-1,a,b,c,d,A", //                                              13 duplicate_in_db
    "Band nom,otm,20,,,Yangi savol,Y-1,a,b,c,d,A", //                                           14 title_exists
    "Test besh,otm,20,,,Variantlar bir xil,Y-1,a,a,c,d,A", //                                          15 duplicate_option
  ];
  const v = validateImport(parseCsv(lines.join("\n")), {
    ...opts,
    existingTitles: new Set(["band nom"]),
    existingQuestions: new Map([["bazadagi savol", "Eski test"]]),
  });
  const has = (code: IssueCode, row: number) => v.errors.some((e) => e.code === code && e.row === row);
  check("Xato: test nomi yo‘q → 3-qator", has("missing_title", 3));
  check("Xato: savol matni yo‘q → 4-qator", has("missing_question", 4));
  check("Xato: variant yetishmaydi → 5-qator", has("missing_options", 5));
  check("Xato: to‘g‘ri javob noto‘g‘ri (E) → 6-qator", has("invalid_correct", 6));
  check("Xato: shu test ichida takroriy savol (registr/tinish farqi bilan) → 7-qator", has("duplicate_in_file", 7));
  check("Xato: qo‘llab-quvvatlanmaydigan tur Y-3 → 8-qator", has("unsupported_type", 8));
  check("Ogohlantirish: bo‘sh qator → 9-qator", v.warnings.some((w) => w.code === "empty_row" && w.row === 9));
  check("Xato: bir testda ikki xil davomiylik → 10-qator", has("conflicting_test_field", 10));
  check("Xato: noma’lum kategoriya → 11-qator", has("invalid_category", 11));
  check("Xato: davomiylik 0 → 11-qator", has("invalid_duration", 11));
  check("Xato: narx «abc» → 11-qator", has("invalid_price", 11));
  check("Xato: bepul testga narx → 12-qator", has("invalid_price", 12));
  check("Ogohlantirish: bazadagi boshqa testda bor savol → 13-qator", v.warnings.some((w) => w.code === "duplicate_in_db" && w.row === 13) && !has("duplicate_in_db", 13));
  const cross = validateImport(parseCsv(`${H}
Variant bir,otm,20,,,Umumiy savol,Y-1,a,b,c,d,A
Variant ikki,otm,20,,,Umumiy savol!,Y-1,a,b,c,d,B
`), opts);
  check("Testlararo takror — ogohlantirish, import bloklanmaydi", cross.canImport && cross.warnings.some((w) => w.code === "duplicate_in_file" && w.row === 3));
  check("Xato: band test nomi → 14-qator", has("title_exists", 14));
  check("Xato: bir xil variantlar → 15-qator", has("duplicate_option", 15));
  check("Xatoli faylni import qilib bo‘lmaydi", !v.canImport);
  check("Yaxshi qator (2) xato sifatida belgilanmagan", !v.errors.some((e) => e.row === 2));

  const noCols = validateImport([["savol", "javob"], ["a", "b"]], opts);
  check("Xato: majburiy ustunlar yo‘q", noCols.errors.filter((e) => e.code === "missing_column").length === 3 && !noCols.canImport);
  check("Xato: bo‘sh fayl", validateImport([], opts).errors[0]?.code === "file_format");

  // ---- XLSX: yozib, haqiqiy parser bilan o'qish (server bilan bir xil yo'l)
  const tplRows = parseCsv(templateCsv().slice(1));
  const xlsxBuffer = await writeExcelFile(tplRows.map((r) => r.map((value) => ({ value })))).toBuffer();
  check("XLSX: format aniqlanadi", detectFormat(new Uint8Array(xlsxBuffer), "t.xlsx") === "xlsx");
  const fromXlsx = validateImport((await readSheet(xlsxBuffer)) as unknown[][], { ...opts, format: "xlsx" });
  check("XLSX: CSV bilan bir xil natija", fromXlsx.canImport && JSON.stringify(fromXlsx.tests) === JSON.stringify(tpl.tests));
  const xlsxNumbers = await writeExcelFile([
    ["test_title", "test_category", "duration_minutes", "price", "is_premium", "question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer"].map((value) => ({ value })),
    [{ value: "Raqamli test" }, { value: "otm" }, { value: 25 }, { value: 12000 }, { value: true }, { value: "Raqamli savol" }, { value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }, { value: "c" }],
  ]).toBuffer();
  const num = validateImport((await readSheet(xlsxNumbers)) as unknown[][], { ...opts, format: "xlsx" });
  check("XLSX: son va mantiqiy katakchalar to‘g‘ri o‘qiladi", num.canImport && num.tests[0].duration_minutes === 25 && num.tests[0].price === 12000 && num.tests[0].questions[0].options[2].is_correct);

  const publicXlsx = readFileSync(path.join(process.cwd(), "public", "templates", "huquqlab-test-import.xlsx"));
  const pub = validateImport((await readSheet(publicXlsx)) as unknown[][], { ...opts, format: "xlsx" });
  check("public/templates: Excel shablon xatosiz o‘qiladi", pub.canImport && pub.tests[0].questions.length === 2);

  // ---- Bazadagi qator → imtihon formati
  const dbq = toExamQuestion({
    id: "q1", test_id: "t1", question_text: "Savol", question_type: "Y-1", topic: "2.4", difficulty: "oson", explanation: "Izoh",
    source_title: "Konstitutsiya", source_url: "https://lex.uz/uz/docs/6445145", legal_article: null, sort_order: 1,
    question_options: [
      { id: "o4", option_label: "D", option_text: "dd", is_correct: false },
      { id: "o2", option_label: "B", option_text: "bb", is_correct: true },
      { id: "o1", option_label: "A", option_text: "aa", is_correct: false },
      { id: "o3", option_label: "C", option_text: "cc", is_correct: false },
    ],
  });
  check("DB → engine: variantlar A–D tartibida, to‘g‘ri javob B", "options" in dbq && dbq.options.join() === "aa,bb,cc,dd" && dbq.correctIndex === 1 && isCorrect(dbq, 1));
  check("DB → engine: klientga javob kaliti chiqmaydi", !/"correctIndex"|"explanation"|"accepted"/.test(JSON.stringify(toPublic(dbq))));
  const dbo = toExamQuestion({
    id: "q2", test_id: "t1", question_text: "Deputatlar soni?", question_type: "O", topic: null, difficulty: "oson", explanation: "",
    source_title: null, source_url: null, legal_article: null, sort_order: 2,
    question_options: [
      { id: "x", option_label: "O1", option_text: "150", is_correct: true },
      { id: "y", option_label: "O2", option_text: "bir yuz ellik", is_correct: true },
    ],
  });
  check("DB → engine: ochiq savol bir nechta javobni qabul qiladi", isCorrect(dbo, " Bir yuz ellik ") && isCorrect(dbo, "150") && !isCorrect(dbo, "151"));

  // ---- Server oqimi (bazasiz): kod ichidagi savollar bilan takrorlanish va «pretend» qilmaslik
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dupCsv = `${H}\nYangi test,otm,20,,,"Mustaqil davlatlarning muayyan umumiy maqsadlarga erishish uchun tuzgan ittifoqi qanday ataladi?",Y-1,a,b,c,d,A\n`;
  const p1 = await previewImport(new File([dupCsv], "dup.csv"));
  check("Server: kod ichidagi mock testdagi savol takror deb topiladi (ogohlantirish)", p1.warnings.some((e) => e.code === "duplicate_in_db" && e.row === 2));
  const p2 = await previewImport(new File([`${H}\nBepul diagnostik test,otm,20,,,Boshqa savol,Y-1,a,b,c,d,A\n`], "t.csv"));
  check("Server: kod ichidagi test nomi band", p2.errors.some((e) => e.code === "title_exists"));
  const p3 = await previewImport(new File([new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0, 0])], "eski.xls"));
  check("Server: .xls fayl aniq xabar bilan rad etiladi", p3.errors[0]?.code === "file_format" && p3.errors[0].message.includes(".xlsx"));
  const p4 = await previewImport(new File([new Uint8Array([0x74, 0x65, 0xc0, 0xe9])], "cp1251.csv"));
  check("Server: UTF-8 bo‘lmagan CSV — kodirovka xatosi", p4.errors[0]?.code === "encoding");
  const good = await previewImport(new File([templateCsv()], "shablon.csv"));
  let refused = "";
  try {
    await commitImport(good, "test");
  } catch (e) {
    refused = e instanceof Error ? e.message : String(e);
  }
  check("Baza ulanmagan — import bajarilmaydi (soxta muvaffaqiyat yo‘q)", good.canImport && refused.includes("ulanmagan"), refused);

  console.log(failed ? `\n${failed} ta import tekshiruvi muvaffaqiyatsiz` : "\nBarcha import tekshiruvlari muvaffaqiyatli ✓");
  process.exit(failed ? 1 : 0);
}

void main();
