import type { LegalDocument, LegalDocumentType } from "@/types";

/**
 * Asosiy huquqiy hujjatlar katalogi (lex.uz'dan ilhomlangan, o'quvchilar uchun).
 *
 * Hujjat matnlari saytga ko'chirilmaydi — faqat lex.uz'dagi rasmiy nusxaga
 * havola beriladi. `lexId` faqat 2026-11-26 da lex.uz sahifasi ochilib,
 * sarlavha va sana solishtirilgan hujjatlarga yozilgan. ID'si tasdiqlanmagan
 * hujjatlar uchun lex.uz qidiruviga havola beriladi.
 *
 * keyPoints: verified — umumiy mazmun to'g'ri; needs_verification — aniq
 * raqam/modda rasmiy matn bilan solishtirilmagan.
 */

export const LEX_BASE = "https://lex.uz/uz";
const CHECKED = "2026-11-26";

export const documentTypeLabel: Record<LegalDocumentType, string> = {
  konstitutsiya: "Konstitutsiya",
  kodeks: "Kodeks",
  qonun: "Qonun",
  xalqaro: "Xalqaro hujjat",
};

export const documents: LegalDocument[] = [
  {
    slug: "konstitutsiya",
    title: "O‘zbekiston Respublikasi Konstitutsiyasi",
    shortTitle: "Konstitutsiya",
    type: "konstitutsiya",
    adoptedAt: "2023-04-30",
    effectiveAt: "2023-05-01",
    lexId: "6445145",
    categoryIds: ["davlat", "inson-huquqlari", "oila", "talim"],
    grades: [7, 8, 9, 10, 11],
    summary:
      "Davlatning Asosiy Qonuni. Davlat tuzilishi, inson huquq va erkinliklari, davlat hokimiyati organlari tizimini belgilaydi. Barcha boshqa qonunlar unga mos bo‘lishi shart.",
    keyPoints: [
      { text: "Yangi tahrir 2023-yil 30-aprelda umumxalq referendumida qabul qilingan va 1-maydan kuchga kirgan.", status: "verified" },
      { text: "Konstitutsiya eng yuqori yuridik kuchga ega: boshqa qonunlar unga zid bo‘lishi mumkin emas.", status: "verified" },
      { text: "Inson, uning hayoti, sha’ni, qadr-qimmati va shaxsiy hayoti daxlsizligi himoya qilinadi.", status: "verified" },
      { text: "Har kim ta’lim olish huquqiga ega; oila, onalik va bolalik davlat himoyasida.", status: "verified" },
      { text: "18 yoshga to‘lgan fuqarolar saylash huquqiga ega.", status: "verified" },
      { text: "Yangi tahrirda moddalar raqami eskisidan farq qiladi — iqtibos keltirishda rasmiy matndan tekshiring.", status: "needs_verification" },
    ],
    match: ["konstitutsiya"],
    checkedAt: CHECKED,
  },
  {
    slug: "fuqarolik-kodeksi",
    title: "O‘zbekiston Respublikasining Fuqarolik kodeksi",
    shortTitle: "Fuqarolik kodeksi",
    type: "kodeks",
    adoptedAt: "1995-12-21",
    lexId: "111189",
    categoryIds: ["fuqarolik", "mulk"],
    grades: [8, 9, 10, 11],
    summary:
      "Mulk, shartnomalar, oldi-sotdi, meros va zararni qoplash kabi fuqarolar o‘rtasidagi mulkiy munosabatlarni tartibga soladi.",
    keyPoints: [
      { text: "Mulk huquqi, topilma, shartnoma va bitimlar qoidalari shu kodeksda.", status: "verified" },
      { text: "Boshqa shaxsga yetkazilgan zarar, qoida tariqasida, uni yetkazgan shaxs tomonidan qoplanadi.", status: "verified" },
      { text: "14 yoshdan 18 yoshgacha bo‘lganlar ayrim bitimlarni mustaqil tuzishi mumkin — doirasi rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["fuqarolik kodeksi"],
    checkedAt: CHECKED,
  },
  {
    slug: "jinoyat-kodeksi",
    title: "O‘zbekiston Respublikasining Jinoyat kodeksi",
    shortTitle: "Jinoyat kodeksi",
    type: "kodeks",
    adoptedAt: "1994-09-22",
    lexId: "111453",
    categoryIds: ["javobgarlik"],
    grades: [9, 10, 11],
    summary: "Qaysi ijtimoiy xavfli qilmishlar jinoyat hisoblanishini va ular uchun qanday jazo qo‘llanishini belgilaydi.",
    keyPoints: [
      { text: "Jinoyat va jazo faqat Jinoyat kodeksi bilan belgilanadi.", status: "verified" },
      { text: "Jinoiy javobgarlik umumiy qoidaga ko‘ra 16 yoshdan, ayrim jinoyatlar uchun undan pastroq yoshdan boshlanadi.", status: "needs_verification" },
      { text: "Aybsizlik prezumpsiyasi: aybi sud tomonidan isbotlanmaguncha shaxs aybsiz hisoblanadi.", status: "verified" },
    ],
    match: ["jinoyat kodeksi"],
    checkedAt: CHECKED,
  },
  {
    slug: "mamuriy-javobgarlik-kodeksi",
    title: "O‘zbekiston Respublikasining Ma’muriy javobgarlik to‘g‘risidagi kodeksi",
    shortTitle: "Ma’muriy javobgarlik kodeksi",
    type: "kodeks",
    adoptedAt: "1994-09-22",
    lexId: "97664",
    categoryIds: ["javobgarlik", "xavfsizlik"],
    grades: [8, 9, 10, 11],
    summary:
      "Jinoyat darajasiga yetmaydigan huquqbuzarliklar (masalan, mayda bezorilik, yo‘l harakati qoidalarini buzish) va ular uchun jarima kabi choralarni belgilaydi.",
    keyPoints: [
      { text: "Ma’muriy huquqbuzarlik uchun jarima, ogohlantirish kabi jazo choralari qo‘llanadi.", status: "verified" },
      { text: "Ma’muriy javobgarlik yoshi — 16 yosh; aniq modda rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["mamuriy javobgarlik"],
    checkedAt: CHECKED,
  },
  {
    slug: "mehnat-kodeksi",
    title: "O‘zbekiston Respublikasining Mehnat kodeksi",
    shortTitle: "Mehnat kodeksi",
    type: "kodeks",
    adoptedAt: "2022-10-28",
    effectiveAt: "2023-04-30",
    lexId: "6257288",
    categoryIds: ["mehnat"],
    grades: [9, 10, 11],
    summary:
      "Ishga qabul qilish, mehnat shartnomasi, ish vaqti, dam olish, ish haqi va voyaga yetmaganlar mehnatining xususiyatlarini tartibga soladi.",
    keyPoints: [
      { text: "Voyaga yetmaganlar uchun qisqartirilgan ish vaqti va qo‘shimcha kafolatlar belgilangan.", status: "verified" },
      { text: "Ishga qabul qilish yoshi va ota-ona roziligi bilan ishlash yoshi — aniq raqamlar rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["mehnat kodeksi"],
    checkedAt: CHECKED,
  },
  {
    slug: "oila-kodeksi",
    title: "O‘zbekiston Respublikasining Oila kodeksi",
    shortTitle: "Oila kodeksi",
    type: "kodeks",
    adoptedAt: "1998-04-30",
    effectiveAt: "1998-09-01",
    lexId: "104720",
    categoryIds: ["oila"],
    grades: [9, 10, 11],
    summary: "Nikoh, ota-ona va farzandlarning huquq va majburiyatlari, aliment, vasiylik va homiylikni tartibga soladi.",
    keyPoints: [
      { text: "Ota-onalar farzandlarini tarbiyalash va ta’minlashga majbur.", status: "verified" },
      { text: "Nikoh yoshi erkak va ayol uchun 18 yosh — istisnolar rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["oila kodeksi"],
    checkedAt: CHECKED,
  },
  {
    slug: "saylov-kodeksi",
    title: "O‘zbekiston Respublikasining Saylov kodeksi",
    shortTitle: "Saylov kodeksi",
    type: "kodeks",
    adoptedAt: "2019-06-25",
    effectiveAt: "2019-06-26",
    lexId: "4386848",
    categoryIds: ["davlat"],
    grades: [10, 11],
    summary: "Prezident, Oliy Majlis va mahalliy kengashlarga saylovlarni tayyorlash va o‘tkazish tartibini belgilaydi.",
    keyPoints: [
      { text: "Saylovlar umumiy, teng va to‘g‘ridan-to‘g‘ri saylov huquqi asosida yashirin ovoz berish yo‘li bilan o‘tkaziladi.", status: "verified" },
      { text: "Turli lavozimlarga saylanish yoshi chegaralari rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["saylov kodeksi"],
    checkedAt: CHECKED,
  },
  {
    slug: "bola-huquqlari-kafolatlari",
    title: "«Bola huquqlarining kafolatlari to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni",
    shortTitle: "Bola huquqlarining kafolatlari to‘g‘risida",
    type: "qonun",
    number: "O‘RQ-139",
    adoptedAt: "2008-01-07",
    effectiveAt: "2008-01-08",
    lexId: "1297315",
    categoryIds: ["inson-huquqlari", "oila"],
    grades: [7, 8, 9],
    summary: "Bolaning asosiy huquqlari — yashash, sog‘liq, ta’lim, himoyalanish va fikr bildirish — hamda ularni ta’minlash kafolatlarini belgilaydi.",
    keyPoints: [
      { text: "Bola — 18 yoshga to‘lmagan shaxs.", status: "verified" },
      { text: "Bola zo‘ravonlik, ekspluatatsiya va qadr-qimmatini kamsituvchi muomaladan himoya qilinadi.", status: "verified" },
      { text: "Bola o‘ziga taalluqli masalalarda fikr bildirish huquqiga ega.", status: "verified" },
    ],
    match: ["bola huquqlarining kafolatlari"],
    checkedAt: CHECKED,
  },
  {
    slug: "talim-togrisida",
    title: "«Ta’lim to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni",
    shortTitle: "Ta’lim to‘g‘risida",
    type: "qonun",
    number: "O‘RQ-637",
    adoptedAt: "2020-09-23",
    effectiveAt: "2020-09-24",
    lexId: "5013007",
    categoryIds: ["talim"],
    grades: [7, 8, 9, 10, 11],
    summary: "Ta’lim tizimi, ta’lim turlari, ta’lim oluvchilar va pedagoglarning huquq va majburiyatlarini belgilaydi.",
    keyPoints: [
      { text: "Ta’lim oluvchilar sifatli ta’lim olish va hurmat bilan muomala qilinish huquqiga ega.", status: "verified" },
      { text: "Ta’lim oluvchilarning majburiyatlari ham belgilangan — aniq modda raqami rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["talim togrisida"],
    checkedAt: CHECKED,
  },
  {
    slug: "shaxsga-doir-malumotlar",
    title: "«Shaxsga doir ma’lumotlar to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni",
    shortTitle: "Shaxsga doir ma’lumotlar to‘g‘risida",
    type: "qonun",
    number: "O‘RQ-547",
    adoptedAt: "2019-07-02",
    effectiveAt: "2019-10-01",
    lexId: "4396419",
    categoryIds: ["raqamli", "inson-huquqlari"],
    grades: [8, 9, 10, 11],
    summary: "Ism, rasm, telefon raqami kabi shaxsga doir ma’lumotlarni yig‘ish, qayta ishlash va himoya qilish tartibini belgilaydi.",
    keyPoints: [
      { text: "Shaxsga doir ma’lumotlar, qoida tariqasida, egasining roziligi bilan qayta ishlanadi.", status: "verified" },
      { text: "Boshqa odamning rasmi yoki ma’lumotini ruxsatsiz tarqatish uning huquqlarini buzishi mumkin.", status: "verified" },
    ],
    match: ["shaxsga doir malumotlar"],
    checkedAt: CHECKED,
  },
  {
    slug: "istemolchilar-huquqlari",
    title: "«Iste’molchilarning huquqlarini himoya qilish to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni",
    shortTitle: "Iste’molchilar huquqlari to‘g‘risida",
    type: "qonun",
    categoryIds: ["fuqarolik"],
    grades: [7, 8, 9, 10, 11],
    summary: "Xaridorning sifatli tovar olish, tovar haqida to‘g‘ri ma’lumot olish va nosoz tovarni almashtirish yoki pulini qaytarib olish huquqlarini belgilaydi.",
    keyPoints: [
      { text: "Iste’molchi xavfsiz va sifatli tovar hamda u haqida to‘liq ma’lumot olish huquqiga ega.", status: "verified" },
      { text: "Nosoz tovar uchun almashtirish, ta’mirlash yoki pulni qaytarish talab qilinishi mumkin — muddatlar rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["istemolchi"],
    checkedAt: CHECKED,
  },
  {
    slug: "yol-harakati-xavfsizligi",
    title: "«Yo‘l harakati xavfsizligi to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni",
    shortTitle: "Yo‘l harakati xavfsizligi to‘g‘risida",
    type: "qonun",
    categoryIds: ["xavfsizlik"],
    grades: [7, 8, 9],
    summary: "Yo‘l harakati ishtirokchilari — piyoda, velosipedchi, haydovchi — xavfsizligini ta’minlashning huquqiy asoslarini belgilaydi.",
    keyPoints: [
      { text: "Har bir yo‘l harakati ishtirokchisi Yo‘l harakati qoidalariga rioya qilishi shart.", status: "verified" },
      { text: "Velosiped va samokat boshqarish yosh chegaralari rasmiy matndan tekshirilsin.", status: "needs_verification" },
    ],
    match: ["yol harakati"],
    checkedAt: CHECKED,
  },
  {
    slug: "bmt-bola-huquqlari-konvensiyasi",
    title: "BMTning Bola huquqlari to‘g‘risidagi konvensiyasi",
    shortTitle: "Bola huquqlari konvensiyasi",
    type: "xalqaro",
    adoptedAt: "1989-11-20",
    categoryIds: ["inson-huquqlari"],
    grades: [7, 8, 9],
    summary: "Bola huquqlariga oid asosiy xalqaro shartnoma. O‘zbekiston unga qo‘shilgan va uning qoidalari milliy qonunchilikda aks etgan.",
    keyPoints: [
      { text: "18 yoshga to‘lmagan har bir inson bola hisoblanadi (1-modda).", status: "verified" },
      { text: "Bolaga oid barcha qarorlarda bolaning manfaatlari birinchi o‘rinda turadi.", status: "verified" },
    ],
    match: ["bola huquqlari togrisidagi konvensiya"],
    checkedAt: CHECKED,
  },
];

export const documentBySlug = Object.fromEntries(documents.map((d) => [d.slug, d])) as Record<string, LegalDocument>;

/** lex.uz'dagi rasmiy nusxa yoki (ID tasdiqlanmagan bo'lsa) qidiruv natijasi */
export function lexUrl(doc: LegalDocument) {
  return doc.lexId ? `${LEX_BASE}/docs/${doc.lexId}` : `${LEX_BASE}/search/all?query=${encodeURIComponent(doc.shortTitle)}`;
}

/** Huquqiy hujjatlar ierarxiyasi — «Qonun qanday o'qiladi» bo'limi uchun */
export const hierarchy = [
  { level: "Konstitutsiya", note: "Eng yuqori yuridik kuchga ega Asosiy Qonun" },
  { level: "Konstitutsiyaviy qonunlar, kodekslar va qonunlar", note: "Oliy Majlis qabul qiladi" },
  { level: "Prezident farmonlari va qarorlari", note: "Qonunlar asosida va ularni ijro etish uchun" },
  { level: "Vazirlar Mahkamasi qarorlari", note: "Masalan, Yo‘l harakati qoidalari" },
  { level: "Vazirlik va idoralar hujjatlari", note: "Tor sohaga oid tartib va qoidalar" },
];
