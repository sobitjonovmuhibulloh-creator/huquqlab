# HuquqLab — Claude uchun eslatma

Foydalanuvchi o‘zbek tilida yozadi — javoblar ham o‘zbek tilida.

## Ish qayerda to‘xtagan

Avval **`docs/HANDOFF.md`** ni o‘qing: unda tugallangan ishlar, ishga tushirish tartibi va tugallanmagan vazifa bor. Tugallanmagan vazifa — 4 ta milliy sertifikat PDF’idagi 180 ta savolga lex.uz bo‘yicha javob topish.

Foydalanuvchi «davom et» desa — shu vazifadan davom eting.

## Qoidalar

- **Ishga tushirish:** `LOCAL_DB=pglite npm run dev`. Tekshiruvlar: `npm run check`, `npm run check:db`.
- **Repo ochiq (public).** Kitob, PDF savollari va `.data/` papkasini hech qachon commit qilmang. `.data` `.gitignore` va `.vercelignore` da bor.
- **Huquqiy faktlar:** modda raqami, muddat va javobni taxmin qilmang. lex.uz rasmiy matni bilan tekshiring. Ishonch past bo‘lsa — «tekshirish talab etiladi» deb belgilang.
- **Yuklangan to‘plamlar** qoralama (draft) bo‘lib turadi. Mualliflik ruxsati tasdiqlanmaguncha internetdagi saytga chiqarilmaydi.
- **Rendering:** `Intl uz-UZ` va `localeCompare("uz")` ishlatmang (hydration xatosi).
- **Arxitektura:** `docs/ARCHITECTURE.md`. Baza va import: `docs/DATABASE.md`.
