import type { Audience, ExamCategory, ExamMeta, SpecCode } from "@/types/exam";

/**
 * Test Market katalogi — faqat ochiq meta-ma'lumot.
 * Savollar va to'g'ri javoblar bu yerda EMAS: ular src/server/questions ichida
 * va faqat API orqali (access tekshiruvidan keyin) beriladi.
 *
 * status: "coming_soon" testlar katalogda ko'rinadi, lekin sotib olinmaydi va
 * boshlanmaydi — savollar bazasi tayyor bo'lmaguncha ularni «tayyor» deb ko'rsatmaymiz.
 */

const UPDATED = "2026-11-26";
const AUTHOR = "HuquqLab tahririyati";

export const examCategoryLabel: Record<ExamCategory, string> = {
  "milliy-sertifikat": "Milliy sertifikat",
  attestatsiya: "Attestatsiya",
  mavzulashtirilgan: "Mavzulashtirilgan",
  konstitutsiya: "Konstitutsiya",
  kodekslar: "Kodeks va qonunchilik",
  otm: "OTMga tayyorlov",
  oqituvchilar: "O‘qituvchilar uchun",
  talabalar: "Talabalar uchun",
};

export const audienceLabel: Record<Audience, string> = {
  abituriyent: "Abituriyent",
  oqituvchi: "O‘qituvchi",
  repetitor: "Repetitor",
  talaba: "Talaba",
  oquvchi: "O‘quvchi",
};

/** Rasmiy spetsifikatsiya (Bilimni baholash agentligi, 2026-11-17) bo'limlari */
export const specLabel: Record<SpecCode, string> = {
  "1.1": "Shaxs, jamiyat va davlat",
  "1.2": "Huquq va huquq normalari",
  "1.3": "Huquqbuzarlik va yuridik javobgarlik",
  "1.4": "Voyaga yetmaganlarning huquq va burchlari",
  "2.1": "Konstitutsiya va huquqiy davlat",
  "2.2": "Fuqarolik (fuqarolik instituti)",
  "2.3": "Inson huquqlari, erkinliklari va burchlari",
  "2.4": "Fuqarolik jamiyati va davlat hokimiyati",
  "2.5": "O‘zbekiston va xalqaro hamjamiyat",
  "3.1": "Oila huquqi",
  "3.2": "Fuqarolik huquqi",
  "3.3": "Mehnat huquqi",
  "3.4": "Ma’muriy huquq",
  "3.5": "Jinoyat va jinoyat-protsessual huquqi",
  "3.6": "Ekologik huquq",
  "4.1": "Jazo turlari va huquqiy atamalar",
};

/** Bo'lim nomi: spetsifikatsiya kodi bo'lsa — rasmiy nomi, aks holda mavzu matnining o'zi */
export function sectionLabel(spec: string) {
  return (specLabel as Record<string, string>)[spec] ?? (spec || "Boshqa");
}

/** Milliy sertifikat formati — rasmiy «test varianti tafsiloti» bo'yicha */
export const NATIONAL_FORMAT = {
  total: 45,
  kinds: { "Y-1": 32, "Y-2": 3, O: 10 },
  durationMinutes: 90,
  sourceTitle: "Huquqshunoslik fanidan milliy test tizimi uchun test varianti tafsiloti",
  sourceUrl: "https://api-portal.gov.uz/uploads/165/2026/11/17/3b10f62b-456a-3cd1-17c6-1b535340a062_media_.pdf",
  /** Rasmiy ball Rash modeli bilan hisoblanadi — biz uni takrorlay olmaymiz */
  scoring: "Rash modeli",
} as const;

export const exams: ExamMeta[] = [
  {
    id: "diagnostika",
    title: "Bepul diagnostik test",
    category: "milliy-sertifikat",
    description: "Uch bo‘limdan 12 ta savol: qaysi mavzularni takrorlash kerakligini 15 daqiqada aniqlang. Ro‘yxatdan o‘tish shart emas.",
    access: "free",
    status: "available",
    durationMinutes: 15,
    difficulty: "oson",
    questionCount: 12,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 2,
    audience: ["abituriyent", "oquvchi", "oqituvchi"],
  },
  {
    id: "milliy-mock-1",
    title: "Milliy sertifikat: mock test №1",
    category: "milliy-sertifikat",
    description: "Rasmiy format: 32 ta yopiq (Y-1), 3 ta vaziyatli (Y-2) va 10 ta ochiq (O) topshiriq, 90 daqiqa. Har bir savolga izoh va manba.",
    access: "premium",
    status: "available",
    durationMinutes: 90,
    difficulty: "o'rta",
    questionCount: 45,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 3,
    audience: ["abituriyent", "repetitor"],
  },
  {
    id: "nazariya-1",
    title: "Davlat va huquq nazariyasi",
    category: "mavzulashtirilgan",
    description: "Davlat belgilari va shakllari, huquq normasi, huquqbuzarlik va yuridik javobgarlik — spetsifikatsiyaning 1-bo‘limi.",
    access: "premium",
    status: "available",
    durationMinutes: 20,
    difficulty: "o'rta",
    questionCount: 10,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 2,
    audience: ["abituriyent", "talaba", "oquvchi"],
  },
  {
    id: "konstitutsiya-1",
    title: "Konstitutsiya: davlat hokimiyati tizimi",
    category: "konstitutsiya",
    description: "2023-yilgi tahrirdagi Konstitutsiya: Oliy Majlis, Prezident, sud hokimiyati, inson huquqlari kafolatlari.",
    access: "premium",
    status: "available",
    durationMinutes: 20,
    difficulty: "o'rta",
    questionCount: 10,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 2,
    audience: ["abituriyent", "oqituvchi", "talaba"],
  },
  {
    id: "attestatsiya-huquq-1",
    title: "Huquq o‘qituvchilari attestatsiyasi: 1-variant",
    category: "attestatsiya",
    description: "Fan mazmuni va metodika bo‘yicha savollar. Savollar bazasi tayyorlanmoqda.",
    access: "premium",
    status: "coming_soon",
    durationMinutes: 60,
    difficulty: "murakkab",
    questionCount: 50,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 0,
    audience: ["oqituvchi"],
  },
  {
    id: "mehnat-kodeksi-1",
    title: "Mehnat kodeksi: asosiy institutlar",
    category: "kodekslar",
    description: "Mehnat shartnomasi, ish vaqti, ta’til, voyaga yetmaganlar mehnati. Savollar bazasi tayyorlanmoqda.",
    access: "premium",
    status: "coming_soon",
    durationMinutes: 30,
    difficulty: "o'rta",
    questionCount: 20,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 0,
    audience: ["abituriyent", "talaba"],
  },
  {
    id: "talaba-tdhn-1",
    title: "Davlat va huquq nazariyasi (OTM kursi)",
    category: "talabalar",
    description: "Yuridik yo‘nalish talabalari uchun akademik daraja. Savollar bazasi tayyorlanmoqda.",
    access: "premium",
    status: "coming_soon",
    durationMinutes: 40,
    difficulty: "murakkab",
    questionCount: 30,
    author: AUTHOR,
    updatedAt: UPDATED,
    previewCount: 0,
    audience: ["talaba"],
  },
];

export const examById = Object.fromEntries(exams.map((e) => [e.id, e])) as Record<string, ExamMeta>;
