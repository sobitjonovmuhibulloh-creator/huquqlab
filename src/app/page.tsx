import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  ClipboardCheck,
  FileSearch,
  Gamepad2,
  GraduationCap,
  Landmark,
  LineChart,
  ListChecks,
  RotateCcw,
  Scale,
  School,
  Timer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { ExamCard } from "@/components/exam/ExamCard";
import { ExamPreviewVisual } from "@/components/home/ExamPreviewVisual";
import { PricingTeaser } from "@/components/home/PricingTeaser";
import { SimulatorPreview } from "@/components/home/SimulatorPreview";
import { ButtonLink } from "@/components/ui/Button";
import { documents } from "@/data/documents";
import { exams, NATIONAL_FORMAT } from "@/data/exams";
import { scenarios } from "@/data/simulators";
import { topics } from "@/data/topics";
import { cn } from "@/lib/utils";
import { questionBank } from "@/server/questions";

/** Faqat haqiqiy ma'lumotlardan hisoblangan statistika — demo raqamlar yo'q */
const readyExams = exams.filter((e) => e.status === "available");
const stats = [
  { value: readyExams.length, label: "tayyor test" },
  { value: Object.values(questionBank).reduce((n, q) => n + q.length, 0), label: "izohli savol bazada" },
  { value: topics.length, label: "interaktiv mavzu" },
  { value: documents.length, label: "asosiy huquqiy hujjat" },
];

const capabilities: { icon: LucideIcon; title: string; text: string; href: string; status?: string }[] = [
  {
    icon: ClipboardCheck,
    title: "Milliy sertifikat",
    text: `Rasmiy format: ${NATIONAL_FORMAT.total} topshiriq (Y-1, Y-2, O), ${NATIONAL_FORMAT.durationMinutes} daqiqa, taymer va avtomatik topshirish.`,
    href: "/testlar/milliy-mock-1",
  },
  { icon: Landmark, title: "Mavzulashtirilgan testlar", text: "Davlat va huquq nazariyasi, Konstitutsiya — bo‘lim bo‘yicha chuqur tayyorgarlik.", href: "/testlar" },
  { icon: Briefcase, title: "Attestatsiya", text: "Huquq o‘qituvchilari uchun attestatsiya variantlari.", href: "/testlar/attestatsiya-huquq-1", status: "Tayyorlanmoqda" },
  { icon: Users, title: "O‘qituvchilar uchun", text: "Sinf natijalari paneli va dars materiallari.", href: "/haqida", status: "Rejada" },
];

const personas: { icon: LucideIcon; who: string; need: string; path: { label: string; href: string }[] }[] = [
  {
    icon: GraduationCap,
    who: "Abituriyent",
    need: "Milliy sertifikatga real formatda tayyorlanish",
    path: [
      { label: "Bepul diagnostika", href: "/testlar/diagnostika" },
      { label: "Mock test", href: "/testlar/milliy-mock-1" },
    ],
  },
  {
    icon: Briefcase,
    who: "Maktab o‘qituvchisi",
    need: "Attestatsiyaga tayyorgarlik va dars uchun manbalar",
    path: [
      { label: "Qonunlar", href: "/qonunlar" },
      { label: "Konstitutsiya testi", href: "/testlar/konstitutsiya-1" },
    ],
  },
  {
    icon: Users,
    who: "Repetitor",
    need: "O‘quvchilarga tayyor format va xatolar tahlili",
    path: [
      { label: "Test katalogi", href: "/testlar" },
      { label: "Paketlar", href: "/testlar#paketlar" },
    ],
  },
  {
    icon: Scale,
    who: "Yuridik talaba",
    need: "Nazariya va qonunchilikni tez takrorlash",
    path: [
      { label: "Nazariya testi", href: "/testlar/nazariya-1" },
      { label: "Huquqiy lug‘at", href: "/lugat" },
    ],
  },
  {
    icon: School,
    who: "Maktab o‘quvchisi",
    need: "Huquqni sodda tilda va hayotiy misollarda tushunish",
    path: [
      { label: "Mavzular", href: "/mavzular" },
      { label: "Simulyatorlar", href: "/simulyatorlar" },
    ],
  },
];

const steps: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: FileSearch, title: "Diagnostika", text: "15 daqiqalik bepul test zaif bo‘limlarni ko‘rsatadi." },
  { icon: Timer, title: "Imtihon rejimi", text: "Taymer, savollar navigatsiyasi, belgilash va avtomatik saqlash." },
  { icon: LineChart, title: "Batafsil tahlil", text: "Topshiriq turi va spetsifikatsiya bo‘limlari bo‘yicha natija." },
  { icon: RotateCcw, title: "Smart Review", text: "Barcha xatolar bir joyda — o‘zlashtirguningizcha mashq." },
];

const faqs: [string, string][] = [
  ["HuquqLab bepulmi?", "Diagnostik test, mavzu darslari va testlari, simulyatorlar, qonunlar katalogi va lug‘at — bepul. Premium testlar alohida sotib olinadi; oylik obuna majburiy emas."],
  ["Sotib olingan test qancha vaqt ochiq turadi?", "Doimiy. Testni xohlagancha qayta topshirishingiz mumkin — har bir urinish uchun alohida to‘lov yo‘q."],
  ["Natija rasmiy milliy sertifikat bali bo‘ladimi?", "Yo‘q. Rasmiy ball Rash modeli bilan hisoblanadi. HuquqLab to‘g‘ri javoblar soni, foiz va bo‘limlar bo‘yicha tahlilni ko‘rsatadi — tayyorgarlik darajangizni baholash uchun."],
  ["Qanday to‘lash mumkin?", "Onlayn to‘lov (Click/Payme) ulanish bosqichida. To‘lov tizimi tasdiqlamaguncha hech qanday test «sotib olingan» deb ochilmaydi."],
  ["Natijalarim qayerda saqlanadi?", "Hozircha shu brauzerda. Akkaunt tizimi qo‘shilgach, natijalar barcha qurilmalaringizda ko‘rinadi."],
  ["Savollar qayerdan olinadi?", "Rasmiy spetsifikatsiya (Bilimni baholash agentligi) va amaldagi qonunchilik asosida. Har bir savolga izoh va manba beriladi; lex.uz havolalari tekshirilgan."],
];

export default function HomePage() {
  const featured = exams.filter((e) => e.status === "available");
  const wallet = scenarios[0];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[60rem] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="container-page relative grid items-center gap-12 pt-10 pb-14 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-16">
          <div>
            <p className="eyebrow animate-fade-up">Huquq fanidan imtihonga tayyorgarlik platformasi</p>
            <h1 className="mt-5 text-4xl leading-[1.1] font-extrabold text-navy-900 animate-fade-up [animation-delay:60ms] sm:text-5xl dark:text-white">
              Huquqni bil. <span className="text-brand-700 dark:text-brand-400">Imtihonga ishonch bilan tayyorlan.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-600 animate-fade-up [animation-delay:120ms] dark:text-navy-300">
              HuquqLab — huquq fanini o‘rganish, milliy sertifikat formatida test topshirish va natijangizni bo‘limma-bo‘lim tahlil qilish uchun yagona
              platforma. Har bir savolga izoh va rasmiy manba.
            </p>
            <div className="mt-8 flex flex-col gap-3 animate-fade-up [animation-delay:180ms] sm:flex-row">
              <ButtonLink href="/testlar/diagnostika" size="lg">
                Bepul testni boshlash <ArrowRight className="h-5 w-5" />
              </ButtonLink>
              <ButtonLink href="/testlar" variant="secondary" size="lg">
                Premium testlar
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy-600 animate-fade-up [animation-delay:240ms] dark:text-navy-400">
              {["Rasmiy spetsifikatsiya formati", "Ro‘yxatdan o‘tishsiz boshlash", "Telefonda qulay"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-fade-up [animation-delay:200ms]">
            <ExamPreviewVisual />
          </div>
        </div>
      </section>

      {/* STATISTIKA — faqat real ma'lumot */}
      <section className="container-page">
        <dl className="card grid grid-cols-2 divide-navy-100 sm:grid-cols-4 sm:divide-x dark:divide-white/[0.06]">
          {stats.map((s) => (
            <div key={s.label} className="px-6 py-6 text-center">
              <dt className="order-2 text-sm text-navy-500 dark:text-navy-400">{s.label}</dt>
              <dd className="font-display text-3xl font-extrabold text-navy-900 dark:text-white">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* IMKONIYATLAR */}
      <section className="container-page mt-20">
        <SectionTitle eyebrow="Imkoniyatlar" title="Imtihonga tayyorgarlikning barcha bosqichi bir joyda" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((c) => (
            <Link key={c.title} href={c.href} className="card group flex flex-col p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                  <c.icon className="h-5 w-5" />
                </span>
                {c.status && <span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-600 dark:bg-white/10 dark:text-navy-300">{c.status}</span>}
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-navy-900 dark:text-white">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{c.text}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* QANDAY ISHLAYDI */}
      <section className="mt-20 border-y border-navy-200/70 bg-white/60 py-16 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="container-page">
          <SectionTitle eyebrow="Qanday ishlaydi" title="Bilimni o‘lchang, xatoni toping, mustahkamlang" />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <li key={s.title} className="relative">
                <span className="font-display text-sm font-bold text-brand-700 dark:text-brand-400">0{i + 1}</span>
                <div className="mt-2 flex items-center gap-2">
                  <s.icon className="h-5 w-5 text-navy-400" />
                  <h3 className="font-display text-lg font-bold text-navy-900 dark:text-white">{s.title}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-navy-600 dark:text-navy-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TESTLAR */}
      <section className="container-page mt-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle eyebrow="Test Market" title="Tayyor testlar" />
          <ButtonLink href="/testlar" variant="secondary">
            Barcha testlar va paketlar <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((e, i) => (
            <ExamCard key={e.id} exam={e} index={i} ownership={e.access === "free" ? "free" : "locked"} />
          ))}
        </div>
      </section>

      {/* NARXLAR — admin paneldagi joriy narxlar */}
      <section className="container-page mt-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle eyebrow="Narxlar" title="Obunasiz, faqat kerakli testga to‘laysiz" />
          <p className="max-w-sm text-sm text-navy-500 dark:text-navy-400">Sotib olingan test doimiy ochiq qoladi, cheksiz qayta topshirish mumkin. Paketlar — chegirmali.</p>
        </div>
        <div className="mt-8">
          <PricingTeaser />
        </div>
      </section>

      {/* KIMLAR UCHUN */}
      <section className="container-page mt-20">
        <SectionTitle eyebrow="Kimlar uchun" title="Har bir foydalanuvchi uchun o‘z yo‘li" />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {personas.map((p) => (
            <div key={p.who} className="card flex flex-col p-5">
              <p.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              <h3 className="mt-4 font-display font-bold text-navy-900 dark:text-white">{p.who}</h3>
              <p className="mt-1 text-sm text-navy-600 dark:text-navy-400">{p.need}</p>
              <div className="mt-4 flex flex-wrap gap-1.5 pt-1">
                {p.path.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-700 transition hover:bg-brand-600 hover:text-white dark:bg-white/[0.06] dark:text-navy-200"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* O'RGANISH */}
      <section className="container-page mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionTitle eyebrow="O‘rganish" title="Testdan oldin — tushunib oling" />
          <p className="mt-4 max-w-lg text-navy-600 dark:text-navy-300">
            Sodda tildagi darslar, hayotiy vaziyat simulyatorlari, Konstitutsiya va kodekslarga yo‘l ko‘rsatkich hamda huquqiy lug‘at — barchasi bepul.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/mavzular", icon: BookOpenCheck, label: `${topics.length} ta mavzu` },
              { href: "/simulyatorlar", icon: Gamepad2, label: `${scenarios.length} ta simulyator` },
              { href: "/qonunlar", icon: Landmark, label: `${documents.length} ta hujjat` },
              { href: "/lugat", icon: ListChecks, label: "Huquqiy lug‘at" },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="card flex items-center gap-3 p-4 font-semibold text-navy-900 transition hover:border-brand-400 dark:text-white">
                <l.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" /> {l.label}
                <ArrowRight className="ml-auto h-4 w-4 text-navy-400" />
              </Link>
            ))}
          </div>
        </div>
        <SimulatorPreview scenario={wallet} />
      </section>


      {/* FAQ — faqat haqiqiy holat */}
      <section className="container-page mt-20" aria-labelledby="faq">
        <SectionTitle eyebrow="Savollar" title="Ko‘p beriladigan savollar" />
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {faqs.map(([q, a]) => (
            <details key={q} className="card group p-5 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-navy-900 dark:text-white">
                {q}
                <span className="text-navy-400 transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-navy-600 dark:text-navy-300">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-navy-900 px-6 py-12 text-center text-white sm:px-12 dark:bg-navy-800/60 dark:ring-1 dark:ring-white/10">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-10" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Qaysi bo‘limlarni takrorlash kerak?</h2>
          <p className="relative mx-auto mt-3 max-w-xl text-navy-200">15 daqiqalik bepul diagnostik test buni aniq ko‘rsatadi. Ro‘yxatdan o‘tish shart emas.</p>
          <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/testlar/diagnostika" size="lg" className={cn("bg-white text-navy-900 hover:bg-navy-100 dark:bg-white dark:text-navy-950")}>
              Bepul testni boshlash <ArrowRight className="h-5 w-5" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-2xl font-extrabold text-navy-900 sm:text-3xl dark:text-white">{title}</h2>
    </div>
  );
}
