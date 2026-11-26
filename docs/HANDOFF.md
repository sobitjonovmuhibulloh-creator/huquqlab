# Ishni davom ettirish (boshqa kompyuterda)

**Holat:** 2026-yil 26-noyabr. Kod `platforma-v2` branch'ida.

## Tayyor

- Test Market, imtihon rejimi (taymer, navigator, avtosaqlash), natija tahlili, Smart Review.
- Narxlar: 1 test — 3 000, mock — 5 000, 5 ta — 10 000, 10 ta — 18 000 (admin → Narxlar).
- Supabase sxemasi va RLS (`supabase/migrations`), lokal PGlite ombori (`LOCAL_DB=pglite`).
- Excel/CSV import: uz/ru/en sarlavhalar, ustunlarni moslashtirish, ko‘p varaq, xatoli qatorni tahrirlash, preview, atomar import.
- Katalog: qidiruv, filtrlar, «HuquqLab testlari» va «Yuklangan to‘plamlar» bo‘yicha ajratish.
- Batafsil: `docs/ARCHITECTURE.md`, `docs/DATABASE.md`.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local      # ADMIN_PASSWORD, ADMIN_SESSION_SECRET
LOCAL_DB=pglite npm run dev     # http://localhost:3100
npm run check && npm run check:db
```

## Git’da YO‘Q narsalar (repo ochiq — mualliflik huquqi)

`.data/` papkasi git va deploy’ga tushmaydi. Unda quyidagilar bor:

- lokal baza `.data/pglite`;
- 50 variant importi: `.data/import/8-9-variant-50-import.xlsx`, tekshirish ro‘yxati `…-tekshirish.xlsx`, `parsed.json`.

Bu fayllar eski kompyuterda `Desktop\huquqlab-maxfiy-malumotlar.zip` ga yig‘ilgan. Ularni qo‘lda ko‘chiring: arxivni loyiha ildiziga ochib, `.data/` papkasini joyiga qo‘ying. Keyin admin → Import orqali `8-9-variant-50-import.xlsx` ni qayta yuklang. Bu 50 test va 866 savol (qoralama) yaratadi; so‘ng ularni «E’lon qilish» kerak.

## Tugallanmagan ish: 4 ta milliy sertifikat PDF (javob kalitisiz)

Fayllar:

- `HUQUQ MS 45 ta (@HUQUQVODIYSI).pdf`
- `Sertifikat test 1-variant.pdf`
- `45 test Azimjon Ahmadjonov.pdf`
- `MS umumiy 45 ta test 1 - variant.pdf`

`MS ORGINAL TEST-30.pdf` — matematika, olinmaydi.

Bajarilgani:

- har bir PDF’dan 45 tadan savol ajratildi (35 yopiq + 10 ochiq). Ular zip ichidagi `ms/f1.txt` (HUQUQVODIYSI), `f3.txt` (Sertifikat), `f4.txt` (Azimjon), `f6.txt` (MS umumiy) fayllarida;
- birinchi baza bilan takror yo‘q;
- foydalanuvchi javoblarni HuquqLab o‘zi aniqlashini so‘radi.

Javoblarni lex.uz rasmiy matni bo‘yicha tekshirish boshlangan. Olingan ma’lumotlar zip ichida, `ms/lexuz-topilmalar.md` faylida.

Keyingi qadam:

1. Qolgan qonunlar moddalarini lex.uz’dan o‘qish: Oila kodeksi, FK II qism (`lex.uz/docs/180552`), JK, JPK, Mehnat kodeksi, Konstitutsiya va boshqalar.
2. Har bir savolga javob, izoh va manba yozib, import shabloniga (xlsx) to‘plash. Muallif ustuniga asl muallif yoziladi; tavsifga «Javoblar HuquqLab tomonidan aniqlangan, mutaxassis tekshiruvi kutilmoqda» qo‘shiladi.
3. Admin → Import → qoralama sifatida yuklash.

**Diqqat:** Umidjon Qo‘chqarov fayllarida «roziligisiz sotish/tarqatish taqiqlanadi» deb yozilgan. Ruxsat tasdiqlanmaguncha bu testlarni e’lon qilmang.

## Kerakli sozlamalar (internetdagi sayt uchun)

- Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` — faqat server env’ida.
- `ACCESS_TOKEN_SECRET` — Vercel’da majburiy.
- Click/Payme — hali ulanmagan.
