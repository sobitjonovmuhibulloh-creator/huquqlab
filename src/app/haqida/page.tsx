import type { Metadata } from "next";
import { AlertTriangle, BadgeCheck, Database, ExternalLink, Layers, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { LegalStatusBadge } from "@/components/ui/misc";

export const metadata: Metadata = { title: "Loyiha haqida" };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Loyiha haqida"
        title="HuquqLab — huquqiy savodxonlik laboratoriyasi"
        description="Maqsadimiz — O‘zbekiston maktab o‘quvchilariga o‘z huquq va majburiyatlarini tushunarli, qiziqarli va to‘g‘ri tarzda o‘rgatish."
      />
      <div className="container-page grid gap-6 lg:grid-cols-2">
        <section className="card p-6 sm:p-8 lg:col-span-2">
          <h2 className="flex items-center gap-3 text-2xl font-extrabold text-navy-900 dark:text-white">
            <ShieldCheck className="h-7 w-7 text-emerald-500" /> Huquqiy aniqlik siyosati
          </h2>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-emerald-50 p-5 dark:bg-emerald-400/[0.06]">
              <LegalStatusBadge status="verified" />
              <p className="mt-3 text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                Hujjat (Konstitutsiya, kodeks yoki qonun) O‘zbekiston qonunchilik bazasida mavjud va keltirilgan umumiy mazmun uning asosiy
                qoidalariga mos.
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5 dark:bg-amber-400/[0.06]">
              <LegalStatusBadge status="needs_verification" />
              <p className="mt-3 text-sm leading-relaxed text-navy-700 dark:text-navy-300">
                Aniq modda raqami, muddat, miqdor yoki yosh chegarasi rasmiy matn bilan solishtirilmagan. Bunday ma’lumotlarni darsda
                qo‘llashdan oldin rasmiy manbadan tekshirish kerak.
              </p>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-navy-600 dark:text-navy-400">
            <li className="flex gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Biz qonun va moddalarni uydirmaymiz — noaniq bo‘lsa, ochiq belgilaymiz.
            </li>
            <li className="flex gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Kontent ta’limiy maqsadda va yuridik maslahat o‘rnini bosmaydi.
            </li>
            <li className="flex gap-2">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Konstitutsiyaning 2023-yilgi yangi tahririda modda raqamlari o‘zgargan — iqtibosda ehtiyot bo‘ling.
            </li>
          </ul>
          <a
            href="https://lex.uz"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-700 dark:bg-white dark:text-navy-900"
          >
            lex.uz — rasmiy qonunchilik bazasi <ExternalLink className="h-4 w-4" />
          </a>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-navy-900 dark:text-white">
            <Layers className="h-6 w-6 text-brand-500" /> Arxitektura
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-navy-600 dark:text-navy-400">
            <li>• Next.js (App Router) + TypeScript + Tailwind CSS</li>
            <li>• Kontent: <code>src/data</code> — mavzular, simulyatorlar, nishonlar</li>
            <li>• Simulyatorlar: qayta ishlatiladigan player + qadamlar grafi</li>
            <li>• Progress: React Context + localStorage (versiyalangan, tekshiriladi)</li>
            <li>• Repository qatlami: <code>ContentRepository</code> interfeysi</li>
          </ul>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="flex items-center gap-3 text-xl font-extrabold text-navy-900 dark:text-white">
            <Database className="h-6 w-6 text-brand-500" /> Ma’lumotlar bazasiga tayyor
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-navy-600 dark:text-navy-400">
            <code>prisma/schema.prisma</code> faylida PostgreSQL uchun to‘liq sxema mavjud: foydalanuvchilar, sinflar, mavzular, test savollari,
            simulyatorlar va progress. Bazaga o‘tishda faqat <code>ContentRepository</code> va progress saqlash qatlami almashtiriladi — UI
            komponentlari o‘zgarmaydi.
          </p>
          <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-400/10 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" /> O‘qituvchi paneli parol bilan himoyalangan, lekin kontent o‘zgarishlari hozircha faqat brauzerda saqlanadi.
          </p>
        </section>
      </div>
    </>
  );
}
