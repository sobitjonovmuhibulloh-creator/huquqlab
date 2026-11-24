# HuquqLab

**Huquqingni bil. Kelajagingni himoya qil.**

HuquqLab — O‘zbekiston maktab o‘quvchilari (7–11-sinf) uchun sodda darslar, hayotiy vaziyatlar, interaktiv simulyatorlar va testlar orqali huquqni o‘rgatuvchi platforma.

## Ishga tushirish

```bash
npm install
cp .env.example .env.local   # so‘ng ADMIN_PASSWORD va ADMIN_SESSION_SECRET ni o‘zgartiring
npm run dev        # http://localhost:3100
npm run build      # production build
npm run start      # production server (http://localhost:3100)
npm run check      # kontent, simulyator grafi va XP mantiqini tekshirish
npm run lint
```

## Imkoniyatlar

| Bo‘lim | Manzil | Tavsif |
| --- | --- | --- |
| Bosh sahifa | `/` | Hero, statistika, ommabop mavzular, jonli simulyator preview |
| Mavzular | `/mavzular` | Sinf (7–11), kategoriya, qidiruv, o‘rganilgan/o‘rganilmagan filtri (filtrlar URL’da saqlanadi) |
| Mavzu sahifasi | `/mavzular/[slug]` | Kirish, tushuntirish, tushunchalar, huquqiy asos, misol, vaziyat tahlili, xulosa, test |
| Simulyatorlar | `/simulyatorlar` | «Topilgan hamyon», «Sinf guruhidagi masxara», «Nosoz quloqchin» |
| Testlar | `/testlar` | Mavzu testlari va 10 savollik tasodifiy tezkor test |
| Progress | `/profil` | XP, daraja, nishonlar, haftalik challenge, faollik |
| O‘qituvchi paneli | `/admin` | Mavzu CRUD, test savollari, simulyatorlar tekshiruvi, JSON import/eksport |

## Arxitektura

```
src/
  app/                 Next.js App Router sahifalari
  components/
    providers/         Theme, Toast, Content, Progress (React Context)
    simulator/         Qayta ishlatiladigan SimulatorPlayer
    quiz/              Quiz va TestsHub
    topics/            Katalog, karta, mavzu sahifasi
    admin/             O‘qituvchi paneli
    gamification/      Profil, haftalik challenge
  data/                Demo kontent: mavzular, simulyatorlar, nishonlar
  lib/                 Sof mantiq: progress, gamification, scenario, repository
  types/               Domen type’lari
prisma/schema.prisma   PostgreSQL sxemasi (kelajak uchun)
scripts/check-content.ts
```

### Yangi simulyator qo‘shish

`src/data/simulators.ts` ga yangi `Scenario` obyekti qo‘shing. Har bir qadamda tanlovlar bor; har bir tanlov `points`, `tone`, huquqiy va axloqiy izoh beradi va `nextStepId` (keyingi qadam) yoki `endingId` (yakun) ga ega. Player, ball hisoblash, maksimal ball va mukofotlar avtomatik ishlaydi. `npm run check` grafni tekshiradi.

### Ma’lumotlar bazasiga o‘tish

Hozir kontent `src/data` dan, admin o‘zgarishlari va progress esa `localStorage` dan olinadi. Barcha kontent so‘rovlari `ContentRepository` interfeysi (`src/lib/repository.ts`) orqali o‘tadi:

1. `npm i -D prisma && npm i @prisma/client`, `.env` ga `DATABASE_URL`.
2. `npx prisma migrate dev --name init`.
3. `PrismaContentRepository` (API route orqali) yozib, `contentRepository` ni almashtiring.
4. Progress uchun `ProgressProvider` dagi `readJSON/writeJSON` ni API chaqiruvlariga almashtiring.

UI komponentlari o‘zgarmaydi.

## O‘qituvchi paneliga kirish

`/admin` sahifalari `src/middleware.ts` orqali himoyalangan. Kirmagan foydalanuvchi `/admin/kirish` ga yo‘naltiriladi.

- Parol `.env.local` dagi `ADMIN_PASSWORD` dan olinadi va faqat serverda tekshiriladi (`/api/admin/login`).
- Muvaffaqiyatli kirishda HMAC-SHA256 bilan imzolangan, 8 soat amal qiluvchi `httpOnly` cookie beriladi.
- Parolni o‘zgartirsangiz, barcha eski sessiyalar avtomatik bekor bo‘ladi.
- Bir IP manzildan 15 daqiqada 5 ta noto‘g‘ri urinishdan keyin kirish vaqtincha bloklanadi.
- `.env.local` o‘zgargandan keyin serverni qayta ishga tushiring.

## Huquqiy aniqlik

- Hujjat nomi rasmiy bo‘lsa — **«Rasmiy hujjat»** belgisi.
- Modda raqami, muddat, miqdor yoki yosh chegarasi rasmiy matn bilan solishtirilmagan bo‘lsa — **«Tekshirish talab etiladi»** belgisi.
- Darsda qo‘llashdan oldin [lex.uz](https://lex.uz) orqali tekshiring. Kontent yuridik maslahat emas.

## Demo cheklovlari

- Bitta umumiy o‘qituvchi paroli (foydalanuvchi akkauntlari yo‘q).
- Urinishlar cheklovi server xotirasida — bir nechta server instansiyasida Redis kabi umumiy xotira kerak.
- Admin o‘zgarishlari faqat shu brauzerda saqlanadi.
- Progress qurilmalar o‘rtasida sinxronlanmaydi.
