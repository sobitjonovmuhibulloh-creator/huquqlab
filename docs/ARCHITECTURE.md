# HuquqLab: arxitektura va yo‘l xaritasi

**Holat:** 2026-yil 26-noyabr. Belgilar:

- ✅ **Ishlaydi** — kodda bor va tekshirilgan (`npm run check` + brauzerda E2E).
- 🧩 **Integratsiya nuqtasi tayyor** — interfeys bor, tashqi servis ulanmagan.
- 📐 **Arxitektura** — faqat loyiha, kod yo‘q. UI’da «tayyor» deb ko‘rsatilmaydi.

---

## 1. Umumiy tuzilma

```
src/
  app/                      Sahifalar va API route'lar (Next.js App Router)
    testlar/                Test Market, [id] detail, [id]/yechish, natija/[attemptId], xatolar
    mening-testlarim/       Kabinet: ochiq testlar, kreditlar, xaridlar, urinishlar
    tolov/[orderId]/        Checkout holati
    api/
      pricing, access, access/unlock
      exams/[id]/{preview,start,submit}
      checkout, orders/[id], orders/[id]/claim
      payments/mock         (faqat development)
      admin/pricing         (admin sessiyasi bilan)
  components/exam/          ExamCard, MarketView, ExamDetail, ExamRunner, QuestionBody,
                            ResultView, SmartReview, MyTests, CheckoutStatus
  config/pricing.ts         Standart narxlar (admin ularni ustidan yozadi)
  data/exams.ts             Test katalogi: faqat ochiq meta, savollarsiz
  lib/grading.ts            Baholash (sof funksiyalar)
  lib/market.ts             Narx/kredit qoidalari (server va klient uchun umumiy)
  lib/exam-client.ts        Klient API, urinishni avtosaqlash, natijalar tarixi, Smart Review
  server/                   FAQAT server ("server-only"):
    questions/              Savollar bazasi (to'g'ri javoblar bilan)
    signing.ts              HMAC imzolangan tokenlar
    access.ts               Access cookie (entitlements)
    orders.ts               OrderStore interfeysi + xotiradagi implementatsiya
    payments/               PaymentProvider abstraksiyasi
    pricing-store.ts        Narxlar ombori
  types/exam.ts             Domen type'lari
```

---

## 2. 1-ustuvorlik: amalga oshirilgan

### 2.1 Test Market ✅

- Katalog: kategoriya, access (bepul/premium/menga ochiq) va auditoriya bo‘yicha filtr.
- Karta: nom, kategoriya, savollar soni, vaqt, daraja, tavsif, narx, bepul/premium/ochiq holati, muallif, yangilangan sana.
- `coming_soon` testlar katalogda «Tayyorlanmoqda» deb ko‘rinadi, narxi «e’lon qilinadi». API ularni sotmaydi va boshlamaydi.
- Preview: `/api/exams/[id]/preview` birinchi N savolni **javobsiz** qaytaradi.

### 2.2 Premium access ✅

**Model.** Akkaunt tizimi yo‘q, shuning uchun access imzolangan httpOnly cookie’da saqlanadi (`huquqlab_access`, HMAC-SHA256, `ACCESS_TOKEN_SECRET`):

```ts
AccessState { v: 1; uid; exams: string[]; credits: Record<productId, number>; purchases: PurchaseRecord[] }
```

**Xavfsizlik qoidalari:**

- Premium savollar va to‘g‘ri javoblar faqat `src/server/questions` ichida turadi. `server-only` ularning klient bundle’iga tushishiga yo‘l qo‘ymaydi.
- `/start` access’ni tekshiradi va savollarni `toPublic` orqali qaytaradi: maydonlar allow-list bilan tanlanadi, javob kaliti va izoh chiqmaydi (`npm run check` buni tekshiradi).
- `/submit` serverda baholaydi. Urinish tokeni imzolangan (`aid`, `examId`, `uid`, `deadline`), boshqa brauzerning tokeni rad etiladi.
- Narx har doim serverdagi pricing’dan olinadi. Klient yuborgan summa ishlatilmaydi.

**Cheklov:** access shu brauzerga bog‘langan. Akkauntlar qo‘shilganda (§4.1) manba DB bo‘ladi, cookie esa faqat sessiya bo‘lib qoladi.

### 2.3 Narxlar ✅

- Standartlar: `config/pricing.ts` — 1 test 11 000, 5 test 45 000, 10 test 79 000, attestatsiya paketi 11 000 (`categories: ["attestatsiya","oqituvchilar"]`).
- Admin → «Narxlar» tabi → `PUT /api/admin/pricing` (sessiya tekshiriladi, server validatsiyasi: butun son, 1 000 – 10 000 000, faqat ma’lum mahsulotlar).
- Saqlash: `.data/pricing.json`. **Vercel’da fayl tizimi faqat o‘qish uchun** — API 501 qaytaradi va DB kerakligini aytadi. Production uchun `pricing-store.ts` ichida DB implementatsiyasi yoziladi, interfeys o‘zgarmaydi.
- Narx o‘zgarishi eski xaridlarga ta’sir qilmaydi: kreditlar `productId` bo‘yicha saqlanadi, summa buyurtmada qayd etiladi.

### 2.4 Checkout va to‘lov 🧩

Oqim: katalog → test → preview → narx → `POST /api/checkout` → `/tolov/[orderId]` → status → `POST /api/orders/[id]/claim` → access → «Mening testlarim» → xaridlar tarixi.

```ts
interface PaymentProvider { id: string; createPayment(order: Order): Promise<{ redirectUrl: string }> }
interface OrderStore { create; get; setStatus; markClaimed }
```

| Qoida | Qanday ta’minlanadi |
| --- | --- |
| Mock faqat development | `isMockPaymentsAllowed()` = `NODE_ENV !== "production"` va `PAYMENT_PROVIDER` (standart `mock`). Productionda `/api/payments/mock` 404 qaytaradi. `npm run check` tekshiradi. |
| To‘lovsiz access yo‘q | `/claim` faqat `status === "paid"` bo‘lsa ishlaydi |
| Ikki marta access yo‘q | `markClaimed` bir marta `true` qaytaradi |
| Yakuniy holat o‘zgarmaydi | `setStatus` faqat `pending` holatdan o‘tkazadi |
| Buyurtma begona emas | `order.uid === access.uid` |
| Eskirgan buyurtma | `pending` holati 30 daqiqadan keyin `expired` bo‘ladi |
| Provayder sozlanmagan production | `/api/checkout` 503 qaytaradi, UI’da «Onlayn to‘lov hali ulanmagan» chiqadi, tugmalar o‘chirilgan |

**Click/Payme ulash (keyingi qadam):**

1. `OrderStore`ning DB implementatsiyasi (Postgres/Prisma). Callback server-server keladi va bir nechta instansiyada ishlaydi, xotiradagi store yetmaydi.
2. `server/payments/click.ts`: `createPayment` Click invoice URL’ini qaytaradi.
3. `app/api/payments/click/callback/route.ts`: imzoni (secret key) tekshirish, summa va `orderId`ni solishtirish, idempotentlik (`click_trans_id` unikal), `orderStore.setStatus(id, "paid")`.
4. `getPaymentProvider()` → `PAYMENT_PROVIDER=click` uchun qaytarish.
5. Payme uchun xuddi shunday: JSON-RPC `CheckPerformTransaction`, `CreateTransaction`, `PerformTransaction`, `CancelTransaction`.

### 2.5 Test engine (imtihon rejimi) ✅

- Taymer server vaqti bo‘yicha (`deadline`, `clockOffset`). Oxirgi 5 daqiqada qizil rangga o‘tadi. Vaqt tugaganda avtomatik topshiriladi. Server 2 daqiqa tarmoq zaxirasi beradi, kech kelgan javob «avtomatik topshirilgan» deb belgilanadi.
- 45 savolli mock, 90 daqiqa — `NATIONAL_FORMAT` (rasmiy spetsifikatsiya).
- Savol turlari: Y-1, Y-2 (vaziyat matni bilan), O (qisqa javob, normalizatsiya: registr, apostrof, tinish belgilari).
- Navigator, belgilash (flag), har o‘zgarishda localStorage’ga avtosaqlash (sahifa yangilansa tiklanadi), progress, topshirishni tasdiqlash (javobsiz va belgilangan savollar soni bilan), `beforeunload` ogohlantirishi.
- Klaviatura: A–D/1–4 tanlash, ←/→ o‘tish, F belgilash. Mobil uchun pastki panel va ochiladigan navigator.

### 2.6 Batafsil natija ✅

To‘g‘ri/jami va foiz, sarflangan vaqt, javobsizlar soni, topshiriq turlari (Y-1/Y-2/O) va spetsifikatsiya bo‘limlari bo‘yicha natija. 60% dan past bo‘limlar «takrorlash tavsiya etiladi» ro‘yxatiga tushadi. Savollar «Xato / Javobsiz / To‘g‘ri» bo‘yicha filtrlanadi, har birida izoh va manba (lex.uz) bor. Milliy format testida «bu rasmiy Rash bali emas» degan ogohlantirish chiqadi.

### 2.7 Smart Review ✅

`collectMistakes`: har bir savol bo‘yicha eng so‘nggi urinish olinadi. Keyin to‘g‘ri yechilgan savol ro‘yxatdan chiqadi, takroriy xatolar sanaladi, bo‘limlar bo‘yicha guruhlanadi. Mashq rejimida to‘g‘ri javob berilsa, savol «o‘zlashtirildi» deb belgilanadi. Hammasi real natijalar asosida.

### 2.8 UI/UX ✅

- Yangi bosh sahifa: «Huquqni bil. Imtihonga ishonch bilan tayyorlan.», ikki CTA, imkoniyatlar (tayyor emaslari belgilangan), «Qanday ishlaydi», tayyor testlar, 5 ta foydalanuvchi turi uchun yo‘l.
- Statistika faqat haqiqiy ma’lumotdan hisoblanadi: tayyor testlar, bazadagi savollar, mavzular, hujjatlar soni.
- Qayta ishlatiladigan UI elementlari: `Button`, `Pill`, `Chip`, `ProgressBar`, `Skeleton`, `EmptyState`, `ConfirmDialog` (`tone`), `Toast`, `SearchDialog` (Ctrl+K). Loading, error va empty holatlari Market, Detail, Runner, Result, Review, Kabinet va Checkout sahifalarida bor.

### 2.9 Testlash ✅

`npm run check` (tsx, `--conditions=react-server`) tekshiradi:

- Savollar bazasi: ID va matn takrorlanmasligi, 4 ta turli variant, Y-2 vaziyati, O javoblari, lex.uz ID’lari tekshirilgan ro‘yxatda ekani.
- Mock formati 32/3/10 va tartibi Y-1 → Y-2 → O.
- Javob kaliti klientga sizib chiqmasligi.
- Baholash: hammasi to‘g‘ri / bo‘sh, normalizatsiya, javoblarni tozalash.
- Smart Review mantig‘i.
- Narx validatsiyasi va paket qamrovi.
- Imzo va soxtalashtirish.
- Production’da mock o‘chiqligi va maxfiy kalit majburiyligi.

Brauzer E2E (Chrome DevTools Protocol) qo‘lda ishga tushirilgan: test yechish → sahifani yangilab tiklash → topshirish → natija → Smart Review → mock xarid → access → Kabinet.

### 2.10 Muhit o‘zgaruvchilari

| O‘zgaruvchi | Majburiy | Izoh |
| --- | --- | --- |
| `ACCESS_TOKEN_SECRET` | production’da ha (≥32 belgi) | Access cookie va urinish tokenlari imzosi |
| `PAYMENT_PROVIDER` | yo‘q | Development’da standart `mock`. Productionda haqiqiy provayder ulanmaguncha bo‘sh qoldiriladi |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | ha | Admin panel |

---

## 3. Ma’lumotlar modeli

> **Yangilanish:** testlar bazasi Supabase (PostgreSQL) bilan amalga oshirildi — sxema, RLS va import: [DATABASE.md](DATABASE.md). Quyidagi model keyingi bosqichlar (akkauntlar, buyurtmalar) uchun reja.

Hozirgi type’lar (`src/types/exam.ts`) jadvallarga to‘g‘ridan-to‘g‘ri mos keladi:

```
User(id, phone/email, role: student|teacher|admin, createdAt)
Exam(id, title, category, access, status, durationMinutes, difficulty, author, updatedAt)
Question(id, examId?, kind, spec, difficulty, context, prompt, options[], correctIndex?, accepted[]?,
         explanation, sourceDocument, sourceArticle, lexId, legalVersionDate, reviewStatus, createdBy)
ExamQuestion(examId, questionId, position)
Product(id, kind, title, price, credits, categories[], active, highlight)   ← narx tarixi uchun PriceChange
Order(id, userId, productId, examId?, amount, status, provider, providerTxnId UNIQUE, createdAt, updatedAt)
Entitlement(userId, examId, source: purchase|credit|subscription, orderId?, grantedAt)
CreditBalance(userId, productId, remaining)
Attempt(id, userId, examId, startedAt, deadline, finishedAt, autoSubmitted, answers JSONB, correct, total)
AttemptItem(attemptId, questionId, answer, correct)                          ← Question Intelligence statistikasi
```

Bir martalik xarid va obuna bir-biriga xalaqit bermaydi: access = `Entitlement` mavjud **yoki** faol `Subscription` testning kategoriyasini qamraydi (§4.11).

---

## 4. Keyingi modullar (📐 arxitektura)

Har biri uchun: mavjud kod bilan integratsiya · data model · xavfsizlik · UI.

### 2-USTUVORLIK

#### 4.1 Akkauntlar (barcha keyingi modullar uchun asos)

- Telefon raqam + OTP (SMS provayder) yoki Telegram Login.
- Mavjud cookie’dagi `uid`, xaridlar va localStorage natijalari birinchi kirishda akkauntga ko‘chiriladi (merge).
- Rollar: `student`, `teacher`, `admin`. Hozirgi admin parol tizimi rolga asoslangan tizimga almashtiriladi.

#### 4.2 Teacher dashboard

- `Class(id, teacherId, name, joinCode)`, `ClassMember(classId, userId)`, `Assignment(classId, examId, dueAt)`.
- UI: sinf yaratish, qo‘shilish kodi, test topshiriq qilib berish, natijalar jadvali (o‘quvchi × bo‘lim), zaif bo‘limlar heatmap’i.
- Xavfsizlik: o‘qituvchi faqat o‘z sinfi a’zolarining natijalarini ko‘radi.

#### 4.3 Attestatsiya

- `data/exams.ts`dagi `attestatsiya-huquq-1` (hozir `coming_soon`) — savollar bazasi tayyor bo‘lgach `available` qilinadi. Engine o‘zgarmaydi.
- Kontent: fan mazmuni + metodika. O‘tish chegarasi `ExamMeta.passPercent` sifatida qo‘shiladi.

#### 4.4 Knowledge Passport

- Manba: `Attempt` + `AttemptItem` → spetsifikatsiya kodi bo‘yicha mastery = so‘nggi N javobdagi to‘g‘ri ulush (eskirgan javobga kichikroq vazn).
- UI: bo‘limlar xaritasi, testlar tarixi, kuchli va zaif bo‘limlar, yutuqlar.
- PDF hisobot: server tomonda (`@react-pdf/renderer`), har sahifada «Bu rasmiy sertifikat emas — HuquqLab o‘quv hisoboti» deb yoziladi.

#### 4.5 Question Intelligence

- Admin savollar banki: `reviewStatus: draft | in_review | approved | outdated`. Faqat `approved` savollar testga kiradi.
- Takroriy savollarni topish: normallashtirilgan matn bo‘yicha (hozirgi `npm run check`da bor) + trigram o‘xshashligi (`pg_trgm`).
- Statistika `AttemptItem`dan: xato ulushi, har bir variant tanlanish ulushi (variant hech kim tanlamasa — zaif distraktor), o‘rtacha vaqt.
- `legalVersionDate` + Law Tracker (§4.9): hujjat o‘zgarsa, bog‘liq savollar `outdated` bo‘ladi va testlardan chiqadi.

### 3-USTUVORLIK

#### 4.6 AI Huquq Ustoz

- Model faqat server route orqali chaqiriladi (`/api/tutor`). API kalit faqat server env’ida turadi, frontendda hech qachon bo‘lmaydi.
- RAG: bilim bazasi = tasdiqlangan mavzular, `approved` savollar va izohlar, `documents.ts` (lex.uz havolasi va tekshirilgan sana bilan). Javob har doim manba va tahrir sanasini ko‘rsatadi.
- Tizim qoidasi: manbada yo‘q narsani o‘ylab topmaslik, «aniq bilmayman, lex.uz’dan tekshiring» deyish. UI’da doimiy «Bu yuridik maslahat emas» belgisi.
- Funksiyalar: tushuntirish, misol, mini-test (faqat bazadagi `approved` savollardan), xato javobni izohlash (Smart Review’dan chaqiriladi).
- Rate limit (foydalanuvchi va IP bo‘yicha), suhbat jurnali sifat nazorati uchun.

#### 4.7 Adaptive Learning Engine

- Kirish: Knowledge Passport mastery + Smart Review xatolari.
- Keyingi savolni tanlash: mastery past bo‘limdan, darajani mastery’ga qarab (`oson → o‘rta → murakkab`).
- Takrorlash jadvali: SM-2 soddalashtirilgan varianti (xato → 1 kun, to‘g‘ri → 3 → 7 → 14 kun).
- Tavsiyalar faqat haqiqiy `AttemptItem` ma’lumotidan. Ma’lumot yetarli bo‘lmasa (masalan, < 5 javob), «diagnostika topshiring» deyiladi.

#### 4.8 Scenario simulator kengaytmasi va HuquqLab Live

- Simulyator: mavjud `Scenario` grafi va `validateScenario` qayta ishlatiladi. Admin muharrir: qadamlar va tanlovlarni grafik ko‘rinishda tahrirlash, saqlashdan oldin `validateScenario`.
- Live (realtime sinf viktorinasi): `LiveSession(id, teacherId, examId|questionIds, joinCode, state)`. Transport — managed WebSocket (Ably, Pusher yoki Supabase Realtime), chunki Vercel serverless doimiy WS ulanishni ushlab turmaydi. Server: o‘qituvchi buyruqlari (start, next, reveal), javoblar `POST` orqali yuboriladi va serverda baholanadi.

### 4-USTUVORLIK

#### 4.9 Law Tracker

- `LawUpdate(documentSlug, changeDate, officialUrl, summaryPlain, verifiedBy, verifiedAt)`. Faqat qo‘lda tasdiqlangan yozuvlar e’lon qilinadi.
- Bog‘lanish: `documents.ts` → mavzular (`topicsForDocument`) → savollar (`source.lexId`). Yangi yozuv qo‘shilganda bog‘liq savollar `outdated`ga o‘tadi (§4.5).

#### 4.10 Teacher Resource Library

- Fayllar obyekt omborida (S3/R2), metadata DB’da: `Resource(type: slides|plan|pdf|docx|test|case|assignment, topic, grade, authorId, license)`.
- Mavjud `kutubxona` sahifasidagi filtrlar qayta ishlatiladi. Yuklab olish imzolangan URL orqali. Mualliflik huquqi: faqat ruxsatli materiallar.

#### 4.11 Subscription architecture

- `Plan(id: free|premium|bundle|teacher|institution, period, price, categories)`, `Subscription(userId|orgId, planId, status, currentPeriodEnd)`.
- Access tekshiruvi bitta funksiyada: `hasAccess(user, exam) = exam.free || entitlement(user, exam) || activeSubscriptionCovers(user, exam)`. Bir martalik xarid va obuna bir-biridan mustaqil. Obuna tugasa, sotib olingan testlar ochiq qoladi.
- Narxlar `Product`/`Plan` jadvallarida, admin panel orqali boshqariladi.

#### 4.12 Referral & Growth

- `ReferralCode(userId, code)`, `Referral(code, invitedUserId, status, rewardedAt)`, `RewardRule(trigger: first_purchase, reward: credit|discountPercent)`.
- Abuse’ga qarshi: mukofot faqat taklif qilingan foydalanuvchi birinchi **to‘langan** xaridni qilgandan keyin beriladi. Bitta qurilma yoki telefon bilan qayta ro‘yxatdan o‘tish hisobga olinmaydi, kunlik limit bor, o‘zini o‘zi taklif qilish taqiqlanadi.

---

## 5. Kontent sifati qoidalari

- Har bir savolda izoh va manba bo‘lishi shart. `lexId` faqat lex.uz’da ochib tekshirilgan hujjatlar uchun yoziladi.
- Modda raqami faqat rasmiy matn bilan solishtirilgandan keyin yoziladi.
- Raqib platformalarning savollari, matnlari va dizayni ko‘chirilmaydi.
- Yangi test qo‘shish: `server/questions/<id>.ts` → `questionBank` → `data/exams.ts`da `status: "available"` → `npm run check`.
