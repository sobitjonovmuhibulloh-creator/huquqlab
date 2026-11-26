import "server-only";
import type { ExamQuestion } from "@/types/exam";
import { open, SRC, y1, y2 } from "./helpers";

/** Bepul diagnostik test — premium testlar bilan takrorlanmaydigan alohida savollar */
export const diagnostika: ExamQuestion[] = [
  y1("dg-01", "1.1", "Quyidagilardan qaysi biri davlatning belgisi hisoblanmaydi?", ["Hudud", "Ommaviy hokimiyat", "Suverenitet", "Yagona din"], 3,
    "Davlat belgilari — hudud, aholi, ommaviy hokimiyat, suverenitet, soliqlar va huquq. Dunyoviy davlatda yagona majburiy din belgisi bo‘lmaydi.", SRC.nazariya, { difficulty: "oson" }),
  y1("dg-02", "1.1", "Davlat boshqaruvi shakliga ko‘ra qanday turlarga bo‘linadi?", ["Unitar va federativ", "Monarxiya va respublika", "Demokratik va avtoritar", "Ommaviy va xususiy"], 1,
    "Boshqaruv shakli — oliy hokimiyatning tashkil etilishi: monarxiya yoki respublika. Unitar/federativ — tuzilish shakli, demokratik/avtoritar — siyosiy rejim.", SRC.nazariya, { difficulty: "oson" }),
  y1("dg-03", "1.2", "Huquq normasining qaysi elementi normaning qanday sharoitda amal qilishini ko‘rsatadi?", ["Gipoteza", "Dispozitsiya", "Sanksiya", "Preambula"], 0,
    "Gipoteza — normaning amal qilish shart-sharoitlari; dispozitsiya — xulq-atvor qoidasi; sanksiya — qoida buzilganda yuzaga keladigan oqibat.", SRC.nazariya),
  y1("dg-04", "1.3", "Aybning qanday shakllari mavjud?", ["Qasd va ehtiyotsizlik", "Harakat va harakatsizlik", "Obyekt va subyekt", "Jarima va qamoq"], 0,
    "Ayb — shaxsning o‘z qilmishiga ruhiy munosabati; u qasd yoki ehtiyotsizlik shaklida bo‘ladi. Harakat/harakatsizlik — qilmishning obyektiv tomoni.", SRC.nazariya),
  y1("dg-05", "2.1", "O‘zbekiston Respublikasining yangi tahrirdagi Konstitutsiyasi qanday qabul qilingan?", ["Oliy Majlis qarori bilan", "Prezident farmoni bilan", "Umumxalq referendumida", "Konstitutsiyaviy sud qarori bilan"], 2,
    "Yangi tahrirdagi Konstitutsiya 2023-yil 30-aprelda o‘tkazilgan referendumda qabul qilingan va 1-maydan kuchga kirgan.", SRC.konstitutsiya, { difficulty: "oson" }),
  y1("dg-06", "2.4", "Davlat hokimiyati qanday tarmoqlarga bo‘linadi?", ["Markaziy va mahalliy", "Qonun chiqaruvchi, ijro etuvchi va sud", "Siyosiy va iqtisodiy", "Fuqarolik va harbiy"], 1,
    "Hokimiyatlar bo‘linishi prinsipi: qonun chiqaruvchi (Oliy Majlis), ijro etuvchi (Prezident va Vazirlar Mahkamasi) va sud hokimiyati.", SRC.konstitutsiya, { difficulty: "oson" }),
  y1("dg-07", "3.1", "O‘zbekistonda erkak va ayol uchun umumiy nikoh yoshi necha yosh?", ["16 yosh", "17 yosh", "18 yosh", "21 yosh"], 2,
    "Oila kodeksiga ko‘ra nikoh yoshi erkaklar va ayollar uchun bir xil — 18 yosh.", SRC.ok, { difficulty: "oson" }),
  y1("dg-08", "3.2", "Fuqarolik kodeksiga ko‘ra to‘liq muomala layoqati, qoida tariqasida, qachon vujudga keladi?", ["14 yoshdan", "16 yoshdan", "18 yoshdan", "21 yoshdan"], 2,
    "Muomala layoqati to‘liq hajmda voyaga yetganda, ya’ni 18 yoshga to‘lganda vujudga keladi (nikoh va emansipatsiya — istisnolar).", SRC.fk),
  y1("dg-09", "3.5", "Jinoyat kodeksiga ko‘ra jinoiy javobgarlikning umumiy yoshi qancha?", ["13 yosh", "14 yosh", "16 yosh", "18 yosh"], 2,
    "Umumiy qoidaga ko‘ra jinoiy javobgarlik 16 yoshdan boshlanadi; ayrim jinoyatlar uchun qonunda pastroq yosh belgilangan.", SRC.jk),
  y2("dg-10", "3.2",
    "Aziza do‘kondan quloqchin sotib oldi. Ikki kundan keyin quloqchinning bir tomoni ishlamay qoldi. Sotuvchi chekda «Sotilgan tovar qaytarib olinmaydi» deb yozilganini aytib, murojaatni rad etdi.",
    "Vaziyatga huquqiy baho bering.",
    ["Sotuvchi haq — chekdagi yozuv majburiy", "Aziza nosoz tovar bo‘yicha qonunda belgilangan talablarni qo‘yishga haqli", "Aziza faqat ishlab chiqaruvchiga murojaat qila oladi", "Tovar ishlatilgani uchun hech qanday talab qo‘yib bo‘lmaydi"], 1,
    "Iste’molchining nosoz tovar bo‘yicha huquqlari (almashtirish, ta’mirlash yoki pulni qaytarish) qonun bilan belgilangan; sotuvchining bir tomonlama yozuvi bu huquqlarni cheklay olmaydi.", SRC.istemol),
  open("dg-11", "2.1", "O‘zbekiston Respublikasining davlat tili qaysi til?", ["o‘zbek tili", "o‘zbek", "ozbek tili", "ozbek"], "Ikki so‘z: «… tili»",
    "Konstitutsiyaga ko‘ra O‘zbekiston Respublikasining davlat tili — o‘zbek tili.", SRC.konstitutsiya, "oson"),
  open("dg-12", "1.2", "Huquq normasining xulq-atvor qoidasini ifodalovchi elementi qanday ataladi?", ["dispozitsiya"], "Bitta atama",
    "Dispozitsiya — huquq normasining markaziy qismi: subyekt qanday harakat qilishi mumkin yoki shartligini belgilaydi.", SRC.nazariya),
];
