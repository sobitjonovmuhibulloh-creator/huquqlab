import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Gamepad2,
  GraduationCap,
  ListChecks,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { WeeklyChallengeCard } from "@/components/gamification/WeeklyChallengeCard";
import { HeroVisual } from "@/components/home/HeroVisual";
import { SimulatorPreview } from "@/components/home/SimulatorPreview";
import { TopicCard } from "@/components/topics/TopicCard";
import { ButtonLink } from "@/components/ui/Button";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { categories } from "@/data/categories";
import { badges } from "@/data/gamification";
import { scenarios } from "@/data/simulators";
import { topics } from "@/data/topics";
import { GRADES } from "@/types";

const stats = [
  { value: topics.length, label: "huquqiy mavzu", icon: BookOpenCheck },
  { value: scenarios.length, label: "interaktiv simulyator", icon: Gamepad2 },
  { value: topics.reduce((n, t) => n + t.quiz.length, 0), label: "test savoli", icon: ListChecks },
  { value: GRADES.length, label: "sinf (7–11)", icon: GraduationCap },
];

const features = [
  { icon: BookOpenCheck, title: "Sodda darslar", text: "Murakkab qonunlar o‘quvchi tilida: tushuntirish, misol va xulosa.", color: "bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300" },
  { icon: Gamepad2, title: "Huquqiy simulyatorlar", text: "Real vaziyatda qaror qabul qil va oqibatini ko‘r.", color: "bg-brand-100 text-brand-600 dark:bg-brand-400/15 dark:text-brand-300" },
  { icon: ListChecks, title: "Testlar va feedback", text: "Har bir javobdan keyin izoh — xatodan o‘rgan.", color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300" },
  { icon: Trophy, title: "XP va nishonlar", text: "O‘rgan, ball to‘pla, nishonlar va haftalik challenge'larni yut.", color: "bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300" },
];

export default function HomePage() {
  const popular = topics.filter((t) => t.popular).slice(0, 6);
  const wallet = scenarios[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="container-page relative grid items-center gap-16 pt-12 pb-20 sm:pt-20 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
          <div>
            <p className="eyebrow animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" /> O‘zbekiston maktab o‘quvchilari uchun
            </p>
            <h1 className="mt-6 text-5xl leading-[1.05] font-extrabold text-navy-900 animate-fade-up [animation-delay:60ms] sm:text-6xl lg:text-7xl dark:text-white">
              Huquqingni bil.{" "}
              <span className="text-brand-700 dark:text-brand-400">
                Kelajagingni himoya qil.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-600 animate-fade-up [animation-delay:120ms] dark:text-navy-300">
              HuquqLab — huquqni quruq matn orqali emas, sodda darslar, hayotiy vaziyatlar, interaktiv simulyatorlar va testlar orqali
              o‘rgatuvchi platforma. 7–11-sinf o‘quvchilari uchun, o‘zbek tilida va bepul.
            </p>
            <div className="mt-8 flex flex-col gap-3 animate-fade-up [animation-delay:180ms] sm:flex-row">
              <ButtonLink href="/mavzular" size="lg">
                O‘rganishni boshlash <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href={`/simulyatorlar/${wallet.id}`} variant="secondary" size="lg">
                <Gamepad2 className="h-5 w-5" /> Simulyatorni sinash
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy-600 animate-fade-up [animation-delay:240ms] dark:text-navy-400">
              {["Ro‘yxatdan o‘tishsiz", "Progress saqlanadi", "Telefonda qulay"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-fade-up [animation-delay:200ms]">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* STATISTIKA */}
      <section className="container-page">
        <div className="card grid grid-cols-2 divide-navy-200/70 p-2 sm:p-4 lg:grid-cols-4 lg:divide-x dark:divide-white/[0.06]">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 p-4">
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600 sm:grid dark:bg-brand-400/10 dark:text-brand-300">
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-display text-3xl font-extrabold text-navy-900 tabular-nums dark:text-white">{s.value}</p>
                <p className="text-sm text-navy-500 dark:text-navy-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OMMABOP MAVZULAR */}
      <section className="container-page mt-24">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Ommabop mavzular</p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">Eng ko‘p kerak bo‘ladigan bilimlar</h2>
            <p className="mt-2 max-w-xl text-navy-600 dark:text-navy-400">Maktab va kundalik hayotda har kuni duch keladigan huquqiy vaziyatlar.</p>
          </div>
          <Link href="/mavzular" className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:gap-2.5 transition-all dark:text-brand-400">
            Barcha mavzular <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((t, i) => (
            <TopicCard key={t.id} topic={t} index={i} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/mavzular?kategoriya=${c.id}`}
              className="flex items-center gap-2 rounded-full border border-navy-200 bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium text-navy-700 transition hover:-translate-y-0.5 hover:border-navy-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03] dark:text-navy-300"
            >
              <CategoryIcon categoryId={c.id} size="sm" className="h-7 w-7 rounded-full" />
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* SIMULYATOR PREVIEW */}
      <section className="mt-24 bg-gradient-to-b from-transparent via-brand-50/70 to-transparent py-16 dark:via-brand-500/[0.04]">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow">
              <Gamepad2 className="h-3.5 w-3.5" /> Interaktiv simulyator
            </p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">Qonunni o‘qib emas, qaror qabul qilib o‘rgan</h2>
            <p className="mt-4 text-lg text-navy-600 dark:text-navy-300">
              Har bir simulyator — maktab hayotidagi real vaziyat. Sen tanlov qilasan, voqea rivojlanadi va har bir qaror uchun huquqiy
              hamda axloqiy izoh olasan. Hoziroq sinab ko‘r — variantlardan birini tanla.
            </p>
            <ul className="mt-6 space-y-3">
              {scenarios.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/simulyatorlar/${s.id}`}
                    className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-white dark:hover:bg-white/5"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl shadow-sm dark:bg-white/10">{s.emoji}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-navy-900 dark:text-white">{s.title}</span>
                      <span className="block text-sm text-navy-500 dark:text-navy-400">{s.tagline}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-navy-400 transition group-hover:translate-x-1 group-hover:text-brand-600" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <SimulatorPreview scenario={wallet} />
        </div>
      </section>

      {/* QANDAY ISHLAYDI */}
      <section className="container-page mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Platforma imkoniyatlari</p>
          <h2 className="mt-3 text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">O‘rganish — qiziqarli, bilim — mustahkam</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-xs font-bold text-navy-400">0{i + 1}</p>
              <h3 className="mt-1 text-lg font-bold text-navy-900 dark:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GAMIFICATION */}
      <section className="container-page mt-24 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <WeeklyChallengeCard />
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-navy-900 dark:text-white">Yutib olish mumkin bo‘lgan nishonlar</h3>
            <Link href="/profil" className="text-sm font-semibold text-brand-600 dark:text-brand-400">
              Progressim →
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {badges.map((b) => (
              <div key={b.id} title={b.description} className="flex flex-col items-center rounded-2xl bg-navy-50 p-3 text-center transition hover:scale-105 dark:bg-white/[0.03]">
                <span className="text-3xl">{b.emoji}</span>
                <span className="mt-1.5 text-[11px] leading-tight font-semibold text-navy-600 dark:text-navy-300">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HUQUQIY ANIQLIK */}
      <section className="container-page mt-24">
        <div className="card grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto]">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
            <ShieldCheck className="h-8 w-8" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-navy-900 dark:text-white">Ishonchli manbalarga asoslangan</h2>
            <p className="mt-2 text-navy-600 dark:text-navy-400">
              Kontent O‘zbekiston qonunchiligiga tayanadi. Biz qonun va moddalarni uydirmaymiz: rasmiy manba bilan solishtirilmagan har bir
              tafsilot «Tekshirish talab etiladi» deb ochiq belgilanadi.
            </p>
          </div>
          <ButtonLink href="/haqida" variant="secondary">
            Batafsil
          </ButtonLink>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-navy-900 px-6 py-14 text-center text-white shadow-2xl shadow-navy-900/25 dark:bg-navy-800/60 dark:ring-1 dark:ring-white/10 sm:px-12">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-20 [mask-image:radial-gradient(circle,black,transparent_70%)]" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">Birinchi mavzuni 10 daqiqada o‘rgan va ilk nishoningni ol</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Ro‘yxatdan o‘tish shart emas — progressing shu qurilmada saqlanadi.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/mavzular" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-brand-400 px-7 font-bold text-navy-950 transition hover:bg-brand-300">
                O‘rganishni boshlash <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/testlar" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border border-white/30 px-7 font-bold text-white transition hover:bg-white/10">
                Tezkor test
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
