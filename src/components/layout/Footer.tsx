import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const groups = [
  {
    title: "O‘rganish",
    links: [
      { href: "/mavzular", label: "Barcha mavzular" },
      { href: "/simulyatorlar", label: "Simulyatorlar" },
      { href: "/testlar", label: "Testlar" },
    ],
  },
  {
    title: "Platforma",
    links: [
      { href: "/profil", label: "Mening progressim" },
      { href: "/admin", label: "O‘qituvchi paneli" },
      { href: "/haqida", label: "Loyiha haqida" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200/70 bg-white/60 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            O‘zbekiston maktab o‘quvchilari uchun huquqiy bilimlarni interaktiv tarzda o‘rgatuvchi platforma.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{g.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm text-amber-900 dark:border-amber-400/15 dark:bg-amber-400/5 dark:text-amber-200">
          <p className="font-semibold">Muhim eslatma</p>
          <p className="mt-1 leading-relaxed opacity-90">
            Platforma ta’limiy maqsadda. Rasmiy matnlar uchun{" "}
            <a href="https://lex.uz" target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2">
              lex.uz
            </a>{" "}
            — O‘zbekiston qonunchilik ma’lumotlari milliy bazasiga murojaat qiling.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-200/70 dark:border-white/[0.06]">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row dark:text-slate-500">
          <p>© {new Date().getFullYear()} HuquqLab. Ta’limiy demo loyiha.</p>
          <p>Favqulodda: 101 · 102 · 103</p>
        </div>
      </div>
    </footer>
  );
}
