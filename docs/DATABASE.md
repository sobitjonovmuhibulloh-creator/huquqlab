# Testlar bazasi (Supabase) va bulk import

**Holat (2026-11-26):** kod va migratsiyalar tayyor va tekshirilgan, lekin **Supabase loyihasi hali ulanmagan**. Baza ulanmaguncha:

- sayt kod ichidagi testlar bilan ishlaydi (`src/server/questions`);
- admin «Import» faylni tekshiradi va preview ko‘rsatadi, lekin **bazaga yozmaydi** — tasdiqlash tugmasi o‘chiq va bu haqda aniq xabar chiqadi;
- «Testlar bazasi» va «Savollar banki» bo‘limlari «baza ulanmagan» holatini ko‘rsatadi.

---

## 0. Lokal rejim (development, Supabase’siz)

`LOCAL_DB=pglite npm run dev` — server Supabase o‘rniga **lokal PostgreSQL** (PGlite, WASM) bilan ishlaydi:

- baza `.data/pglite` papkasida turadi. `.data` `.gitignore`da ham, `.vercelignore`da ham bor, ya’ni git’ga ham, deploy’ga ham tushmaydi;
- `supabase/migrations` dagi aynan o‘sha SQL avtomatik qo‘llanadi (`_local_migrations` jadvali), shuning uchun cheklovlar, triggerlar va `import_tests()` Supabase bilan bir xil ishlaydi;
- bitta papkani ikki jarayon ochmasligi uchun `.data/pglite.lock` ishlatiladi;
- production’da (`NODE_ENV=production`) bu rejim o‘chiq.

Kod `TestStore` interfeysi orqali ishlaydi (`src/server/store`): `supabase.ts` (REST) va `local.ts` (PGlite). Qaysi biri tanlanishi `storeKind()`da belgilanadi.

## 1. Ulash (bir marta)

1. [supabase.com](https://supabase.com) da loyiha yarating (region: Frankfurt yoki eng yaqini).
2. **SQL Editor** → `supabase/migrations/` dagi fayllarni nom tartibida ishga tushiring:
   1. `20261126120000_tests_schema.sql` — jadvallar, triggerlar, RLS, `import_tests()`, `find_duplicate_questions()`
   2. `20261126130000_admin_functions.sql` — `update_question()`

   Supabase CLI bilan: `supabase link --project-ref <ref>` → `supabase db push`.
3. **Project Settings → API** dan oling:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` kaliti → `SUPABASE_SERVICE_ROLE_KEY`
4. Kalitlarni **faqat server env’iga** yozing:
   - lokal: `.env.local` (git’ga tushmaydi);
   - production: Vercel → Project → Settings → Environment Variables.

   `NEXT_PUBLIC_` prefiksi **qo‘yilmaydi**: service_role RLS’ni chetlab o‘tadi, brauzerga chiqsa butun baza ochiladi. `anon` kalit loyihada umuman ishlatilmaydi.
5. Serverni qayta ishga tushiring. Admin → «Import» bo‘limidagi sariq ogohlantirish yo‘qolishi kerak.

---

## 2. Sxema

| Jadval | Vazifasi |
| --- | --- |
| `tests` | Test: nom (unikal, registrsiz), kategoriya, `exam_type`, auditoriya, davomiylik, narx (`NULL` = standart), `is_premium`, `status` (`draft` / `published` / `archived`), qiyinlik, muallif |
| `questions` | Savol: matn, tur (`Y-1` / `Y-2` / `O`), mavzu (spetsifikatsiya kodi yoki erkin), izoh, manba (nom, URL, modda, tahrir sanasi), tartib, `normalized_text` |
| `question_options` | Variantlar `A–D` (`is_correct`). Ochiq savolda qabul qilinadigan javoblar `O1`, `O2`… |
| `test_attempts` | Urinish: foydalanuvchi, test, vaqt, ball, holat |
| `attempt_answers` | Har bir javob: tanlangan variant yoki matn, to‘g‘rimi |
| `import_batches` | Import tarixi: fayl, format, natija, ogohlantirishlar |

Ma’lumotlar yaxlitligi bazada ta’minlanadi:

- `question_count` trigger orqali doim haqiqiy songa teng;
- savolsiz test e’lon qilinmaydi;
- bepul testga narx qo‘yib bo‘lmaydi;
- bir testda bir xil savol ikki marta bo‘lmaydi (unikal indeks);
- yopiq savolda aynan bitta to‘g‘ri javob bo‘ladi.

## 3. Xavfsizlik

| Qatlam | Qoida |
| --- | --- |
| RLS | `anon`/`authenticated` faqat `status = 'published'` testlar meta-ma’lumotini o‘qiydi. `questions`, `question_options` (javob kaliti), `import_batches` — ular uchun siyosat yo‘q va huquqlar `REVOKE` qilingan |
| Urinishlar | `authenticated` faqat `user_id = auth.uid()` bo‘lgan o‘z urinishlarini ko‘radi (akkauntlar ulanganda) |
| Funksiyalar | `import_tests`, `update_question`, `find_duplicate_questions` — faqat `service_role` |
| Server | Barcha so‘rovlar Next.js route’lari orqali. Admin route’lari sessiyani tekshiradi (`src/server/admin.ts`), cookie’siz 401 |
| Premium | Savollar `/api/exams/[id]/start`da access tekshirilgach **javobsiz** beriladi (`toPublic`). Javob kaliti faqat `/submit`dan keyin natija ichida qaytadi |
| To‘lov | Access faqat `order.status === "paid"` bo‘lganda (`docs/ARCHITECTURE.md` §2.4) |

`npm run check:db` bularning barchasini haqiqiy PostgreSQL’da (PGlite) tekshiradi: anon savollarni ham, `is_correct`ni ham o‘qiy olmasligi, funksiyalarni chaqira olmasligi va boshqalar.

## 4. Import formati

Shablonlar: `public/templates/huquqlab-test-import.xlsx` va `.csv` (admin → Import → «Excel shablon»).

| Ustun | Majburiy | Izoh |
| --- | --- | --- |
| `test_title` | ha | Bir xil nomli qatorlar bitta testga birlashadi. Nom bazada yoki kodda band bo‘lsa — xato (import faqat yangi test yaratadi) |
| `test_author` | yo‘q | Muallif yoki to‘plam. Bo‘sh bo‘lsa — «HuquqLab tahririyati» |
| `test_category` | testda bir marta | `milliy-sertifikat`, `attestatsiya`, `mavzulashtirilgan`, `konstitutsiya`, `kodekslar`, `otm`, `oqituvchilar`, `talabalar` (yoki ularning o‘zbekcha nomi) |
| `test_description` | yo‘q | |
| `duration_minutes` | testda bir marta | 1–300 |
| `price` | yo‘q | So‘mda, butun son. Bo‘sh — standart narx. «45 000» ham qabul qilinadi |
| `is_premium` | yo‘q | ha/yo‘q, true/false, 1/0. Bo‘sh bo‘lsa: narx > 0 → premium |
| `question_text` | ha | |
| `question_type` | yo‘q | `Y-1` (standart), `Y-2`, `O` |
| `option_a` … `option_d` | yopiq savolda | Barchasi to‘ldirilgan va har xil bo‘lishi shart |
| `correct_answer` | ha | Yopiq savolda: `A`–`D`. Ochiq savolda: javob, bir nechta variant `|` bilan (`150|bir yuz ellik`) |
| `explanation`, `topic`, `difficulty`, `source_title`, `source_url`, `legal_article` | yo‘q | `difficulty`: oson / o‘rta / murakkab. `topic` sifatida spetsifikatsiya kodi (`2.4`) yozilsa, natijada rasmiy bo‘lim nomi chiqadi |
| `exam_type`, `grade_or_audience` | yo‘q | `mock` / `topic` / `practice` / `attestation`; auditoriya vergul bilan: `abituriyent, oqituvchi` |

Test darajasidagi ustunlarni (kategoriya, davomiylik, narx…) testning bitta qatorida yozish yetarli. Boshqa qatorda boshqa qiymat yozilsa, bu xato hisoblanadi.

## 4.1 Moslashtirish (admin → Import)

- **Ustun nomlari** o‘zbek, rus yoki ingliz tilida bo‘lishi mumkin (`Savol` / `Вопрос` / `Question`, `To‘g‘ri javob` / `Правильный ответ` / `Correct` …) — avtomatik aniqlanadi, har bir ustunni qo‘lda ham tanlash mumkin.
- **Bir nechta varaq** (.xlsx): «Test nomi» ustuni bo‘lmasa, har bir varaq nomi — test nomi.
- **Standart qiymatlar**: faylda kategoriya, vaqt, narx, premium/bepul, test turi yoki muallif bo‘lmasa — import sozlamalarida tanlanadi.
- **Xatoli qatorni tahrirlash**: xatolar jadvalidagi «Tahrirlash» → qator maydonlari → «Saqlash va qayta tekshirish» (asl fayl o‘zgarmaydi).
- **Hisobot**: jami qatorlar, yaroqli/xatoli savollar, takroriylar, testlar soni, importga tayyorligi.

## 5. Import jarayoni

1. **Fayl** (≤ 5 MB, ≤ 5000 qator) → `POST /api/admin/import` (`action=preview`).
2. **Format** fayl mazmunidan aniqlanadi (ZIP → xlsx; eski `.xls` aniq xabar bilan rad etiladi). CSV faqat UTF-8 bo‘lishi kerak: boshqa kodirovka — «kodirovka xatosi». Ajratuvchi `,` `;` yoki tab avtomatik aniqlanadi.
3. **Validatsiya** har bir xatoni fayldagi qator raqami va ustuni bilan qaytaradi. Tekshiriladi:
   - test nomi, savol matni, variantlar, to‘g‘ri javob;
   - narx, davomiylik, kategoriya, savol turi, qiyinlik, URL;
   - test maydonlari qatorlar orasida ziddiyatli emasligi;
   - takroriy savol (`normalized_text`: registr, apostrof va tinish belgilari hisobga olinmaydi): **bitta test ichida — xato**; boshqa testda, bazada yoki kod ichida ham uchrasa — ogohlantirish (variantli to‘plamlarda bir savol bir necha variantda bo‘lishi odatiy);
   - bo‘sh qatorlar (ogohlantirish sifatida).
4. **Preview**: testlar, savollar, variantlar, to‘g‘ri javob, izoh, mavzu va manba. Xatolar hisobotini CSV qilib yuklab olish mumkin.
5. **Tasdiqlash** (`action=commit`) — fayl serverda **qayta tekshiriladi**. Xato bo‘lsa, hech narsa yozilmaydi.
6. **`import_tests()`** bitta tranzaksiyada ishlaydi: istalgan xato (masalan, shu orada nom band bo‘lib qolgan bo‘lsa) butun importni bekor qiladi, oldingi ma’lumotlar o‘zgarmaydi.
7. Yangi testlar **`draft`** holatida yaratiladi. Admin «Testlar bazasi»da tekshirib, «E’lon qilish»ni bosadi.
8. **Natija**: yaratilgan testlar, savollar, vaqt, ogohlantirishlar. Import tarixi `import_batches`da saqlanadi.

## 6. Tekshiruvlar

```bash
npm run check      # kontent, imtihon, to'lov xavfsizligi + import (parser, validatsiya, xlsx, server oqimi)
npm run check:db   # migratsiyalar PostgreSQL'da: atomar import, triggerlar, RLS, huquqlar, update_question
npm run templates  # import shablonlarini qayta yaratish
```

## 7. Hali qilinmagan (ochiq aytilgan)

- Supabase loyihasi va kalitlari — foydalanuvchidan kutilmoqda.
- Mavjud testga import orqali savol **qo‘shish** — hozircha faqat yangi test yaratiladi. Mavjud testni admin paneldagi tahrirlash orqali o‘zgartirish mumkin.
- Kod ichidagi 4 ta testni bazaga ko‘chirish — baza ulangach, shablon orqali eksport/import yoki alohida skript bilan.
- Akkauntlar (Supabase Auth): `test_attempts.user_id` hozir anonim access cookie `uid`.
- Mavzu darslari (`src/data/topics.ts`) hali localStorage’da — keyingi bosqich.
