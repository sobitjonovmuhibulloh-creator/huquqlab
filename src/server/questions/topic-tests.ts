import "server-only";
import type { ExamQuestion } from "@/types/exam";
import { open, SRC, y1 } from "./helpers";

export const nazariya1: ExamQuestion[] = [
  y1("nz-01", "1.1", "Unitar davlatga xos belgi qaysi?", ["Har bir subyektning o‘z konstitutsiyasi bor", "Yagona konstitutsiya va yagona oliy davlat organlari tizimi", "Subyektlar ittifoqdan erkin chiqa oladi", "Ikki va undan ortiq fuqarolik"], 1,
    "Unitar davlatda yagona konstitutsiya, yagona fuqarolik va yagona oliy davlat organlari tizimi bo‘ladi; ma’muriy-hududiy birliklar suverenitetga ega emas.", SRC.nazariya),
  y1("nz-02", "1.1", "Hukumat parlament oldida mas’ul bo‘lib, prezident asosan vakillik vakolatlariga ega bo‘lgan respublika qanday ataladi?", ["Prezidentlik respublikasi", "Parlamentar respublika", "Mutlaq monarxiya", "Konfederatsiya"], 1,
    "Parlamentar respublikada hukumatni parlament shakllantiradi va u parlament oldida mas’ul; prezidentlik respublikasida esa prezident ijro hokimiyatiga rahbarlik qiladi.", SRC.nazariya),
  y1("nz-03", "1.1", "Davlat va hokimiyat ilohiy iroda bilan vujudga kelgan deb hisoblovchi nazariya qaysi?", ["Teologik", "Organik", "Marksistik", "Psixologik"], 0,
    "Teologik nazariyaga ko‘ra davlat ilohiy iroda mahsuli; u o‘rta asrlarda keng tarqalgan.", SRC.nazariya, { difficulty: "oson" }),
  y1("nz-04", "1.2", "Normativ-huquqiy hujjatlar orasida eng yuqori yuridik kuchga ega hujjat qaysi?", ["Kodeks", "Prezident farmoni", "Konstitutsiya", "Vazirlar Mahkamasi qarori"], 2,
    "Konstitutsiya eng yuqori yuridik kuchga ega; boshqa barcha hujjatlar unga muvofiq bo‘lishi shart.", SRC.konstitutsiya, { difficulty: "oson" }),
  y1("nz-05", "1.2", "Huquq normasining sanksiyasi nimani belgilaydi?", ["Normaning amal qilish shartlarini", "Xulq-atvor qoidasini", "Norma buzilganda yuzaga keladigan noqulay oqibatlarni", "Normani qabul qilgan organni"], 2,
    "Sanksiya — dispozitsiya buzilganda qo‘llanadigan davlat ta’sir choralari (jazo, majburlov).", SRC.nazariya),
  y1("nz-06", "1.2", "Quyidagilardan qaysi biri ommaviy huquq tarmog‘iga kiradi?", ["Fuqarolik huquqi", "Konstitutsiyaviy huquq", "Oila huquqi", "Vorislik huquqi"], 1,
    "Ommaviy huquq davlat va jamiyat manfaatlarini, hokimiyat munosabatlarini tartibga soladi (konstitutsiyaviy, ma’muriy, jinoyat huquqi). Fuqarolik va oila huquqi — xususiy huquq.", SRC.nazariya),
  y1("nz-07", "1.3", "Huquqbuzarlikning subyektiv tomoniga nimalar kiradi?", ["Ayb, motiv va maqsad", "Qilmish va oqibat", "Jamiyat munosabatlari", "Huquqbuzarning yoshi va aqli rasoligi"], 0,
    "Subyektiv tomon — huquqbuzarning ichki ruhiy munosabati: ayb (qasd yoki ehtiyotsizlik), motiv va maqsad. Yosh va aqli rasolik — subyektga oid belgilar.", SRC.nazariya),
  y1("nz-08", "1.3", "Xodim o‘z aybi bilan ish beruvchiga yetkazgan zarar uchun qanday javobgarlikka tortiladi?", ["Intizomiy", "Moddiy", "Jinoiy", "Konstitutsiyaviy"], 1,
    "Mehnat qonunchiligiga ko‘ra xodim ish beruvchiga yetkazgan to‘g‘ridan-to‘g‘ri haqiqiy zarar uchun moddiy javobgar bo‘ladi.", SRC.mk),
  open("nz-09", "1.1", "Davlat hokimiyatining ichki ishlarda ustunligi va tashqi ishlarda mustaqilligi qanday ataladi?", ["suverenitet", "suverinitet"], "Bitta atama",
    "Suverenitet — davlat hokimiyatining mamlakat ichida oliyligi va xalqaro munosabatlarda mustaqilligi.", SRC.nazariya),
  open("nz-10", "1.2", "Inson irodasiga bog‘liq bo‘lmagan holda yuz beradigan yuridik faktlar qanday ataladi?", ["hodisa", "hodisalar"], "Bitta so‘z",
    "Yuridik faktlar irodaviylik belgisiga ko‘ra hodisalar (irodaga bog‘liq emas) va harakatlarga (irodaviy) bo‘linadi.", SRC.nazariya),
];

export const konstitutsiya1: ExamQuestion[] = [
  y1("kn-01", "2.4", "Qonun chiqaruvchi hokimiyatni amalga oshiruvchi oliy davlat vakillik organi qaysi?", ["Vazirlar Mahkamasi", "Oliy Majlis", "Konstitutsiyaviy sud", "Prezident Administratsiyasi"], 1,
    "Oliy Majlis — oliy davlat vakillik organi, qonun chiqaruvchi hokimiyatni amalga oshiradi.", SRC.konstitutsiya, { difficulty: "oson" }),
  y1("kn-02", "2.4", "Senat a’zolari Qoraqalpog‘iston Respublikasi, viloyatlar va Toshkent shahridan necha nafardan saylanadi?", ["Ikki nafardan", "Uch nafardan", "To‘rt nafardan", "Olti nafardan"], 2,
    "Yangi Konstitutsiyaga ko‘ra har bir hududdan to‘rt nafardan senator saylanadi.", SRC.konstitutsiya),
  y1("kn-03", "2.4", "Senatning nechta a’zosi Prezident tomonidan tayinlanadi?", ["5", "9", "16", "20"], 1,
    "Senatning 9 nafar a’zosi fan, san’at, adabiyot va boshqa sohalarda katta tajribaga ega fuqarolar orasidan Prezident tomonidan tayinlanadi.", SRC.konstitutsiya, { difficulty: "murakkab" }),
  y1("kn-04", "2.4", "O‘zbekiston Prezidenti qanday saylanadi?", ["Oliy Majlis tomonidan", "Fuqarolar tomonidan umumiy, teng va to‘g‘ridan-to‘g‘ri saylov huquqi asosida yashirin ovoz berish yo‘li bilan", "Senat tomonidan ochiq ovoz berish bilan", "Xalq deputatlari kengashlari tomonidan"], 1,
    "Prezident fuqarolar tomonidan umumiy, teng va to‘g‘ridan-to‘g‘ri saylov huquqi asosida yashirin ovoz berish yo‘li bilan saylanadi.", SRC.konstitutsiya),
  y1("kn-05", "2.4", "Qonunchilik palatasi va Senatning vakolat muddati necha yil?", ["4 yil", "5 yil", "6 yil", "7 yil"], 1,
    "Oliy Majlis palatalarining vakolat muddati — besh yil (Prezidentniki esa yetti yil).", SRC.konstitutsiya),
  y1("kn-06", "2.3", "Konstitutsiyaga ko‘ra shaxsni qamoqqa olish va qamoqda saqlash kimning qaroriga ko‘ra amalga oshiriladi?", ["Tergovchining", "Prokurorning", "Sudning", "Ichki ishlar organining"], 2,
    "Yangi Konstitutsiyaga ko‘ra qamoqqa olish, uy qamog‘i va qamoqda saqlash faqat sudning qaroriga ko‘ra amalga oshiriladi.", SRC.konstitutsiya),
  y1("kn-07", "2.3", "Ushlangan shaxsga uning huquqlari va ushlash asoslari tushuntirilishi talabi qanday ataladi?", ["Miranda qoidasi", "Habeas corpus", "Aybsizlik prezumpsiyasi", "Non bis in idem"], 0,
    "Miranda qoidasi — ushlangan shaxsga huquqlari (jim turish, himoyachi va h.k.) tushuntirilishi. Habeas corpus — ushlab turish qonuniyligini sud tekshirishi.", SRC.konstitutsiya, { difficulty: "murakkab" }),
  y1("kn-08", "2.4", "Viloyat, tuman va shaharlarda davlat hokimiyatining vakillik organi qaysi?", ["Hokimlik", "Xalq deputatlari kengashi", "Mahalla fuqarolar yig‘ini", "Senat"], 1,
    "Mahalliy vakillik organi — xalq deputatlari kengashi; hokim — ijro hokimiyatiga rahbar. Mahalla — fuqarolarning o‘zini o‘zi boshqarish organi.", SRC.konstitutsiya),
  open("kn-09", "2.4", "Konstitutsiyaviy nazoratni amalga oshiruvchi sud qanday ataladi?", ["konstitutsiyaviy sud"], "Ikki so‘z",
    "Konstitutsiyaviy sud qonunlar va boshqa hujjatlarning Konstitutsiyaga muvofiqligini tekshiradi.", SRC.konstitutsiya, "oson"),
  open("kn-10", "2.4", "Yangi tahrirdagi Konstitutsiyaga ko‘ra Prezidentning vakolat muddati necha yil?", ["7", "yetti"], "Son",
    "2023-yilgi Konstitutsiya Prezidentning vakolat muddatini 7 yil etib belgiladi.", SRC.konstitutsiya),
];
