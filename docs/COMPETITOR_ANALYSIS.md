# Raqobatchilar tahlili

**Sana:** 2026-yil 26-noyabr
**Usul:** saytlarning ochiq sahifalari o‘qildi (login talab qiladigan sahifalar ochilmadi). Belgilar:

- ✅ **Tekshirilgan** — sahifada o‘z ko‘zimiz bilan ko‘rilgan fakt.
- ⚠️ **Taxmin** — ko‘rilgan ma’lumotdan chiqarilgan xulosa, fakt emas.
- ❓ **Tekshirilmagan** — sahifa ochilmadi yoki platforma topilmadi.

Raqiblarning dizayni, kodi, matnlari va test savollari **ko‘chirilmaydi**. HuquqLab savollari tahririyat tomonidan noldan yoziladi.

---

## 0. Rasmiy format (barcha raqiblar uchun umumiy asos)

✅ Bilimni baholash agentligi e’lon qilgan «Huquqshunoslik fanidan milliy test tizimi uchun test varianti tafsiloti» (2026-11-17, [PDF](https://api-portal.gov.uz/uploads/165/2026/11/17/3b10f62b-456a-3cd1-17c6-1b535340a062_media_.pdf)):

| Parametr | Qiymat |
| --- | --- |
| Topshiriqlar | 45 ta: **32 × Y-1** (bitta to‘g‘ri javobli yopiq), **3 × Y-2** (vaziyatli yopiq), **10 × O** (qisqa javobli ochiq) |
| Vaqt | 90 daqiqa |
| Bo‘limlar | 1. Davlat va huquq nazariyasi · 2. Konstitutsiyaviy huquq asoslari · 3. Huquq sohalari · 4. Jazo turlari, atamalar, diagramma |
| Baholash | Rash modeli |
| Huquqiy manbalar | 40 ta normativ-huquqiy hujjat ro‘yxati (Konstitutsiya, kodekslar, qonunlar) |

HuquqLab mock testlari aynan shu formatda tuzilgan va savollar spetsifikatsiya kodlari (1.1–4.1) bilan belgilangan. Rash bali takrorlanmaydi: natijada to‘g‘ri javoblar soni va foizi ko‘rsatiladi, «rasmiy ball emas» degan izoh bilan.

---

## 1. xlex.uz — «Onlayn huquq platformasi»

O‘qilgan sahifalar: `/`, `/testlar`, `/haftalik-testlar`, `/test/huquq-maktabi-milliy-45`, `/obuna`. `/reyting` va `/kontent` login yoki JS talab qilgani uchun to‘liq ochilmadi.

### Ko‘rinadigan funksiyalar ✅

- 23 bo‘limli yon menyu: qonunchilik kontentlari, sertifikat imtihoni, blok testlar (BMBA 90), sinov testlari, majburiy fanlar, haftalik testlar, olimpiada, attestatsiya, kasbiy sertifikatlash, duel, o‘yinlar (yuridik karta, logo quiz), do‘kon, reyting, chat, obuna, FAQ.
- Milliy sertifikat mock: 45 topshiriq (32 yopiq, 3 moslashtirish, 10 ochiq), 90 daqiqa, avtomatik topshirish, javoblar avtosaqlanadi, Rash modeli bo‘yicha hisoblanishi aytilgan, 46+ ballga PDF sertifikat va QR tekshiruv, A+…C darajalari.
- Gamifikatsiya: coin, 25 daraja, ko‘plab reytinglar, 5 savollik duel.
- To‘lov: Click (faqat shu nomlangan).

### Narxlar ✅ (so‘m)

| Mahsulot | Narx |
| --- | --- |
| Milliy sertifikat mock (1 urinish) | 29 000 |
| Blok test (90 savol) | 29 000 |
| Sinov testi (30 savol) | 9 000 |
| Majburiy fan testi (10 savol) | 5 000 |
| Kontent (1 hujjat bo‘yicha 30 savol, 1 yil) | 30 000 |
| Kontent premium (35 ta hujjat, 1 yil) | 900 000 |
| Haftalik test | 10 000 |
| Attestatsiya varianti / 10 variant | 9 000 / 80 000 |
| Duel paketlari | 10 000 – 40 000 |

### Kuchli tomonlari

- Rasmiy formatga yaqin mock va sertifikat (QR bilan) — abituriyent uchun motivatsiya.
- Kontent hajmi keng: qonunchilik, attestatsiya, olimpiada, haftalik testlar.
- Faol hamjamiyat elementlari: reyting, duel, chat.

### Zaif tomonlari va yaxshilash mumkin bo‘lgan jihatlar

- ✅ Milliy mock uchun bepul urinish yo‘q — 29 000 so‘m to‘lamasdan formatni sinab bo‘lmaydi.
- ✅ Urinish uchun to‘lov: har bir qayta topshirish yana pul. Umumiy xarajatni oldindan hisoblash qiyin.
- ✅ Bepul savollar qoidalari sahifalarda bir-biriga zid (1–3 va 1–4; «1 ta test» va «2 ta savol»).
- ✅ Bosh sahifada allaqachon ishlayotgan testlar «Tez kunda» deb turibdi (eskirgan matn).
- ⚠️ Deyarli hamma narsa login ortida, 23 bo‘limli menyu yangi foydalanuvchi uchun og‘ir.
- ⚠️ Natijadagi ball rasmiy Rash bali bilan qanchalik mos ekani tushuntirilmagan.
- ✅ O‘qituvchi uchun sinf boshqaruvi ko‘rinmadi.

### HuquqLabning differensial ustunligi

1. **Bepul diagnostika ro‘yxatdan o‘tishsiz** — mahsulot sifatini pul to‘lamasdan ko‘rsatamiz.
2. **Bir martalik xarid → cheksiz qayta topshirish**, narx esa 11 000 so‘mdan (xlex: urinish boshiga 29 000).
3. **Har bir savolga izoh va lex.uz manbasi**, natijada spetsifikatsiya bo‘limlari bo‘yicha tahlil.
4. **Smart Review** — barcha urinishlardagi xatolar bir joyda, takroriy xatolar ajratilgan.
5. **Halol natija**: foizni «rasmiy ball» deb ko‘rsatmaymiz.
6. **Sodda navigatsiya**: 7 ta asosiy bo‘lim, mobil uchun alohida imtihon interfeysi.

### Takrorlamaymiz

- Urinish boshiga to‘lov modelini.
- Rasmiy hujjatga o‘xshab ko‘rinadigan «sertifikat»ni (HuquqLab hisobotida «rasmiy sertifikat emas» deb yoziladi).
- Ta’limga aloqasi kam o‘yinlar va chat bilan menyuni to‘ldirishni.

### Innovatsiya

Spetsifikatsiya kodlari bo‘yicha mahorat xaritasi (Knowledge Passport), qonun o‘zgarsa eskirgan savolni avtomatik belgilash (Law Tracker), o‘qituvchi uchun sinf bo‘yicha tahlil.

---

## 2. testmakon.uz — milliy sertifikat mock testlari (8 fan)

O‘qilgan sahifa: `/certificate/`.

- ✅ Ko‘p fanli platforma. Huquq bo‘yicha 50 ta variant e’lon qilingan.
- ✅ Natija 75 ballik T-shkala va A+…C daraja bilan ko‘rsatiladi. Vaqtli variantlar, «Mening natijalarim» bo‘limi, uch tilli interfeys (UZ/RU/KIR).
- ❓ Narxlar sahifada ko‘rinmadi. ⚠️ Telegram’da «obunachilarga chegirma» deyilgani pullik tarif borligini bildiradi.
- **Kuchli:** variantlar soni ko‘p, ko‘p fanli auditoriya.
- **Zaif:** menyu gavjum (~15 band, «New» belgilari), login va Telegram popup’i. Huquqqa ixtisoslashmagan, ya’ni qonun manbalari va nazariya chuqurligi yo‘q (⚠️).
- **HuquqLab ustunligi:** huquqqa ixtisoslashuv (qonunlar katalogi, lug‘at, manbali izohlar, simulyatorlar).
- **Takrorlamaymiz:** soxta aniqlikdagi «T-ball» (rasmiy Rash parametrlarisiz).

## 3. huquqsertifikat.uz

- ❓ **Tekshirilmagan.** Sahifa JS bilan yuklanadi, statik o‘qishda faqat sarlavha («Huquqdan milliy sertifikat») ko‘rindi. Funksiya va narxlar haqida xulosa qilinmaydi.

## 4. oliygoh.uz — huquq testi

- ✅ 50 savol, 60 daqiqa, bepul. Sahifa sanasi 2021-yil 31-may.
- **Zaif:** ✅ milliy sertifikat formatida emas, ✅ eskirgan (2023-yilgi Konstitutsiyadan oldingi davr), ✅ natija tahlili ko‘rinmadi.
- **HuquqLab ustunligi:** yangi Konstitutsiya bo‘yicha dolzarb savollar, rasmiy format.

## 5. «Huquqdan-Sertifikat» Telegram Mini App (GitHub ochiq kodi)

- ✅ README: 45 topshiriqli format (1–32 Y-1, 33–35 Y-2, 36–45 O), 90 daqiqalik taymer, A+…C darajalar, 40 ta normativ hujjat lex.uz havolalari bilan.
- **Kuchli:** Telegram ichida ishlaydi, kirish to‘sig‘i past.
- **Zaif:** ⚠️ yakka loyiha, kontent hajmi va yangilanish noma’lum.
- **Xulosa:** Telegram Mini App kanali — HuquqLab uchun ham kelajakdagi kanal (docs/ARCHITECTURE.md, 4-ustuvorlik).

## 6. LexAI (Adliya vazirligi bilan birga)

- ✅ Yangiliklarga ko‘ra huquqiy savollarga javob beruvchi AI chatbot, test rejimida.
- Imtihon platformasi emas, lekin AI Huquq Ustoz uchun benchmark. HuquqLab AI’si faqat tekshirilgan bilim bazasi bilan ishlaydi va «yuridik maslahat emas» deb belgilanadi.

## 7. iHuquq, TestLex, HuquqTech

- ❓ **Tekshirilmagan.** Veb-qidiruvda bu nomli O‘zbekiston platformalari topilmadi. Nomi boshqacha yozilishi yoki faqat Telegram/ilova ichida bo‘lishi mumkin. Havola berilsa, tahlil to‘ldiriladi.

---

## Umumiy xulosa: HuquqLab pozitsiyasi

> «HuquqLab — huquq fanini o‘rganish, imtihonga tayyorlanish, bilimingizni sinash va natijangizni tahlil qilish uchun yagona interaktiv platforma.»

| Mezon | xlex.uz | testmakon.uz | HuquqLab |
| --- | --- | --- | --- |
| Bepul mock / diagnostika | Yo‘q | ❓ | **Ha, ro‘yxatdan o‘tishsiz** |
| Premium test narxi | 29 000 / urinish | ❓ | **11 000 bir martalik, cheksiz qayta** |
| Izoh + rasmiy manba | ⚠️ «tahlil» bor | ❓ | **Har bir savolda, lex.uz havolasi** |
| Bo‘limlar bo‘yicha tahlil | ⚠️ | ⚠️ | **Spetsifikatsiya kodlari bo‘yicha** |
| Xatolar ustida ishlash | ❓ | ❓ | **Smart Review** |
| O‘rganish kontenti | Qonunchilik testlari | Yo‘q | **Mavzular, simulyatorlar, qonunlar, lug‘at** |
| O‘qituvchi paneli | Yo‘q | Yo‘q | Rejada (2-ustuvorlik) |
