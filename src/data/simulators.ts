import type { Scenario } from "@/types";

/**
 * Simulyator ssenariylari — qadamlar grafi.
 * Yangi ssenariy qo'shish uchun shu massivga yangi obyekt qo'shish kifoya:
 * har bir qadam (step) tanlovlarga ega, har bir tanlov natijasi (outcome)
 * ball beradi va keyingi qadamga (nextStepId) o'tkazadi yoki ssenariyni
 * yakunlaydi (endingId). Player komponenti hech qanday o'zgarishsiz ishlaydi.
 */

export const scenarios: Scenario[] = [
  {
    id: "topilgan-hamyon",
    title: "Topilgan hamyon",
    tagline: "Halollik sinovi: sen qanday qaror qabul qilasan?",
    description:
      "Tanaffusda maktab koridorida hamyon topib olding. Ichida pul va egasini aniqlashga yordam beradigan kartochka bor. Har bir qaroring natijani o‘zgartiradi.",
    grades: [7, 8, 9],
    categoryId: "mulk",
    durationMinutes: 5,
    emoji: "👛",
    startStepId: "start",
    relatedTopicSlug: "topilgan-narsa",
    rewards: [
      { endingIds: ["halol-tartibli", "halol-ehtiyotkor"], badgeId: "halol-qahramon" },
    ],
    steps: {
      start: {
        id: "start",
        title: "Koridordagi topilma",
        narrative:
          "Katta tanaffus. Sen kutubxonaga shoshilib ketayotib, deraza tagida jigarrang hamyon ko‘rib qolding. Ichida 150 000 so‘m pul va «Aziza Karimova, 9-«B» sinf» deb yozilgan kutubxona kartochkasi bor. Atrofda hech kim yo‘q. Nima qilasan?",
        choices: [
          {
            id: "admin",
            label: "Maktab ma’muriyatiga topshiraman",
            hint: "Navbatchi o‘qituvchi yoki direktor o‘rinbosariga",
            outcome: {
              title: "To‘g‘ri va ishonchli yo‘l",
              description:
                "Sen hamyonni direktor o‘rinbosari xonasiga olib bording. U hamyonni qabul qilib, qayerda va qachon topganingni so‘radi.",
              legalNote:
                "Topilgan narsa egasining mulki bo‘lib qoladi. Topilgan joy ma’muriyatiga topshirish — qonunda nazarda tutilgan to‘g‘ri yo‘llardan biri.",
              ethicsNote:
                "Sen o‘zgalar mulkini hurmat qilding va mas’uliyatni o‘z zimmangga olding. Bu — ishonchli inson belgisi.",
              points: 30,
              tone: "good",
              nextStepId: "admin-detail",
            },
          },
          {
            id: "trusted-adult",
            label: "Ishonchli katta yordamida egasini qidiraman",
            hint: "Sinf rahbari bilan birga 9-«B» sinfiga boraman",
            outcome: {
              title: "Faol va mas’uliyatli qaror",
              description:
                "Sen sinf rahbaring Gulnora opaga hamyonni ko‘rsatding. U sen bilan birga 9-«B» sinfiga borishni taklif qildi.",
              legalNote:
                "Topgan shaxs egasini topish uchun choralar ko‘rishi kerak. Katta yoshli guvoh ishtiroki keyinchalik har qanday tushunmovchilikning oldini oladi.",
              ethicsNote:
                "Egasini o‘zing qidirishga harakat qilish — g‘amxo‘rlik belgisi. Kattani jalb qilish esa senga ham himoya beradi.",
              points: 25,
              tone: "good",
              nextStepId: "adult-detail",
            },
          },
          {
            id: "keep",
            label: "O‘zimda olib qolaman",
            hint: "Hech kim ko‘rmadi-ku...",
            outcome: {
              title: "Xavfli qaror",
              description:
                "Sen hamyonni sumkangga solding. Yuraging tez ura boshladi — darsda ham fikring shu yerda edi.",
              legalNote:
                "«Topgan — o‘ziniki» degan qoida yo‘q. Topilgan narsani yashirib, o‘zlashtirib olish huquqbuzarlik hisoblanib, javobgarlikka sabab bo‘lishi mumkin.",
              ethicsNote:
                "Birovning yo‘qotishi sening foydang bo‘lmasligi kerak. Hamyon egasi hozir xavotirda.",
              points: -20,
              tone: "bad",
              nextStepId: "keep-detail",
              legalStatus: "needs_verification",
            },
          },
        ],
      },
      "admin-detail": {
        id: "admin-detail",
        title: "Ma’muriyat xonasida",
        narrative:
          "Direktor o‘rinbosari: «Rahmat! Hamyonni qayerda va qachon topganingni yozib qo‘yamiz, egasini chaqirtiramiz». Qo‘ng‘iroq chalinishiga 2 daqiqa qoldi.",
        choices: [
          {
            id: "document",
            label: "Joy va vaqtni aniq aytib, ro‘yxatga olishda qatnashaman",
            outcome: {
              title: "Namunali harakat",
              description:
                "Hamyon ichidagi narsalar sen bilan birga sanab, yozib qo‘yildi. Ertasi kuni Aziza seni topib, minnatdorchilik bildirdi.",
              legalNote:
                "Topilma qabul qilinganini qayd etish — har ikki tomon uchun himoya. Keyinchalik «pul kam chiqdi» kabi da’volarning oldi olinadi.",
              ethicsNote: "Halollik va tartiblilik birgalikda ishonch yaratadi.",
              points: 20,
              tone: "good",
              endingId: "halol-tartibli",
            },
          },
          {
            id: "drop-and-run",
            label: "Darsga kechikmaslik uchun stolga qo‘yib, chiqib ketaman",
            outcome: {
              title: "Yaxshi niyat, lekin to‘liq emas",
              description:
                "Hamyon egasiga qaytdi, ammo Aziza pulning bir qismi kamligini aytdi. Sen hech narsa olmagansan, lekin buni isbotlash qiyin bo‘ldi.",
              legalNote:
                "Topilma topshirilganda uning holati qayd etilmasa, keyinchalik nizo kelib chiqishi mumkin.",
              ethicsNote: "Yaxshi ishni oxirigacha yetkazish ham mas’uliyatning bir qismi.",
              points: 5,
              tone: "neutral",
              endingId: "halol-shoshqaloq",
            },
          },
        ],
      },
      "adult-detail": {
        id: "adult-detail",
        title: "9-«B» sinfida",
        narrative:
          "Sinfga kirganingizda Aziza dars qoldirgani ma’lum bo‘ldi. Shu payt bir o‘quvchi qo‘l ko‘tarib: «Bu mening hamyonim, menga bering, Azizaga o‘zim beraman», — dedi.",
        choices: [
          {
            id: "verify",
            label: "Hamyonni faqat egasiga — Azizaga — berishni taklif qilaman",
            hint: "Gulnora opa bilan maslahatlashib",
            outcome: {
              title: "Ehtiyotkor va adolatli",
              description:
                "Gulnora opa hamyonni Azizaning sinf rahbariga topshirdi. Ertasi kuni Aziza hamyonni oldi va sening ehtiyotkorligingdan xursand bo‘ldi.",
              legalNote:
                "Topilma uning haqiqiy egasiga yoki vakolatli shaxsga qaytarilishi kerak. Begona shaxsga berib yuborish egasining huquqini buzishi mumkin.",
              ethicsNote: "Yaxshilik qilganda ham ehtiyot bo‘lish — dono qaror.",
              points: 25,
              tone: "good",
              endingId: "halol-ehtiyotkor",
            },
          },
          {
            id: "give-away",
            label: "Ishonib, hamyonni unga berib yuboraman",
            outcome: {
              title: "Hamyon noto‘g‘ri odamga tushdi",
              description:
                "Ertasi kuni Aziza hamyonini so‘rab keldi. Ma’lum bo‘ldiki, hamyonni olgan o‘quvchi uni Azizaga bermagan.",
              legalNote:
                "Egasi ekanligi tasdiqlanmagan shaxsga topilmani berish uni yo‘qotishga olib kelishi mumkin. Topilma egasi yoki vakolatli shaxsga qaytariladi.",
              ethicsNote: "Ishonch yaxshi, lekin tekshirish — mas’uliyat.",
              points: 0,
              tone: "neutral",
              endingId: "aldangan",
            },
          },
        ],
      },
      "keep-detail": {
        id: "keep-detail",
        title: "Ertasi kuni",
        narrative:
          "Ertalab maktab radiosida e’lon: «9-«B» sinf o‘quvchisi Aziza hamyonini yo‘qotdi. Ichida onasining dorisi uchun pul bor edi. Topgan bo‘lsangiz, ma’muriyatga topshiring». Sinfdoshing kecha senda shunday hamyon ko‘rganini aytdi...",
        choices: [
          {
            id: "confess",
            label: "Xatoimni tan olib, hamyonni qaytaraman",
            outcome: {
              title: "Kech bo‘lsa ham to‘g‘ri qaror",
              description:
                "Sen hamyonni to‘liq holda ma’muriyatga topshirding va kechirim so‘rading. Aziza xursand bo‘ldi, ma’muriyat esa ochiqligingni qadrladi.",
              legalNote:
                "Topilmani ixtiyoriy va to‘liq qaytarish vaziyatni ancha yengillashtiradi. Bu o‘zlashtirish emas, qaytarish sifatida baholanishi mumkin.",
              ethicsNote: "Xatoni tan olish uchun jasorat kerak. Sen to‘g‘ri yo‘lga qaytding.",
              points: 15,
              tone: "neutral",
              endingId: "tan-olish",
            },
          },
          {
            id: "deny",
            label: "Jim turaman va inkor qilaman",
            outcome: {
              title: "Jiddiy oqibatlar",
              description:
                "Videokuzatuv yozuvi hamyonni sen olganingni ko‘rsatdi. Ota-onang maktabga chaqirildi, ishonch yo‘qoldi.",
              legalNote:
                "O‘zganing mulkini o‘zlashtirish va uni inkor etish ma’muriy yoki undan og‘irroq javobgarlikka, ota-onaning zararni qoplashiga olib kelishi mumkin. Aniq oqibat yosh va holatlarga bog‘liq.",
              ethicsNote: "Yolg‘on bir xatoni ikkiga aylantiradi. Ishonchni qayta tiklash juda qiyin.",
              points: -30,
              tone: "bad",
              endingId: "inkor",
              legalStatus: "needs_verification",
            },
          },
        ],
      },
    },
  },
  {
    id: "guruh-chati",
    title: "Sinf guruhidagi masxara",
    tagline: "Kiberbulling: kuzatuvchi bo‘lib qolasanmi yoki himoyachi?",
    description:
      "Sinf guruh chatida sinfdoshingning tahrirlangan, masxarali rasmi tarqalmoqda. Hamma kulmoqda. Sening harakating nimani o‘zgartiradi?",
    grades: [7, 8, 9, 10],
    categoryId: "raqamli",
    durationMinutes: 5,
    emoji: "💬",
    startStepId: "start",
    relatedTopicSlug: "bulling-va-kiberbulling",
    rewards: [{ endingIds: ["himoyachi"], badgeId: "raqamli-himoyachi" }],
    steps: {
      start: {
        id: "start",
        title: "Kechki 21:40",
        narrative:
          "Sinf guruhida kimdir Jasurning rasmini kulgili qilib tahrirlab, ustiga «Sinfimizning maymuni 🐒» deb yozib tashladi. 12 kishi kulgan smaylik qo‘ydi. Jasur onlayn, lekin hech narsa yozmayapti.",
        choices: [
          {
            id: "forward",
            label: "Kulgili ekan — boshqa guruhga ham yuboraman",
            outcome: {
              title: "Sen bullingning bir qismiga aylanding",
              description:
                "Rasm yana 40 kishiga yetib bordi. Ertasi kuni Jasur maktabga kelmadi.",
              legalNote:
                "Shaxsning tasvirini kamsituvchi tarzda roziligisiz tarqatish uning sha’ni va qadr-qimmatiga, shaxsga doir ma’lumotlar himoyasiga oid huquqlarini buzishi mumkin.",
              ethicsNote: "Forward tugmasini bosish — ishtirok etish demak. «Men faqat yubordim» degan bahona ishlamaydi.",
              points: -20,
              tone: "bad",
              nextStepId: "forward-next",
            },
          },
          {
            id: "silent",
            label: "Hech narsa yozmayman, shunchaki kuzataman",
            outcome: {
              title: "Jimlik ham bir tanlov",
              description:
                "Masxara davom etdi. Jasur guruhdan chiqib ketdi.",
              legalNote:
                "Kuzatuvchi huquqbuzar emas, lekin jabrlanuvchiga yordam berish imkoniyatini qo‘ldan boy beradi.",
              ethicsNote: "Bulling jimlik bor joyda kuchayadi. Kichik qo‘llab-quvvatlash ham katta farq qiladi.",
              points: 0,
              tone: "neutral",
              nextStepId: "silent-next",
            },
          },
          {
            id: "support",
            label: "Jasurni qo‘llab-quvvatlayman va kattalarga xabar beraman",
            outcome: {
              title: "Himoyachi qadami",
              description:
                "Sen guruhga «Bu kulgili emas, o‘chiringlar» deb yozding, Jasurga shaxsan «Men sen tomondaman» deding va skrinshotni saqlab qo‘yding.",
              legalNote:
                "Dalillarni saqlash va vakolatli kattalarga murojaat qilish — huquqni himoya qilishning to‘g‘ri yo‘li.",
              ethicsNote: "Sen jabrlanuvchiga yolg‘iz emasligini ko‘rsatding. Bu jasorat.",
              points: 30,
              tone: "good",
              nextStepId: "support-next",
            },
          },
        ],
      },
      "forward-next": {
        id: "forward-next",
        title: "Ertasi kuni maktabda",
        narrative: "Sinf rahbari rasmni tarqatganlarni suhbatga chaqirdi. Sening isming ham ro‘yxatda.",
        choices: [
          {
            id: "apologize",
            label: "Jasurdan uzr so‘rayman va rasmni hamma joydan o‘chiraman",
            outcome: {
              title: "Xatoni tuzatish",
              description: "Jasur uzringni qabul qildi. Sen boshqa guruhdagilardan ham rasmni o‘chirishni so‘rading.",
              legalNote: "Tarqatilgan kontentni o‘chirish yetkazilgan zararni kamaytiradi.",
              ethicsNote: "Uzr so‘rash — kuchsizlik emas, kamolot belgisi.",
              points: 15,
              tone: "neutral",
              endingId: "uzr",
            },
          },
          {
            id: "blame",
            label: "«Men birinchi bo‘lib yuborgan emasman» deb aybni boshqaga yuklayman",
            outcome: {
              title: "Mas’uliyatdan qochish",
              description: "Ota-onang maktabga chaqirildi. Sinfdagilar ham senga ishonmay qo‘ydi.",
              legalNote: "Kim birinchi tarqatganidan qat’i nazar, har bir tarqatuvchi o‘z harakati uchun javob beradi.",
              ethicsNote: "Boshqalarni ayblash xatoni yo‘qotmaydi.",
              points: -10,
              tone: "bad",
              endingId: "aybni-yuklash",
            },
          },
        ],
      },
      "silent-next": {
        id: "silent-next",
        title: "Ikki kundan keyin",
        narrative: "Jasur tanaffusda yolg‘iz o‘tiribdi. Rasm hali ham guruhda turibdi.",
        choices: [
          {
            id: "late-help",
            label: "Uning yoniga borib gaplashaman va sinf rahbariga aytaman",
            outcome: {
              title: "Hech qachon kech emas",
              description: "Sinf rahbari rasmni o‘chirtirdi va sinfda kiberbulling haqida suhbat o‘tkazdi. Jasur senga minnatdor.",
              legalNote: "Kattalarga xabar berish — bullingni to‘xtatishning samarali yo‘li.",
              ethicsNote: "Kech bo‘lsa ham qo‘llab-quvvatlash — muhim qadam.",
              points: 20,
              tone: "good",
              endingId: "kech-yordam",
            },
          },
          {
            id: "ignore",
            label: "Bu meni qiziqtirmaydi",
            outcome: {
              title: "Muammo davom etmoqda",
              description: "Masxara boshqa o‘quvchilarga ham o‘tdi. Sinfda ishonch muhiti yo‘qoldi.",
              legalNote: "Bulling to‘xtatilmasa, jiddiy oqibatlarga — jabrlanuvchining sog‘lig‘iga zarar yetishiga olib kelishi mumkin.",
              ethicsNote: "Bugun u, ertaga sen bo‘lishing mumkin.",
              points: -5,
              tone: "bad",
              endingId: "befarq",
            },
          },
        ],
      },
      "support-next": {
        id: "support-next",
        title: "Guruhdan javob",
        narrative: "Rasmni tarqatgan o‘quvchi senga «Senga nima, hazil-ku!» deb yozdi va seni ham masxara qila boshladi.",
        choices: [
          {
            id: "report",
            label: "Javob qaytarmayman, skrinshotlarni sinf rahbari va ota-onamga ko‘rsataman",
            outcome: {
              title: "Haqiqiy raqamli himoyachi",
              description: "Sinf rahbari ota-onalar bilan uchrashuv o‘tkazdi, rasm o‘chirildi, tarqatgan o‘quvchi uzr so‘radi.",
              legalNote: "Dalillar (skrinshot, sana, ism) asosida murojaat qilish huquqiy himoyaning eng ishonchli yo‘li.",
              ethicsNote: "Sen haqoratga haqorat bilan javob bermading — bu kuchlilik.",
              points: 25,
              tone: "good",
              endingId: "himoyachi",
            },
          },
          {
            id: "insult-back",
            label: "Unga ham haqoratli xabar yozaman",
            outcome: {
              title: "Janjal kuchaydi",
              description: "Guruhda katta janjal boshlandi. Endi sen ham haqorat qilganlar qatoridasan.",
              legalNote: "Haqoratga haqorat bilan javob berish senga ham javobgarlik keltirishi mumkin.",
              ethicsNote: "Yaxshi maqsad noto‘g‘ri vosita bilan amalga oshmaydi.",
              points: 0,
              tone: "neutral",
              endingId: "janjal",
            },
          },
        ],
      },
    },
  },
  {
    id: "nosoz-quloqchin",
    title: "Nosoz quloqchin",
    tagline: "Iste’molchi huquqlari: o‘z haqqingni qonuniy yo‘l bilan himoya qil",
    description:
      "Tug‘ilgan kuningda olgan pulingga simsiz quloqchin sotib olding. 3 kundan keyin u buzildi. Do‘konda esa «Sotilgan tovar qaytarilmaydi» degan yozuv bor.",
    grades: [8, 9, 10, 11],
    categoryId: "fuqarolik",
    durationMinutes: 5,
    emoji: "🎧",
    startStepId: "start",
    relatedTopicSlug: "istemolchi-huquqlari",
    rewards: [{ endingIds: ["huquq-himoyasi", "kelishuv"], badgeId: "ongli-istemolchi" }],
    steps: {
      start: {
        id: "start",
        title: "Buzilgan xarid",
        narrative:
          "Sen 250 000 so‘mga simsiz quloqchin olding. Uch kundan keyin chap tomoni umuman ishlamay qoldi. Chek sumkangda, kafolat taloni qutida. Nima qilasan?",
        choices: [
          {
            id: "go-with-docs",
            label: "Chek va kafolat taloni bilan, ota-onam bilan do‘konga boraman",
            outcome: {
              title: "Tayyorgarlik — yarim g‘alaba",
              description: "Sen otang bilan do‘konga bording. Sotuvchi devordagi «Qaytarilmaydi» yozuvini ko‘rsatdi.",
              legalNote:
                "Chek xarid faktini, kafolat taloni esa kafolat shartlarini isbotlaydi. Voyaga yetmaganlar uchun qimmat xaridlarda qonuniy vakil ishtiroki maqsadga muvofiq.",
              ethicsNote: "Xotirjam va tayyorgarlik bilan harakat qilish natijani yaxshilaydi.",
              points: 25,
              tone: "good",
              nextStepId: "seller-refuses",
            },
          },
          {
            id: "angry-post",
            label: "Do‘kon haqida ijtimoiy tarmoqda haqoratli post yozaman",
            outcome: {
              title: "Hissiyot huquqni himoya qilmaydi",
              description: "Post tarqaldi, lekin quloqchin hali ham buzuq. Do‘kon egasi esa haqorat uchun shikoyat qilmoqchi.",
              legalNote:
                "Haqorat yoki tasdiqlanmagan ayblovlar senga qarshi javobgarlikka olib kelishi mumkin. Huquqni qonuniy tartibda himoya qilish kerak.",
              ethicsNote: "Fikr bildirish huquqi boshqalarni haqorat qilish huquqi emas.",
              points: -10,
              tone: "bad",
              nextStepId: "after-post",
            },
          },
          {
            id: "give-up",
            label: "Baribir qaytarishmaydi — tashlab yuboraman",
            outcome: {
              title: "Huquqdan voz kechish",
              description: "Sen 250 000 so‘mni yo‘qotding. Do‘kon esa boshqa xaridorlarga ham nosoz tovar sotishda davom etmoqda.",
              legalNote:
                "Iste’molchi sifatsiz tovar uchun almashtirish, ta’mirlash, narxni kamaytirish yoki pulni qaytarishni talab qilish huquqiga ega.",
              ethicsNote: "O‘z huquqingni bilmaslik — boshqalarning huquqi buzilishiga ham yo‘l ochadi.",
              points: 0,
              tone: "neutral",
              endingId: "voz-kechish",
            },
          },
        ],
      },
      "seller-refuses": {
        id: "seller-refuses",
        title: "Sotuvchi rad etdi",
        narrative: "Sotuvchi: «Ko‘rdingizmi, yozib qo‘yganmiz — qaytarilmaydi. Ehtimol o‘zingiz sindirgansiz».",
        choices: [
          {
            id: "pretension",
            label: "Yozma pretenziya topshiraman va nusxasiga qabul belgisini so‘rayman",
            outcome: {
              title: "Huquqingni qonuniy himoya qilding",
              description:
                "Pretenziyani ko‘rgan do‘kon rahbari quloqchinni ekspertizaga yubordi va zavod nuqsoni tasdiqlandi. Senga yangi quloqchin berildi.",
              legalNote:
                "Sifatsiz tovar bo‘yicha iste’molchi huquqlari qonunda belgilangan; do‘konning bir tomonlama yozuvi ularni cheklay olmasligi — tekshirish talab etiladi. Rad etilsa — iste’molchilar huquqlarini himoya qiluvchi vakolatli organ yoki sudga murojaat qilish mumkin.",
              ethicsNote: "Xotirjamlik va qonunni bilish — eng kuchli dalil.",
              points: 25,
              tone: "good",
              endingId: "huquq-himoyasi",
              legalStatus: "needs_verification",
            },
          },
          {
            id: "shout",
            label: "Baqirib, janjal ko‘taraman",
            outcome: {
              title: "Janjal yordam bermadi",
              description: "Qo‘riqchi sizdan do‘konni tark etishni so‘radi. Muammo hal bo‘lmadi.",
              legalNote: "Jamoat joyida janjal ko‘tarish huquqbuzarlik sifatida baholanishi mumkin.",
              ethicsNote: "To‘g‘ri talab ham qo‘pollik bilan aytilsa, o‘z kuchini yo‘qotadi.",
              points: -5,
              tone: "bad",
              endingId: "janjal",
            },
          },
        ],
      },
      "after-post": {
        id: "after-post",
        title: "Vaziyatni tuzatish",
        narrative: "Do‘kon egasi senga yozdi: «Postni o‘chiring, keyin gaplashamiz».",
        choices: [
          {
            id: "delete-and-talk",
            label: "Postni o‘chirib, chek bilan do‘konga boraman",
            outcome: {
              title: "Kelishuvga erishildi",
              description: "Sen uzr so‘rab postni o‘chirding. Do‘kon quloqchinni almashtirib berdi.",
              legalNote: "Nizoni muzokara orqali hal qilish — qonuniy va samarali yo‘l.",
              ethicsNote: "Xatoni tuzatib, muloqotga o‘tish — yetuklik.",
              points: 20,
              tone: "good",
              endingId: "kelishuv",
            },
          },
          {
            id: "more-posts",
            label: "Yana ko‘proq post yozaman",
            outcome: {
              title: "Nizo chuqurlashdi",
              description: "Do‘kon egasi haqorat uchun rasmiy shikoyat qildi. Endi ota-onang ham bu bilan shug‘ullanishi kerak.",
              legalNote: "Haqorat va tuhmat uchun javobgarlik mavjud — tekshirish talab etiladi.",
              ethicsNote: "G‘azab yomon maslahatchi.",
              points: -15,
              tone: "bad",
              endingId: "nizo",
              legalStatus: "needs_verification",
            },
          },
        ],
      },
    },
  },
];

export const scenarioById = (id: string) => scenarios.find((s) => s.id === id);
