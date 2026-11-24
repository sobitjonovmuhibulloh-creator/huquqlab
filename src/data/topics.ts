import type { Topic } from "@/types";

/**
 * Demo kontent. Huquqiy manbalar ikki holatda belgilanadi:
 *  - verified: hujjat rasmiy manbada (lex.uz) mavjud, umumiy mazmuni to'g'ri;
 *  - needs_verification: modda raqami yoki aniq tafsilot rasmiy matn bilan
 *    solishtirilmagan — saytda «Tekshirish talab etiladi» deb ko'rsatiladi.
 * Kontentni o'quv jarayonida qo'llashdan oldin lex.uz orqali tekshiring.
 */

const UPDATED = "2026-11-24";

export const topics: Topic[] = [
  {
    id: "t-bola-huquqlari",
    slug: "bola-huquqlari",
    title: "Bola huquqlari va ularning kafolatlari",
    shortDescription: "Har bir bola qanday huquqlarga ega va ularni kim himoya qiladi?",
    categoryId: "inson-huquqlari",
    grades: [7, 8],
    durationMinutes: 12,
    difficulty: "oson",
    popular: true,
    intro:
      "Har bir bola tug‘ilgan kunidanoq huquqlarga ega. Bu huquqlar uning hayoti, sog‘lig‘i, ta’limi va qadr-qimmatini himoya qiladi. Ularni bilish — o‘zingni va do‘stlaringni himoya qilishning birinchi qadami.",
    explanation: [
      "Bola — 18 yoshga to‘lmagan shaxs. Bu ta’rif BMTning Bola huquqlari to‘g‘risidagi konvensiyasida berilgan va O‘zbekiston qonunchiligida ham qo‘llanadi.",
      "Bola huquqlarini sodda qilib uch guruhga ajratish mumkin: yashash va rivojlanish huquqlari (sog‘liq, ta’lim, dam olish), himoyalanish huquqlari (zo‘ravonlik, ekspluatatsiya va kamsitishdan himoya) va ishtirok etish huquqlari (o‘z fikrini bildirish, ma’lumot olish).",
      "Bu huquqlarni ta’minlash ota-ona, maktab va davlatning vazifasidir. Agar huquqing buzilsa, sen ishonchli kattalarga — ota-onang, sinf rahbaring, maktab psixologiga murojaat qilishing mumkin.",
      "Huquq bilan birga mas’uliyat ham keladi: boshqalarning huquqlarini hurmat qilish, qonunlarga va maktab tartibiga rioya qilish ham har bir o‘quvchining burchidir.",
    ],
    concepts: [
      { term: "Bola", definition: "18 yoshga to‘lmagan shaxs." },
      { term: "Huquq", definition: "Shaxsning qonun bilan kafolatlangan imkoniyati — biror narsani qilish yoki talab qilish erkinligi." },
      { term: "Kafolat", definition: "Huquqning amalda ta’minlanishini va himoya qilinishini ta’minlovchi vositalar." },
      { term: "Qonuniy vakil", definition: "Bolaning manfaatlarini himoya qiluvchi shaxs: ota-ona, vasiy yoki homiy." },
      { term: "Ombudsman", definition: "Inson (bola) huquqlariga rioya etilishini nazorat qiluvchi mustaqil vakil." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Oila, onalik va bolalikni davlat himoyasiga oladi; har bir insonning qadr-qimmati daxlsizligini kafolatlaydi.", status: "verified" },
      { id: "lb-2", document: "«Bola huquqlarining kafolatlari to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni (2008-yil)", summary: "Bolaning asosiy huquqlari va ularni ta’minlash kafolatlarini belgilaydi.", status: "verified" },
      { id: "lb-3", document: "BMTning Bola huquqlari to‘g‘risidagi konvensiyasi (1989-yil)", article: "1-modda", summary: "18 yoshga to‘lmagan har bir inson bola hisoblanadi.", status: "verified" },
      { id: "lb-4", document: "Bola huquqlari bo‘yicha vakil (Bolalar ombudsmani) faoliyati", summary: "Vakilning vakolatlari va murojaat tartibi tafsilotlarini rasmiy manbadan aniqlang.", status: "needs_verification" },
    ],
    example:
      "Oila yangi shaharga ko‘chib o‘tishni rejalashtirmoqda. 13 yoshli Dilshod qaysi maktabga borishi haqida o‘z fikrini aytmoqchi. Bola o‘ziga taalluqli masalalarda fikr bildirish huquqiga ega — ota-ona yakuniy qarorni qabul qilsa ham, Dilshodning fikri tinglanishi va inobatga olinishi kerak.",
    caseStudy: {
      situation: "Bir o‘quvchi uy vazifasini bajarmagani uchun o‘qituvchi uni butun sinf oldida haqoratli so‘zlar bilan kamsitdi.",
      question: "O‘quvchining qaysi huquqi buzildi va u nima qilishi mumkin?",
      analysis:
        "Uy vazifasini bajarmaslik intizomiy masala, ammo bu bolaning sha’ni va qadr-qimmatini kamsitishga asos bo‘lmaydi. O‘quvchi voqeani ota-onasiga aytishi, ular esa maktab rahbariyatiga yozma murojaat qilishi mumkin. Masala hal etilmasa — yuqori turuvchi ta’lim boshqaruvi organiga yoki bola huquqlari bo‘yicha vakilga murojaat qilish mumkin.",
    },
    summary: [
      "18 yoshga to‘lmagan har bir shaxs — bola va u alohida himoyaga ega.",
      "Bola huquqlari: yashash va rivojlanish, himoyalanish, ishtirok etish.",
      "Huquq buzilsa — ishonchli kattalarga va vakolatli organlarga murojaat qilinadi.",
      "Huquq bilan birga boshqalarning huquqlarini hurmat qilish mas’uliyati ham bor.",
    ],
    quiz: [
      { id: "q1", question: "Xalqaro huquqqa ko‘ra kim «bola» hisoblanadi?", options: ["14 yoshgacha bo‘lgan shaxs", "16 yoshgacha bo‘lgan shaxs", "18 yoshga to‘lmagan shaxs", "Maktabda o‘qiyotgan har qanday shaxs"], correctIndex: 2, explanation: "BMTning Bola huquqlari to‘g‘risidagi konvensiyasiga ko‘ra 18 yoshga to‘lmagan har bir inson bola hisoblanadi." },
      { id: "q2", question: "Quyidagilardan qaysi biri ishtirok etish huquqiga misol?", options: ["Tibbiy yordam olish", "O‘ziga taalluqli masalada fikr bildirish", "Bepul darslik olish", "Dam olish kunlari"], correctIndex: 1, explanation: "Fikr bildirish va ma’lumot olish — ishtirok etish huquqlari guruhiga kiradi." },
      { id: "q3", question: "Bolaning qonuniy vakili kim bo‘lishi mumkin?", options: ["Faqat sinf rahbari", "Ota-ona, vasiy yoki homiy", "Har qanday qo‘shni", "Sinfdoshi"], correctIndex: 1, explanation: "Qonuniy vakillar — ota-ona, vasiy yoki homiy. Ular bolaning manfaatlarini himoya qiladi." },
      { id: "q4", question: "O‘qituvchi o‘quvchini sinf oldida haqoratladi. To‘g‘ri birinchi qadam qaysi?", options: ["Javoban haqorat qilish", "Hech kimga aytmaslik", "Ota-onaga aytib, maktab rahbariyatiga murojaat qilish", "Maktabga bormay qo‘yish"], correctIndex: 2, explanation: "Huquq buzilganda ishonchli kattalar yordamida rasmiy tartibda murojaat qilish to‘g‘ri yo‘l." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-talim-huquqi",
    slug: "talim-huquqi",
    title: "Ta’lim olish huquqi va o‘quvchi majburiyatlari",
    shortDescription: "Maktabda sening huquqlaring qanday va qanday majburiyatlaring bor?",
    categoryId: "talim",
    grades: [7, 8, 9],
    durationMinutes: 10,
    difficulty: "oson",
    popular: true,
    intro:
      "Ta’lim — kelajagingning poydevori. Konstitutsiya har bir insonga ta’lim olish huquqini kafolatlaydi. Lekin maktab faqat huquqlar emas, balki o‘zaro hurmat va mas’uliyat makoni hamdir.",
    explanation: [
      "Har kim ta’lim olish huquqiga ega. Davlat umumiy o‘rta ta’limni bepul va majburiy tarzda ta’minlaydi.",
      "O‘quvchi sifatli ta’lim olish, xavfsiz muhitda o‘qish, o‘z qobiliyatlarini rivojlantirish (to‘garaklar, olimpiadalar) va hurmat bilan munosabatda bo‘linish huquqiga ega.",
      "O‘quvchining majburiyatlari ham bor: darslarga qatnashish, maktab ichki tartib qoidalariga rioya qilish, o‘qituvchilar va sinfdoshlarni hurmat qilish, maktab mulkini asrash.",
      "Maktabdagi har qanday nizoni avval sinf rahbari, so‘ng maktab rahbariyati bilan muhokama qilish kerak. Ota-ona bu jarayonda sening qonuniy vakilingdir.",
    ],
    concepts: [
      { term: "Umumiy o‘rta ta’lim", definition: "Davlat tomonidan bepul va majburiy ta’minlanadigan maktab ta’limi." },
      { term: "Ichki tartib qoidalari", definition: "Maktabda o‘quvchilar va xodimlar rioya qilishi shart bo‘lgan qoidalar to‘plami." },
      { term: "Inklyuziv ta’lim", definition: "Alohida ehtiyojli bolalarning boshqalar bilan birga ta’lim olishini ta’minlash." },
      { term: "Intizomiy chora", definition: "Tartibni buzganlik uchun maktab tomonidan qo‘llanadigan tarbiyaviy choralar." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Har kim ta’lim olish huquqiga ega; umumiy o‘rta ta’lim davlat tomonidan kafolatlanadi.", status: "verified" },
      { id: "lb-2", document: "«Ta’lim to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni (2020-yil)", summary: "Ta’lim tizimi, ta’lim oluvchilarning huquq va majburiyatlarini belgilaydi.", status: "verified" },
      { id: "lb-3", document: "«Ta’lim to‘g‘risida»gi Qonun — ta’lim oluvchilarning huquq va majburiyatlari", article: "Modda raqami", summary: "O‘quvchi huquq va majburiyatlari ro‘yxati aniq moddasi bilan rasmiy matndan tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Malika matematika olimpiadasida qatnashmoqchi, lekin unga «sen hali kichiksan» deyishdi. Agar olimpiada nizomida yosh yoki sinf cheklovi bo‘lmasa, Malika qobiliyatini rivojlantirish huquqiga ega va sinf rahbari orqali ishtirok etishni so‘rashi mumkin.",
    caseStudy: {
      situation: "Dars paytida o‘quvchining telefoni jiringladi va o‘qituvchi telefonni olib qo‘ydi.",
      question: "O‘qituvchi to‘g‘ri harakat qildimi va telefon qanday qaytarilishi kerak?",
      analysis:
        "Agar maktab ichki tartib qoidalarida dars paytida telefondan foydalanish cheklangan bo‘lsa, o‘qituvchi tartibni tiklash uchun choralar ko‘rishi mumkin. Biroq telefon o‘quvchi yoki oilasining mulki bo‘lib, u vaqtincha olinishi va qoidalarda belgilangan tartibda (masalan, dars oxirida yoki ota-onaga) qaytarilishi kerak. Aniq tartib har bir maktab qoidalarida — tekshirish talab etiladi.",
    },
    summary: [
      "Ta’lim olish — Konstitutsiyaviy huquq; umumiy o‘rta ta’lim bepul va majburiy.",
      "O‘quvchi xavfsiz muhit va hurmatli munosabatga haqli.",
      "Darsga qatnashish va ichki tartibga rioya qilish — o‘quvchi majburiyati.",
      "Nizolar bosqichma-bosqich: sinf rahbari → rahbariyat → yuqori organ.",
    ],
    quiz: [
      { id: "q1", question: "Umumiy o‘rta ta’lim O‘zbekistonda qanday ta’minlanadi?", options: ["Pullik va ixtiyoriy", "Bepul va majburiy", "Faqat shaharlarda bepul", "Faqat imtihon orqali"], correctIndex: 1, explanation: "Davlat umumiy o‘rta ta’limni bepul va majburiy tarzda ta’minlaydi." },
      { id: "q2", question: "Quyidagilardan qaysi biri o‘quvchining majburiyati?", options: ["Olimpiadada g‘olib bo‘lish", "Maktab ichki tartib qoidalariga rioya qilish", "Har kuni to‘garakka borish", "Sinf sardori bo‘lish"], correctIndex: 1, explanation: "Ichki tartib qoidalariga rioya qilish — har bir o‘quvchining majburiyati." },
      { id: "q3", question: "Maktabdagi nizoni hal qilishda odatda birinchi kimga murojaat qilinadi?", options: ["Sudga", "Ijtimoiy tarmoqqa", "Sinf rahbariga", "Vazirlikka"], correctIndex: 2, explanation: "Nizolar bosqichma-bosqich hal etiladi: avval sinf rahbari, keyin maktab rahbariyati." },
      { id: "q4", question: "Inklyuziv ta’lim nimani anglatadi?", options: ["Faqat iqtidorli bolalar uchun maktab", "Alohida ehtiyojli bolalarning boshqalar bilan birga o‘qishi", "Masofaviy ta’lim", "Xususiy maktab"], correctIndex: 1, explanation: "Inklyuziv ta’lim — barcha bolalarning birgalikda, teng sharoitda ta’lim olishini ta’minlash." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-topilma",
    slug: "topilgan-narsa",
    title: "Topilgan narsa: huquq va mas’uliyat",
    shortDescription: "Birovning narsasini topib olsang, qonun nima deydi?",
    categoryId: "mulk",
    grades: [7, 8],
    durationMinutes: 8,
    difficulty: "oson",
    popular: true,
    simulatorId: "topilgan-hamyon",
    intro:
      "Ko‘chada telefon, maktab koridorida hamyon yoki avtobusda sumka topib olish — hayotda tez-tez uchraydigan holat. «Topgan — o‘ziniki» degan gap qonun nuqtai nazaridan noto‘g‘ri.",
    explanation: [
      "Yo‘qotilgan narsa egasining mulki bo‘lib qolaveradi. Uni topgan kishi uning yangi egasiga aylanmaydi.",
      "Topgan shaxs narsani egasiga qaytarish yoki egasini topish uchun choralar ko‘rishi kerak. Egasi noma’lum bo‘lsa, topilma vakolatli organga (masalan, ichki ishlar organi yoki mahalliy hokimiyat) yoki narsa topilgan bino/transport ma’muriyatiga topshiriladi.",
      "Maktabda topilgan narsani maktab ma’muriyatiga yoki navbatchi o‘qituvchiga topshirish — eng to‘g‘ri va xavfsiz yo‘l.",
      "Topilgan narsani yashirish va o‘zlashtirib olish huquqbuzarlik hisoblanib, javobgarlikka sabab bo‘lishi mumkin. Shuningdek, bu ishonchni yo‘qotishga olib keladi.",
    ],
    concepts: [
      { term: "Topilma", definition: "Egasi yo‘qotgan va boshqa shaxs tomonidan topilgan narsa." },
      { term: "Mulk huquqi", definition: "Egasining o‘z mulkiga egalik qilish, undan foydalanish va uni tasarruf etish huquqi." },
      { term: "O‘zlashtirish", definition: "Birovning mulkini qonunga xilof ravishda o‘ziniki qilib olish." },
      { term: "Mukofot", definition: "Egasi topilma uchun topgan shaxsga berishi mumkin bo‘lgan haq." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Fuqarolik kodeksi", summary: "Mulk huquqi va topilma bilan bog‘liq munosabatlarni tartibga soladi.", status: "verified" },
      { id: "lb-2", document: "Fuqarolik kodeksi — «Topilma» moddasi", article: "Modda raqami", summary: "Topgan shaxsning egasiga xabar berish va topilmani vakolatli organga topshirish majburiyati. Aniq modda raqami rasmiy matndan tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-3", document: "Fuqarolik kodeksi — topilmaga mulk huquqi va mukofot", summary: "Egasi ma’lum muddat ichida topilmasa, topilmaga huquq o‘tishi va topganga mukofot berilishi tartibi (muddat va mukofot miqdori) tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-4", document: "Ma’muriy javobgarlik to‘g‘risidagi kodeks / Jinoyat kodeksi", summary: "O‘zganing mulkini qonunga xilof o‘zlashtirish uchun javobgarlik turlari va miqdori tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Bekzod avtobusda telefon topdi. U telefonni haydovchiga topshirdi va telefonga qo‘ng‘iroq qilgan egasiga qayerdan olishini aytdi. Bekzod qonunga ham, vijdonga ham mos harakat qildi.",
    caseStudy: {
      situation: "Nodira maktab hovlisida qimmatbaho soat topdi va «egasi o‘zi so‘rab kelsa beraman» deb uyiga olib ketdi.",
      question: "Nodiraning harakati to‘g‘rimi?",
      analysis:
        "Yo‘q. Narsani uyga olib ketish egasining uni topishini qiyinlashtiradi va keyinchalik o‘zlashtirishda gumon qilinishga sabab bo‘lishi mumkin. To‘g‘risi — darhol maktab ma’muriyatiga topshirish, qayerda va qachon topilganini aytish.",
    },
    summary: [
      "Topilgan narsa — egasining mulki.",
      "Egasini topishga harakat qilish yoki vakolatli shaxsga topshirish kerak.",
      "Maktabda — ma’muriyat yoki navbatchi o‘qituvchiga topshiriladi.",
      "O‘zlashtirib olish javobgarlikka sabab bo‘lishi mumkin.",
    ],
    quiz: [
      { id: "q1", question: "Ko‘chada topilgan hamyon kimning mulki hisoblanadi?", options: ["Topgan kishining", "Davlatning", "Uni yo‘qotgan egasining", "Hech kimning"], correctIndex: 2, explanation: "Yo‘qotilgan narsa egasining mulki bo‘lib qolaveradi." },
      { id: "q2", question: "Maktab koridorida telefon topib olding. Eng to‘g‘ri harakat?", options: ["O‘zingda saqlab turish", "Maktab ma’muriyatiga topshirish", "Sotib yuborish", "Joyiga tashlab ketish"], correctIndex: 1, explanation: "Maktabda topilgan narsa ma’muriyat yoki navbatchi o‘qituvchiga topshiriladi." },
      { id: "q3", question: "Topilgan narsani yashirib, o‘zlashtirib olish nimaga olib kelishi mumkin?", options: ["Mukofotga", "Hech narsaga", "Yuridik javobgarlikka", "Mulk huquqiga avtomatik ega bo‘lishga"], correctIndex: 2, explanation: "O‘zganing mulkini qonunga xilof o‘zlashtirish javobgarlikka sabab bo‘lishi mumkin." },
      { id: "q4", question: "Egasi noma’lum bo‘lsa, topilma kimga topshiriladi?", options: ["Vakolatli organ yoki bino ma’muriyatiga", "Eng yaqin do‘konga", "Ijtimoiy tarmoqdagi guruhga", "Hech kimga"], correctIndex: 0, explanation: "Egasi noma’lum bo‘lsa, topilma vakolatli organga yoki topilgan joy ma’muriyatiga topshiriladi." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-kiberbulling",
    slug: "bulling-va-kiberbulling",
    title: "Bulling va kiberbullingdan himoyalanish",
    shortDescription: "Masxara, tazyiq va onlayn haqoratga qanday qarshi turish mumkin?",
    categoryId: "raqamli",
    grades: [7, 8, 9],
    durationMinutes: 12,
    difficulty: "o'rta",
    popular: true,
    simulatorId: "guruh-chati",
    intro:
      "Bulling — bir kishiga muntazam ravishda tazyiq o‘tkazish, masxara qilish yoki kamsitish. Internetda sodir bo‘lsa — kiberbulling deyiladi. Bu «shunchaki hazil» emas, balki insonning qadr-qimmatiga tajovuzdir.",
    explanation: [
      "Bullingning belgilari: takrorlanadi, kuchlar teng emas (bir guruh bitta odamga qarshi), jabrlanuvchiga jismoniy yoki ruhiy zarar yetkazadi.",
      "Kiberbulling turlari: haqoratli xabarlar, birovning rasmini masxara qilib tahrirlash va tarqatish, soxta profil ochish, guruhdan ataylab chiqarib yuborish.",
      "Kuzatuvchi ham muhim rol o‘ynaydi: masxarali postni forward qilish yoki «kulgu» qo‘yish bullingni kuchaytiradi. Qo‘llab-quvvatlash va kattalarga xabar berish esa uni to‘xtatadi.",
      "Agar bullingga uchrasang: javob qaytarma, dalillarni saqla (skrinshot), bloklash va shikoyat funksiyasidan foydalan, ishonchli kattaga ayt.",
    ],
    concepts: [
      { term: "Bulling", definition: "Bir shaxsga nisbatan muntazam takrorlanadigan tazyiq, kamsitish yoki zo‘ravonlik." },
      { term: "Kiberbulling", definition: "Internet, ijtimoiy tarmoq yoki messenjer orqali amalga oshiriladigan bulling." },
      { term: "Kuzatuvchi", definition: "Bullingni ko‘rib turgan, lekin bevosita ishtirok etmayotgan shaxs." },
      { term: "Raqamli iz", definition: "Internetda qoldirilgan har qanday ma’lumot — post, izoh, rasm. U uzoq vaqt saqlanadi." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Insonning sha’ni va qadr-qimmati, shaxsiy hayoti daxlsizligi himoya qilinadi.", status: "verified" },
      { id: "lb-2", document: "«Bola huquqlarining kafolatlari to‘g‘risida»gi Qonun (2008-yil)", summary: "Bolani zo‘ravonlik va qadr-qimmatini kamsituvchi muomaladan himoya qilish kafolatlari.", status: "verified" },
      { id: "lb-3", document: "«Shaxsga doir ma’lumotlar to‘g‘risida»gi Qonun (2019-yil)", summary: "Shaxsga doir ma’lumotlarni (jumladan, tasvirni) qonunga xilof tarqatishdan himoya qiladi.", status: "verified" },
      { id: "lb-4", document: "Ma’muriy javobgarlik to‘g‘risidagi kodeks / Jinoyat kodeksi", summary: "Haqorat va tuhmat uchun javobgarlik moddalari va ularning onlayn holatlarga qo‘llanishi tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Sinf guruhida Jasurning rasmi ustidan kulgili yozuv qo‘yib tarqatishdi. Laylo rasmni forward qilmadi, Jasurga shaxsiy xabarda «Men sen tomondaman» deb yozdi va sinf rahbariga skrinshot yubordi. Rasm o‘chirildi, tarqatgan o‘quvchi bilan suhbat o‘tkazildi.",
    caseStudy: {
      situation: "Noma’lum profil sinfdoshing haqida yolg‘on gaplar yozmoqda va uning rasmlarini joylashtirmoqda.",
      question: "Jabrlanuvchi va kuzatuvchilar nima qilishi kerak?",
      analysis:
        "Javob yozish yoki tahdid qilish vaziyatni yomonlashtiradi. Dalillarni (skrinshot, havola, sana) saqlash, platformaga shikoyat qilish, ota-ona va maktab rahbariyatiga xabar berish kerak. Agar tahdid yoki jiddiy zarar bo‘lsa — huquqni muhofaza qiluvchi organlarga (102) murojaat qilinadi.",
    },
    summary: [
      "Bulling — takrorlanuvchi tazyiq; kiberbulling — uning onlayn shakli.",
      "Masxarali kontentni tarqatish ham bullingda ishtirok etish demakdir.",
      "Dalil saqla, blokla, shikoyat qil, kattalarga ayt.",
      "Sha’n va qadr-qimmat qonun bilan himoyalangan.",
    ],
    quiz: [
      { id: "q1", question: "Quyidagilardan qaysi biri kiberbulling?", options: ["Do‘stga tug‘ilgan kun tabrigi yozish", "Sinfdoshning rasmini masxara qilib tarqatish", "Guruhda uy vazifasini so‘rash", "Rasmga «like» bosish"], correctIndex: 1, explanation: "Birovning rasmini masxara qilib tarqatish — kiberbullingning keng tarqalgan shakli." },
      { id: "q2", question: "Kiberbullingga uchraganda birinchi navbatda nima qilish kerak?", options: ["Haqorat bilan javob qaytarish", "Telefonni sindirish", "Dalillarni saqlab, ishonchli kattaga aytish", "Hammasini o‘chirib, unutish"], correctIndex: 2, explanation: "Dalillar keyinchalik muammoni hal qilishda kerak bo‘ladi; kattalar yordami muhim." },
      { id: "q3", question: "Masxarali postni forward qilgan kuzatuvchi...", options: ["Hech qanday aybga ega emas", "Bullingni kuchaytiradi", "Jabrlanuvchiga yordam beradi", "Faqat hazillashadi"], correctIndex: 1, explanation: "Tarqatish orqali kuzatuvchi bullingning ishtirokchisiga aylanadi." },
      { id: "q4", question: "Tahdid yoki jiddiy zarar bo‘lsa, qaysi raqamga qo‘ng‘iroq qilinadi?", options: ["101", "102", "103", "104"], correctIndex: 1, explanation: "102 — ichki ishlar organlari (militsiya) xizmati raqami." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-shaxsiy-malumotlar",
    slug: "shaxsiy-malumotlar",
    title: "Shaxsiy ma’lumotlar va internetda xavfsizlik",
    shortDescription: "Parol, rasm va manzil — nimalarni sir saqlash kerak?",
    categoryId: "raqamli",
    grades: [8, 9, 10],
    durationMinutes: 10,
    difficulty: "o'rta",
    intro:
      "Ism-familiya, telefon raqam, manzil, rasm, hatto joylashuving ham — shaxsiy ma’lumotlaring. Ular qimmatbaho va qonun bilan himoyalangan. Internetda ularni ehtiyotkorlik bilan baham ko‘r.",
    explanation: [
      "Shaxsga doir ma’lumot — muayyan shaxsni aniqlash imkonini beruvchi har qanday axborot.",
      "Boshqa odamning rasmini yoki shaxsiy ma’lumotini uning roziligisiz tarqatish uning huquqlarini buzishi mumkin.",
      "Firibgarlar SMS-kod, karta raqami va parollarni «sovg‘a yutding» yoki «akkaunting bloklandi» kabi xabarlar orqali so‘rashadi. Hech qachon SMS-kodni hech kimga aytma.",
      "Kuchli parol, ikki bosqichli autentifikatsiya va profil maxfiylik sozlamalari — raqamli xavfsizlikning asosiy qoidalari.",
    ],
    concepts: [
      { term: "Shaxsga doir ma’lumot", definition: "Shaxsni aniqlash imkonini beruvchi axborot: ism, rasm, manzil, telefon va h.k." },
      { term: "Rozilik", definition: "Shaxsning o‘z ma’lumotlarini qayta ishlashga ixtiyoriy ruxsati." },
      { term: "Fishing", definition: "Soxta xabar yoki sayt orqali parol va kodlarni o‘g‘irlash usuli." },
      { term: "Ikki bosqichli autentifikatsiya", definition: "Parolga qo‘shimcha ravishda kod orqali shaxsni tasdiqlash." },
    ],
    legalBasis: [
      { id: "lb-1", document: "«Shaxsga doir ma’lumotlar to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni (2019-yil)", summary: "Shaxsga doir ma’lumotlarni yig‘ish, qayta ishlash va himoya qilish tartibini belgilaydi.", status: "verified" },
      { id: "lb-2", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Shaxsiy hayot daxlsizligi, yozishmalar va telefon so‘zlashuvlari sir saqlanishi kafolatlanadi.", status: "verified" },
      { id: "lb-3", document: "Shaxsga doir ma’lumotlar qonunchiligini buzganlik uchun javobgarlik", summary: "Javobgarlik turi va miqdori rasmiy manbadan tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Sardorga «Telefon yutding! Sovg‘ani olish uchun SMS-kodni yubor» degan xabar keldi. Sardor kodni yubormadi, raqamni blokladi va ota-onasiga aytdi. U firibgarlik qurboni bo‘lishdan saqlandi.",
    caseStudy: {
      situation: "Sinfdoshing sening uyda tushgan rasmingni ruxsatsiz ochiq kanalga joylab qo‘ydi.",
      question: "Sen qanday harakat qilishing mumkin?",
      analysis:
        "Avval sinfdoshingdan rasmni o‘chirishni xushmuomalalik bilan so‘ra. Rad etsa, platformaga shikoyat yubor va ota-onang hamda sinf rahbaringga ayt. Rasm — shaxsga doir ma’lumot, uni roziligingsiz tarqatish huquqingni buzishi mumkin.",
    },
    summary: [
      "Rasm, manzil, telefon — shaxsga doir ma’lumot.",
      "Boshqalarning ma’lumotini roziligisiz tarqatma.",
      "SMS-kod va parolni hech kimga aytma.",
      "Maxfiylik sozlamalari va ikki bosqichli himoyadan foydalan.",
    ],
    quiz: [
      { id: "q1", question: "Quyidagilardan qaysi biri shaxsga doir ma’lumot?", options: ["Ob-havo ma’lumoti", "Uy manzilingiz", "Kitob nomi", "Futbol natijasi"], correctIndex: 1, explanation: "Uy manzili shaxsni aniqlash imkonini beradi — bu shaxsga doir ma’lumot." },
      { id: "q2", question: "«Akkauntingiz bloklandi, kodni yuboring» degan xabar kelsa...", options: ["Kodni darhol yuborish", "Kodni hech kimga bermaslik va xabarni e’tiborsiz qoldirish", "Do‘stlarga tarqatish", "Javob yozib, sabab so‘rash"], correctIndex: 1, explanation: "Bu fishing. SMS-kodni hech kimga bermaslik kerak." },
      { id: "q3", question: "Kuchli parolga misol qaysi?", options: ["123456", "ismim2010", "K8#mavzu!Tosh_29", "qwerty"], correctIndex: 2, explanation: "Kuchli parol — uzun, harf, raqam va belgilar aralashmasi." },
      { id: "q4", question: "Birovning rasmini ochiq kanalga joylashdan oldin nima kerak?", options: ["Hech narsa", "Uning roziligi", "Kanal administratorining ruxsati", "Rasmni tahrirlash"], correctIndex: 1, explanation: "Shaxsning tasviri — shaxsga doir ma’lumot; tarqatish uchun uning roziligi kerak." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-istemolchi",
    slug: "istemolchi-huquqlari",
    title: "Iste’molchi huquqlari",
    shortDescription: "Sifatsiz tovar sotib olsang, uni qaytarish mumkinmi?",
    categoryId: "fuqarolik",
    grades: [9, 10],
    durationMinutes: 10,
    difficulty: "o'rta",
    popular: true,
    simulatorId: "nosoz-quloqchin",
    intro:
      "Har kuni nimadir sotib olamiz: non, daftar, quloqchin. Har bir xaridda sen iste’molchisan va qonun sening huquqlaringni himoya qiladi.",
    explanation: [
      "Iste’molchi — shaxsiy ehtiyojlari uchun tovar sotib oluvchi yoki xizmatdan foydalanuvchi shaxs.",
      "Iste’molchi sifatli va xavfsiz tovar, tovar haqida to‘liq va to‘g‘ri ma’lumot olish huquqiga ega.",
      "Tovar sifatsiz chiqsa, iste’molchi uni almashtirish, narxini kamaytirish, bepul ta’mirlash yoki pulini qaytarishni talab qilishi mumkin.",
      "Chek va kafolat taloni — huquqingni isbotlovchi muhim hujjatlar. Ularni saqlab qo‘y. Voyaga yetmagan bo‘lsang, katta xaridlarda ota-onang bilan birga harakat qil.",
    ],
    concepts: [
      { term: "Iste’molchi", definition: "Shaxsiy ehtiyoj uchun tovar yoki xizmat oluvchi shaxs." },
      { term: "Kafolat muddati", definition: "Sotuvchi yoki ishlab chiqaruvchi tovar sifati uchun javob beradigan muddat." },
      { term: "Pretenziya (da’vo xati)", definition: "Iste’molchining sotuvchiga yozma ravishda bildirgan talabi." },
      { term: "Muomala layoqati", definition: "Shaxsning o‘z harakatlari bilan huquq va majburiyatlarga ega bo‘lish qobiliyati." },
    ],
    legalBasis: [
      { id: "lb-1", document: "«Iste’molchilarning huquqlarini himoya qilish to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni", summary: "Iste’molchilarning sifatli tovar, ma’lumot olish va zararni qoplash huquqlarini belgilaydi.", status: "verified" },
      { id: "lb-2", document: "Iste’molchi huquqlarini cheklovchi shartlar", summary: "«Qaytarib olinmaydi» kabi bir tomonlama shartlar qonunda belgilangan huquqlarni cheklay olmasligi — rasmiy matndan tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-3", document: "O‘zbekiston Respublikasi Fuqarolik kodeksi — voyaga yetmaganlarning muomala layoqati", summary: "14 yoshdan 18 yoshgacha bo‘lganlarning mustaqil tuzishi mumkin bo‘lgan bitimlar doirasi tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Zarina kitob do‘konidan olgan kitobining 20 sahifasi yo‘qligini uyda ko‘rdi. U chek bilan do‘konga qaytdi va kitobni xuddi shunday, ammo butun nusxaga almashtirib oldi.",
    caseStudy: {
      situation: "Do‘konda «Sotilgan tovar qaytarib olinmaydi» yozuvi osilgan. Sen olgan quloqchin 3 kunda buzildi.",
      question: "Sotuvchi bu yozuvga tayanib rad etishi mumkinmi?",
      analysis:
        "Sifatsiz tovar bo‘yicha iste’molchining huquqlari qonun bilan belgilangan va do‘konning bir tomonlama yozuvi ularni bekor qila olmaydi (aniq qoidani tekshiring). Chek bilan yozma pretenziya topshirish, rad etilsa — iste’molchilar huquqlarini himoya qiluvchi vakolatli organga yoki sudga murojaat qilish mumkin.",
    },
    summary: [
      "Har bir xaridor — iste’molchi va qonun himoyasida.",
      "Sifatsiz tovar: almashtirish, ta’mirlash, chegirma yoki pulni qaytarish.",
      "Chek va kafolat talonini saqla.",
      "Rad etilsa — yozma pretenziya, keyin vakolatli organ.",
    ],
    quiz: [
      { id: "q1", question: "Iste’molchi kim?", options: ["Faqat tadbirkor", "Shaxsiy ehtiyoj uchun tovar oluvchi shaxs", "Faqat 18 yoshdan kattalar", "Faqat do‘kon xodimi"], correctIndex: 1, explanation: "Iste’molchi — shaxsiy ehtiyojlari uchun tovar yoki xizmat oluvchi har qanday shaxs." },
      { id: "q2", question: "Sifatsiz tovar uchun iste’molchi nimani talab qila olmaydi?", options: ["Almashtirishni", "Pulni qaytarishni", "Sotuvchini ishdan haydashni", "Bepul ta’mirlashni"], correctIndex: 2, explanation: "Iste’molchi tovar bo‘yicha talab qo‘yadi; xodimni ishdan bo‘shatish uning vakolatiga kirmaydi." },
      { id: "q3", question: "Xariddan keyin qaysi hujjatni saqlash muhim?", options: ["Reklama varag‘i", "Chek va kafolat taloni", "Do‘kon vizitkasi", "Qadoq qutisi"], correctIndex: 1, explanation: "Chek va kafolat taloni xarid va kafolat shartlarini isbotlaydi." },
      { id: "q4", question: "Sotuvchi talabingni rad etsa, keyingi qadam nima?", options: ["Do‘konni ijtimoiy tarmoqda haqoratlash", "Yozma pretenziya va vakolatli organga murojaat", "Tovarni sindirib tashlash", "Hech narsa qilmaslik"], correctIndex: 1, explanation: "Huquqni qonuniy yo‘l bilan himoya qilish — yozma pretenziya va vakolatli organga murojaat." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-yoshlar-mehnati",
    slug: "voyaga-yetmaganlar-mehnati",
    title: "Voyaga yetmaganlar mehnati",
    shortDescription: "Yozgi ta’tilda ishlash mumkinmi va qanday shartlarda?",
    categoryId: "mehnat",
    grades: [9, 10, 11],
    durationMinutes: 12,
    difficulty: "murakkab",
    intro:
      "Ko‘pchilik o‘smirlar ta’tilda ishlab, o‘z pulini topishni xohlaydi. Bu yaxshi tajriba, lekin qonun voyaga yetmaganlar mehnatini alohida himoya qiladi — sog‘lig‘ing va o‘qishing birinchi o‘rinda.",
    explanation: [
      "Ishga qabul qilish uchun umumiy yosh chegarasi belgilangan. Undan kichik yoshdagi o‘quvchilar ota-ona (qonuniy vakil) roziligi bilan, o‘qishdan bo‘sh vaqtda, sog‘lig‘iga zarar yetkazmaydigan yengil ishlarga jalb qilinishi mumkin. Aniq yosh chegaralari Mehnat kodeksida — tekshirish talab etiladi.",
      "Voyaga yetmaganlar uchun qisqartirilgan ish vaqti, tungi va qo‘shimcha ishlarga jalb qilish cheklovlari kabi imtiyozlar mavjud.",
      "Og‘ir, zararli va xavfli ishlarga voyaga yetmaganlarni jalb qilish taqiqlanadi.",
      "Mehnatga majburlash va bolalar mehnatining eng yomon shakllari qat’iyan taqiqlanadi. O‘zbekiston bu boradagi Xalqaro mehnat tashkiloti konvensiyalarini ratifikatsiya qilgan.",
    ],
    concepts: [
      { term: "Mehnat shartnomasi", definition: "Xodim va ish beruvchi o‘rtasidagi mehnat shartlari haqidagi kelishuv." },
      { term: "Qisqartirilgan ish vaqti", definition: "Voyaga yetmaganlar uchun belgilangan kamroq ish soatlari." },
      { term: "Majburiy mehnat", definition: "Shaxs ixtiyoriga zid ravishda jazo tahdidi ostida bajartiriladigan ish — taqiqlangan." },
      { term: "Yengil ish", definition: "Sog‘liq va o‘qishga zarar yetkazmaydigan ish." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Mehnat kodeksi (2022-yil yangi tahriri)", summary: "Mehnat munosabatlarini, jumladan voyaga yetmaganlar mehnatining xususiyatlarini tartibga soladi.", status: "verified" },
      { id: "lb-2", document: "Mehnat kodeksi — ishga qabul qilish yoshi", summary: "Ishga qabul qilishning umumiy yoshi, ota-ona roziligi bilan ishlash mumkin bo‘lgan yosh chegaralari — aniq raqamlar tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-3", document: "Mehnat kodeksi — voyaga yetmaganlar uchun ish vaqti", summary: "Yoshga qarab kunlik/haftalik ish vaqti chegaralari tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-4", document: "XMTning 138-son (eng kam yosh) va 182-son (bolalar mehnatining eng yomon shakllari) konvensiyalari", summary: "Bolalar mehnatiga oid xalqaro standartlar.", status: "verified" },
    ],
    example:
      "16 yoshli Aziz yozda kafeda ofitsiant yordamchisi bo‘lib ishlamoqchi. Ish beruvchi u bilan mehnat shartnomasi tuzdi, ish vaqtini qisqartirdi va tungi smenaga qo‘ymadi. Bu qonuniy yondashuv.",
    caseStudy: {
      situation: "Ish beruvchi 15 yoshli o‘smirni qurilishda og‘ir yuk tashishga, kuniga 10 soat ishlashga taklif qildi va «shartnoma shart emas» dedi.",
      question: "Bu taklifda qanday muammolar bor?",
      analysis:
        "Bir nechta buzilish bor: og‘ir jismoniy ish voyaga yetmaganlar uchun taqiqlangan, ish vaqti haddan tashqari uzun, mehnat shartnomasi yo‘q, ota-ona roziligi so‘ralmagan. Bunday taklifni rad etish va ota-onaga aytish kerak.",
    },
    summary: [
      "Voyaga yetmaganlar mehnati qonun bilan alohida himoyalangan.",
      "Ota-ona roziligi va o‘qishga zarar yetmasligi — asosiy shart.",
      "Og‘ir, zararli va tungi ishlar taqiqlangan.",
      "Mehnat shartnomasisiz ishlama.",
    ],
    quiz: [
      { id: "q1", question: "Voyaga yetmaganlar uchun qaysi ish taqiqlangan?", options: ["Kutubxonada kitob tartiblash", "Og‘ir va zararli ishlar", "Yozgi lagerda yordamchi", "Gul sug‘orish"], correctIndex: 1, explanation: "Og‘ir, zararli va xavfli ishlarga voyaga yetmaganlarni jalb qilish taqiqlanadi." },
      { id: "q2", question: "Kichik yoshdagi o‘quvchining ishlashi uchun kimning roziligi kerak?", options: ["Sinfdoshlarining", "Ota-ona yoki qonuniy vakilning", "Hech kimning", "Faqat ish beruvchining"], correctIndex: 1, explanation: "Ota-ona (qonuniy vakil) roziligi — voyaga yetmaganni ishga jalb qilishning asosiy sharti." },
      { id: "q3", question: "Voyaga yetmaganlar uchun ish vaqti qanday?", options: ["Kattalarnikidan uzunroq", "Kattalar bilan bir xil", "Qisqartirilgan", "Cheklanmagan"], correctIndex: 2, explanation: "Voyaga yetmaganlar uchun qisqartirilgan ish vaqti belgilanadi." },
      { id: "q4", question: "Majburiy mehnat nima?", options: ["Ixtiyoriy volontyorlik", "Jazo tahdidi ostida ixtiyorga zid bajartiriladigan ish", "Uy vazifasi", "Maktab navbatchiligi"], correctIndex: 1, explanation: "Majburiy mehnat — shaxs ixtiyoriga zid, jazo tahdidi ostidagi ish; u taqiqlangan." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-javobgarlik",
    slug: "yuridik-javobgarlik",
    title: "Huquqbuzarlik va yuridik javobgarlik",
    shortDescription: "Qaysi yoshdan javob berasan va javobgarlikning qanday turlari bor?",
    categoryId: "javobgarlik",
    grades: [9, 10, 11],
    durationMinutes: 14,
    difficulty: "murakkab",
    popular: true,
    intro:
      "«Men hali kichikman, menga hech narsa qilishmaydi» — bu xato fikr. Har bir harakatning oqibati bor. Qonun javobgarlik turlarini va u qaysi yoshdan boshlanishini aniq belgilaydi.",
    explanation: [
      "Huquqbuzarlik — qonun bilan taqiqlangan, aybli harakat yoki harakatsizlik. U og‘irligiga qarab nojo‘ya xatti-harakat (ma’muriy, intizomiy, fuqarolik) va jinoyatga bo‘linadi.",
      "Yuridik javobgarlik turlari: intizomiy (masalan, maktabda), ma’muriy (jarima kabi choralar), fuqarolik-huquqiy (zararni qoplash) va jinoiy javobgarlik.",
      "Ma’muriy va jinoiy javobgarlik umumiy qoidaga ko‘ra 16 yoshdan boshlanadi. Ayrim og‘ir jinoyatlar uchun javobgarlik undan pastroq yoshdan boshlanadi. Aniq yosh va jinoyatlar ro‘yxati — tekshirish talab etiladi.",
      "Voyaga yetmagan shaxs yetkazgan zarar uchun ko‘pincha ota-onasi javob beradi. Bu oila uchun ham real oqibat demakdir.",
    ],
    concepts: [
      { term: "Huquqbuzarlik", definition: "Qonunga xilof, aybli, jamiyat uchun zararli xatti-harakat." },
      { term: "Jinoyat", definition: "Jinoyat kodeksida taqiqlangan, ijtimoiy xavfli aybli qilmish." },
      { term: "Ma’muriy javobgarlik", definition: "Ma’muriy huquqbuzarlik uchun qo‘llanadigan choralar (jarima, ogohlantirish va h.k.)." },
      { term: "Aybsizlik prezumpsiyasi", definition: "Shaxsning aybi qonuniy tartibda isbotlanmaguncha u aybsiz hisoblanadi." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Jinoyat kodeksi", summary: "Jinoyatlar va ular uchun jazolarni belgilaydi.", status: "verified" },
      { id: "lb-2", document: "Jinoyat kodeksi — javobgarlikka tortish yoshi", article: "17-modda (tekshirilsin)", summary: "Umumiy qoida — 16 yosh; ayrim jinoyatlar uchun 14 yosh va undan past yosh. Modda va ro‘yxat rasmiy matndan tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-3", document: "O‘zbekiston Respublikasining Ma’muriy javobgarlik to‘g‘risidagi kodeksi", summary: "Ma’muriy huquqbuzarliklar va javobgarlik yoshi (16 yosh) — modda raqami tekshirilishi kerak.", status: "needs_verification" },
      { id: "lb-4", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Aybsizlik prezumpsiyasi va himoyalanish huquqi kafolatlanadi.", status: "verified" },
    ],
    example:
      "15 yoshli Sherzod maktab derazasini qasddan sindirdi. Uni jinoiy javobgarlikka tortishmadi, lekin maktab intizomiy chora ko‘rdi va derazani tiklash xarajatini ota-onasi qopladi.",
    caseStudy: {
      situation: "17 yoshli o‘quvchi do‘stlari bilan bekat devoriga graffiti chizdi va qo‘lga tushdi.",
      question: "Bu qanday huquqbuzarlik va qanday oqibatlarga olib kelishi mumkin?",
      analysis:
        "Bu o‘zganing (davlat yoki jamoat) mulkini buzish bilan bog‘liq. Zarar miqdori va holatlarga qarab ma’muriy yoki undan og‘irroq javobgarlik masalasi ko‘rilishi, zararni qoplash talab qilinishi mumkin. Aniq malaka huquqni muhofaza qiluvchi organlar tomonidan beriladi.",
    },
    summary: [
      "Javobgarlik: intizomiy, ma’muriy, fuqarolik-huquqiy, jinoiy.",
      "Umumiy qoida — ma’muriy va jinoiy javobgarlik 16 yoshdan.",
      "Ayrim og‘ir jinoyatlar uchun javobgarlik ertaroq boshlanadi.",
      "Voyaga yetmagan yetkazgan zarar uchun ko‘pincha ota-ona javob beradi.",
    ],
    quiz: [
      { id: "q1", question: "Ma’muriy javobgarlik umumiy qoidaga ko‘ra necha yoshdan boshlanadi?", options: ["12", "14", "16", "18"], correctIndex: 2, explanation: "Umumiy qoidaga ko‘ra ma’muriy javobgarlik 16 yoshdan boshlanadi." },
      { id: "q2", question: "Zararni qoplash qaysi javobgarlik turiga kiradi?", options: ["Fuqarolik-huquqiy", "Jinoiy", "Intizomiy", "Siyosiy"], correctIndex: 0, explanation: "Yetkazilgan zararni qoplash — fuqarolik-huquqiy javobgarlik." },
      { id: "q3", question: "Aybsizlik prezumpsiyasi nimani anglatadi?", options: ["Hamma doim aybdor", "Aybi isbotlanmaguncha shaxs aybsiz", "Voyaga yetmaganlar hech qachon aybdor emas", "Faqat sud aybdor"], correctIndex: 1, explanation: "Shaxsning aybi qonuniy tartibda isbotlanmaguncha u aybsiz hisoblanadi." },
      { id: "q4", question: "15 yoshli o‘quvchi maktab mulkiga zarar yetkazsa, zararni kim qoplashi mumkin?", options: ["Sinf rahbari", "Ota-onasi", "Sinfdoshlari", "Hech kim"], correctIndex: 1, explanation: "Voyaga yetmagan yetkazgan zarar uchun ko‘pincha uning ota-onasi javob beradi." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-konstitutsiya",
    slug: "konstitutsiya",
    title: "Konstitutsiya — asosiy qonun",
    shortDescription: "Davlat qanday tuzilgan va fuqaroning asosiy huquqlari nimalar?",
    categoryId: "davlat",
    grades: [8, 9, 10, 11],
    durationMinutes: 12,
    difficulty: "o'rta",
    intro:
      "Konstitutsiya — mamlakatning asosiy qonuni. Boshqa barcha qonunlar unga mos bo‘lishi shart. U davlat tuzilishini, inson huquq va erkinliklarini belgilaydi.",
    explanation: [
      "O‘zbekiston Respublikasi Konstitutsiyasi 1992-yil 8-dekabrda qabul qilingan. Shu sababli 8-dekabr — Konstitutsiya kuni.",
      "2023-yil 30-aprelda o‘tkazilgan referendumda Konstitutsiyaning yangi tahriri qabul qilindi va u 2023-yil 1-maydan kuchga kirdi.",
      "Davlat hokimiyati uch tarmoqqa bo‘lingan: qonun chiqaruvchi (Oliy Majlis — Qonunchilik palatasi va Senat), ijro etuvchi (Prezident va Hukumat) va sud hokimiyati.",
      "Konstitutsiyada inson huquqlari oliy qadriyat deb e’tirof etilgan: yashash huquqi, shaxsiy erkinlik, so‘z erkinligi, ta’lim, mehnat va boshqa huquqlar.",
    ],
    concepts: [
      { term: "Konstitutsiya", definition: "Davlatning oliy yuridik kuchga ega asosiy qonuni." },
      { term: "Referendum", definition: "Muhim masalalar bo‘yicha umumxalq ovoz berishi." },
      { term: "Hokimiyatlar bo‘linishi", definition: "Hokimiyatning qonun chiqaruvchi, ijro etuvchi va sud tarmoqlariga ajratilishi." },
      { term: "Oliy Majlis", definition: "O‘zbekistonning ikki palatali parlamenti: Qonunchilik palatasi va Senat." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil 30-aprel referendumida qabul qilingan tahriri)", summary: "Davlat tuzilishi, inson huquq va erkinliklari, davlat organlari tizimi.", status: "verified" },
      { id: "lb-2", document: "Konstitutsiya — moddalar tuzilmasi", summary: "Yangi tahrirdagi aniq modda raqamlari eski tahrirdan farq qiladi; iqtibos keltirishda rasmiy matndan tekshiring.", status: "needs_verification" },
    ],
    example:
      "Agar biror qonun Konstitutsiyada kafolatlangan huquqni cheklasa, bu masala Konstitutsiyaviy sud tomonidan ko‘rib chiqilishi mumkin. Shu tariqa Konstitutsiya boshqa qonunlardan ustun turadi.",
    caseStudy: {
      situation: "Sinfda munozara: «Konstitutsiya faqat kattalar uchun, bizga aloqasi yo‘q».",
      question: "Bu fikr to‘g‘rimi?",
      analysis:
        "Yo‘q. Konstitutsiyada kafolatlangan huquqlar (ta’lim, sog‘liqni saqlash, qadr-qimmat daxlsizligi) bolalarga ham tegishli. Bundan tashqari, Konstitutsiya bolalar va oilani alohida davlat himoyasiga oladi.",
    },
    summary: [
      "Konstitutsiya — eng yuqori yuridik kuchga ega qonun.",
      "Yangi tahrir 2023-yil 30-aprel referendumida qabul qilingan.",
      "Hokimiyat uch tarmoqqa bo‘lingan.",
      "Inson huquqlari — oliy qadriyat.",
    ],
    quiz: [
      { id: "q1", question: "O‘zbekistonda Konstitutsiya kuni qachon nishonlanadi?", options: ["1-sentyabr", "8-dekabr", "9-may", "21-mart"], correctIndex: 1, explanation: "Konstitutsiya 1992-yil 8-dekabrda qabul qilingan." },
      { id: "q2", question: "Konstitutsiyaning yangi tahriri qanday qabul qilindi?", options: ["Prezident farmoni bilan", "Referendum orqali", "Sud qarori bilan", "Hokimlik qarori bilan"], correctIndex: 1, explanation: "Yangi tahrir 2023-yil 30-apreldagi referendumda qabul qilingan." },
      { id: "q3", question: "Oliy Majlis qaysi palatalardan iborat?", options: ["Senat va Hukumat", "Qonunchilik palatasi va Senat", "Vazirlar Mahkamasi va Senat", "Faqat Qonunchilik palatasi"], correctIndex: 1, explanation: "Oliy Majlis ikki palatali: Qonunchilik palatasi va Senat." },
      { id: "q4", question: "Sud hokimiyati qaysi hokimiyat tarmog‘i?", options: ["Qonun chiqaruvchi", "Ijro etuvchi", "Mustaqil uchinchi tarmoq", "Mahalliy"], correctIndex: 2, explanation: "Hokimiyat uch tarmoqqa bo‘linadi; sud hokimiyati — ulardan biri va mustaqil." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-yol-harakati",
    slug: "yol-harakati",
    title: "Yo‘l harakati qoidalari va piyoda huquqlari",
    shortDescription: "Maktabga xavfsiz borish uchun nimalarni bilish kerak?",
    categoryId: "xavfsizlik",
    grades: [7, 8],
    durationMinutes: 8,
    difficulty: "oson",
    intro:
      "Har kuni maktabga yo‘l bosib o‘tasan. Yo‘l harakati qoidalari — bu cheklov emas, balki hayotingni asrovchi kelishuv.",
    explanation: [
      "Piyoda yo‘lni faqat belgilangan joylardan — piyodalar o‘tish joyi, yer osti yoki yer usti o‘tish joyidan kesib o‘tishi kerak.",
      "Svetoforning yashil chirog‘ida ham avval chap va o‘ngga qarab, transport to‘xtaganiga ishonch hosil qil.",
      "Yo‘lni kesib o‘tayotganda telefonga qarash va quloqchin taqish xavflidir.",
      "Velosiped yoki elektr samokat bilan yo‘lga chiqish uchun yosh chegaralari va qoidalar amaldagi Yo‘l harakati qoidalarida belgilangan — tekshirish talab etiladi.",
    ],
    concepts: [
      { term: "Piyoda", definition: "Yo‘lda transport vositasidan tashqarida harakatlanayotgan shaxs." },
      { term: "Piyodalar o‘tish joyi", definition: "Piyodalarning yo‘lni kesib o‘tishi uchun belgilangan joy («zebra»)." },
      { term: "Yo‘l harakati qatnashchisi", definition: "Haydovchi, piyoda, yo‘lovchi — yo‘l harakatida ishtirok etuvchi har bir shaxs." },
    ],
    legalBasis: [
      { id: "lb-1", document: "«Yo‘l harakati xavfsizligi to‘g‘risida»gi O‘zbekiston Respublikasi Qonuni", summary: "Yo‘l harakati xavfsizligini ta’minlashning huquqiy asoslarini belgilaydi.", status: "verified" },
      { id: "lb-2", document: "Yo‘l harakati qoidalari (Vazirlar Mahkamasi qarori bilan tasdiqlangan)", summary: "Piyodalar, velosipedchilar va haydovchilar uchun aniq qoidalar. Velosiped/samokat yosh chegaralari tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Kamola svetoforning yashil chirog‘i yonishi bilan yugurmadi — chapga va o‘ngga qaradi. Shu payt qizil chiroqqa e’tibor bermagan mashina tez o‘tib ketdi. Ehtiyotkorlik uning hayotini asradi.",
    caseStudy: {
      situation: "Do‘stlaring vaqtni tejash uchun o‘tish joyi bo‘lmagan joydan, to‘siqdan oshib yo‘lni kesib o‘tishni taklif qilmoqda.",
      question: "Qanday yo‘l tutasan?",
      analysis:
        "Belgilanmagan joydan yo‘lni kesib o‘tish qoidabuzarlik va hayot uchun xavfli. Bir-ikki daqiqa tejash uchun xavf ostida qolish arzimaydi. Eng yaqin o‘tish joyidan foydalanishni taklif qil.",
    },
    summary: [
      "Yo‘lni faqat belgilangan joydan kes.",
      "Yashil chiroqda ham chap-o‘ngga qara.",
      "Yo‘lda telefon va quloqchindan voz kech.",
      "Favqulodda holatda: 101 — yong‘in, 102 — militsiya, 103 — tez yordam.",
    ],
    quiz: [
      { id: "q1", question: "Yo‘lni qayerdan kesib o‘tish kerak?", options: ["Eng qisqa joydan", "Piyodalar o‘tish joyidan", "Mashinalar orasidan", "To‘siqdan oshib"], correctIndex: 1, explanation: "Piyoda yo‘lni faqat belgilangan o‘tish joylaridan kesib o‘tadi." },
      { id: "q2", question: "Svetoforning yashil chirog‘i yonganda nima qilish kerak?", options: ["Darhol yugurish", "Chap va o‘ngga qarab, xavfsizligiga ishonch hosil qilish", "Telefonga qarab yurish", "Kutish va hech qachon o‘tmaslik"], correctIndex: 1, explanation: "Yashil chiroqda ham transport to‘xtaganiga ishonch hosil qilish kerak." },
      { id: "q3", question: "Tez tibbiy yordam raqami qaysi?", options: ["101", "102", "103", "104"], correctIndex: 2, explanation: "103 — tez tibbiy yordam xizmati." },
      { id: "q4", question: "Yo‘l harakati qatnashchisi kim?", options: ["Faqat haydovchi", "Faqat piyoda", "Haydovchi, piyoda va yo‘lovchi", "Faqat yo‘l inspektori"], correctIndex: 2, explanation: "Yo‘l harakatida ishtirok etuvchi har bir shaxs — qatnashchi." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-saylov",
    slug: "saylov-huquqi",
    title: "Saylov huquqi va fuqarolik faolligi",
    shortDescription: "Kim saylay oladi va o‘smir jamiyat hayotida qanday ishtirok eta oladi?",
    categoryId: "davlat",
    grades: [10, 11],
    durationMinutes: 10,
    difficulty: "o'rta",
    intro:
      "Saylov — fuqarolarning davlat boshqaruvida ishtirok etishining asosiy shakli. 18 yoshga to‘lishingga oz qoldi — bu huquqni ongli ishlatishga hozirdan tayyorlan.",
    explanation: [
      "O‘zbekiston fuqarolari 18 yoshga to‘lgach saylash huquqiga ega bo‘ladi.",
      "Saylov umumiy, teng va to‘g‘ridan-to‘g‘ri, yashirin ovoz berish yo‘li bilan o‘tkaziladi. Hech kim boshqaning o‘rniga ovoz bera olmaydi.",
      "Saylov yoshiga yetmagan o‘smirlar ham jamiyat hayotida ishtirok eta oladi: maktab o‘quvchilar kengashi, volontyorlik, mahalla tashabbuslari, murojaatlar orqali.",
      "Ongli saylovchi bo‘lish uchun nomzodlar dasturini o‘rganish, ishonchli manbalardan ma’lumot olish va soxta xabarlarni farqlay olish muhim.",
    ],
    concepts: [
      { term: "Saylov huquqi", definition: "Fuqaroning saylash va saylanish huquqi." },
      { term: "Yashirin ovoz berish", definition: "Saylovchining kimga ovoz berganini boshqalar bilmasligi kafolati." },
      { term: "Fuqarolik faolligi", definition: "Jamiyat muammolarini hal qilishda shaxsning faol ishtiroki." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "18 yoshga to‘lgan fuqarolar saylash huquqiga ega; saylov umumiy, teng, to‘g‘ridan-to‘g‘ri, yashirin ovoz berish asosida.", status: "verified" },
      { id: "lb-2", document: "O‘zbekiston Respublikasining Saylov kodeksi (2019-yil)", summary: "Saylovlarni tayyorlash va o‘tkazish tartibini belgilaydi.", status: "verified" },
      { id: "lb-3", document: "Saylanish huquqi uchun yosh talablari", summary: "Turli lavozimlar uchun saylanish yoshi chegaralari tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "11-sinf o‘quvchisi Ozoda maktab o‘quvchilar kengashiga nomzod bo‘ldi: dasturini e’lon qildi, debatda qatnashdi va saylovda g‘olib chiqdi. Bu — demokratik jarayonni amalda o‘rganish.",
    caseStudy: {
      situation: "Saylov kuni qo‘shni sizning oilangiz uchun «hamma pasportlarni bering, men hammaning o‘rniga ovoz berib qo‘yaman» deydi.",
      question: "Bu to‘g‘rimi?",
      analysis:
        "Yo‘q. Har bir saylovchi shaxsan ovoz beradi; boshqaning o‘rniga ovoz berish saylov tamoyillarini buzadi. Har kim o‘zi saylov uchastkasiga borib, yashirin ovoz berishi kerak.",
    },
    summary: [
      "Saylash huquqi — 18 yoshdan.",
      "Saylov: umumiy, teng, to‘g‘ridan-to‘g‘ri, yashirin.",
      "Har kim shaxsan ovoz beradi.",
      "O‘smirlar ham fuqarolik faolligini namoyon eta oladi.",
    ],
    quiz: [
      { id: "q1", question: "O‘zbekistonda saylash huquqi necha yoshdan boshlanadi?", options: ["16", "17", "18", "21"], correctIndex: 2, explanation: "18 yoshga to‘lgan fuqarolar saylash huquqiga ega." },
      { id: "q2", question: "Yashirin ovoz berish nimani anglatadi?", options: ["Ovoz berish kechasi bo‘ladi", "Kimga ovoz berganingni boshqalar bilmaydi", "Faqat internet orqali", "Ovozlar sanalmaydi"], correctIndex: 1, explanation: "Yashirin ovoz berish — saylovchi tanlovining sir saqlanishi kafolati." },
      { id: "q3", question: "Boshqa oila a’zosi o‘rniga ovoz berish mumkinmi?", options: ["Ha, pasporti bo‘lsa", "Ha, ruxsat bersa", "Yo‘q, har kim shaxsan ovoz beradi", "Faqat ota-ona uchun"], correctIndex: 2, explanation: "Har bir saylovchi shaxsan ovoz beradi." },
      { id: "q4", question: "Saylov yoshiga yetmagan o‘smir qanday fuqarolik faolligini ko‘rsatishi mumkin?", options: ["Saylovda ovoz berish", "O‘quvchilar kengashi va volontyorlik", "Deputat bo‘lish", "Hech qanday"], correctIndex: 1, explanation: "O‘quvchilar kengashi, volontyorlik, mahalla tashabbuslari — fuqarolik faolligi shakllari." },
    ],
    updatedAt: UPDATED,
  },
  {
    id: "t-oila",
    slug: "oila-huquqi",
    title: "Oila: ota-ona va farzand huquqlari",
    shortDescription: "Oilada kimning qanday huquq va majburiyatlari bor?",
    categoryId: "oila",
    grades: [10, 11],
    durationMinutes: 10,
    difficulty: "o'rta",
    intro:
      "Oila — jamiyatning asosiy bo‘g‘ini. Qonun oilani, onalik va bolalikni davlat himoyasiga oladi hamda ota-ona va farzandlarning o‘zaro huquq va majburiyatlarini belgilaydi.",
    explanation: [
      "Ota-onalar farzandlarini tarbiyalash, ularning sog‘lig‘i, ta’limi va rivojlanishi haqida g‘amxo‘rlik qilishda teng huquq va majburiyatlarga ega.",
      "Voyaga yetgan, mehnatga layoqatli farzandlar ota-onalari haqida g‘amxo‘rlik qilishlari shart.",
      "Nikoh ixtiyoriylik asosida tuziladi. Majburan nikohga kiritish taqiqlanadi. Nikoh yoshi Oila kodeksida belgilangan — tekshirish talab etiladi.",
      "Oilada zo‘ravonlik qonunga xilof. Bunday holatlarda ishonch telefonlari, ichki ishlar organlari va boshqa vakolatli tuzilmalar yordam beradi.",
    ],
    concepts: [
      { term: "Oila", definition: "Nikoh, qarindoshlik yoki farzandlikka olish asosidagi shaxslar birligi." },
      { term: "Nikoh", definition: "Erkak va ayolning ixtiyoriy, teng huquqli ittifoqi; davlat tomonidan ro‘yxatga olinadi." },
      { term: "Aliment", definition: "Qonunga ko‘ra oila a’zosiga to‘lanadigan ta’minot mablag‘i." },
      { term: "Vasiylik", definition: "Ota-ona qaramog‘isiz qolgan bolaning huquq va manfaatlarini himoya qilish shakli." },
    ],
    legalBasis: [
      { id: "lb-1", document: "O‘zbekiston Respublikasi Oila kodeksi", summary: "Nikoh, oila a’zolarining huquq va majburiyatlari, aliment, vasiylikni tartibga soladi.", status: "verified" },
      { id: "lb-2", document: "O‘zbekiston Respublikasi Konstitutsiyasi (2023-yil tahriri)", summary: "Oila jamiyat va davlat muhofazasida; ota-onalar farzandlarini, voyaga yetgan farzandlar ota-onalarini ta’minlashga majbur.", status: "verified" },
      { id: "lb-3", document: "Oila kodeksi — nikoh yoshi", summary: "Erkak va ayol uchun nikoh yoshi (18 yosh) va undan istisnolar — modda raqami bilan tekshirilishi kerak.", status: "needs_verification" },
    ],
    example:
      "Ota-onasi ajrashgan Dilnoza onasi bilan yashaydi. Otasi uning ta’minoti uchun aliment to‘laydi va u bilan muloqot qilish huquqiga ega. Dilnozaning ikkala ota-onasi bilan aloqada bo‘lish huquqi saqlanadi.",
    caseStudy: {
      situation: "Sinfdoshing uyda doimiy qo‘pollik va zo‘ravonlikka uchrayotganini aytdi va hech kimga aytmaslikni so‘radi.",
      question: "Qanday yo‘l tutish kerak?",
      analysis:
        "Do‘stingni tinglab, qo‘llab-quvvatlang. Bunday sirni saqlash xavfli bo‘lishi mumkin: uni maktab psixologi yoki ishonchli o‘qituvchi bilan bo‘lishishga ko‘ndiring. Hayot uchun xavf bo‘lsa — darhol 102 ga qo‘ng‘iroq qilish kerak.",
    },
    summary: [
      "Oila — davlat himoyasida.",
      "Ota-onalar farzand tarbiyasida teng huquqli.",
      "Voyaga yetgan farzandlar ota-onaga g‘amxo‘rlik qilishi shart.",
      "Nikoh — ixtiyoriy; oiladagi zo‘ravonlik taqiqlangan.",
    ],
    quiz: [
      { id: "q1", question: "Farzand tarbiyasida ota va onaning huquqlari qanday?", options: ["Faqat otaniki ustun", "Faqat onaniki ustun", "Teng", "Bobo-buvilarniki ustun"], correctIndex: 2, explanation: "Ota-onalar farzand tarbiyasida teng huquq va majburiyatlarga ega." },
      { id: "q2", question: "Aliment nima?", options: ["Maktab to‘lovi", "Qonunga ko‘ra oila a’zosiga to‘lanadigan ta’minot", "Soliq turi", "Bank krediti"], correctIndex: 1, explanation: "Aliment — oila a’zosini ta’minlash uchun qonun asosida to‘lanadigan mablag‘." },
      { id: "q3", question: "Nikoh qanday asosda tuziladi?", options: ["Ota-ona qarori bilan", "Ixtiyoriylik asosida", "Mahalla qarori bilan", "Majburiy tarzda"], correctIndex: 1, explanation: "Nikoh faqat ixtiyoriylik asosida tuziladi; majburlash taqiqlanadi." },
      { id: "q4", question: "Do‘stingiz uyda zo‘ravonlikka uchrayotganini aytdi. To‘g‘ri yo‘l?", options: ["Hech kimga aytmaslik", "Ishonchli katta yoki psixologga murojaat qilishga ko‘ndirish", "Ijtimoiy tarmoqqa yozish", "E’tibor bermaslik"], correctIndex: 1, explanation: "Zo‘ravonlik holatida kattalar va mutaxassislar yordami zarur." },
    ],
    updatedAt: UPDATED,
  },
];
