import type { Metadata } from "next";
import { BookMarked, Info, Layers } from "lucide-react";
import { LawsExplorer } from "@/components/laws/LawsExplorer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { hierarchy, LEX_BASE } from "@/data/documents";

export const metadata: Metadata = {
  title: "Qonunlar",
  description: "Konstitutsiya, kodekslar va o‘quvchilar uchun muhim qonunlar — sodda izoh va lex.uz’dagi rasmiy matnga havola.",
};

const structure = [
  { name: "Bo‘lim", example: "Ikkinchi bo‘lim. Inson va fuqaroning asosiy huquqlari…" },
  { name: "Bob", example: "Bir mavzudagi moddalar to‘plami" },
  { name: "Modda", example: "«17-modda» — asosiy qoida" },
  { name: "Qism / band", example: "Moddaning xatboshi yoki raqamlangan bandi" },
];

export default function LawsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Qonunlar"
        title="Sening huquqlaring qayerda yozilgan?"
        description="Konstitutsiya, kodekslar va o‘quvchilar uchun eng muhim qonunlar — sodda izoh, bog‘liq mavzular va lex.uz’dagi rasmiy matnga havola."
      />
      <div className="container-page grid gap-10 pb-16 lg:grid-cols-[1fr_320px]">
        <LawsExplorer />

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900 dark:text-white">
              <Layers className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Hujjatlar ierarxiyasi
            </h2>
            <p className="mt-1 text-sm text-navy-500 dark:text-navy-400">Yuqoridagi hujjat kuchliroq — pastdagisi unga zid bo‘lolmaydi.</p>
            <ol className="mt-4 space-y-2">
              {hierarchy.map((h, i) => (
                <li key={h.level} className="flex gap-3" style={{ paddingLeft: `${i * 8}px` }}>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white dark:bg-brand-500">{i + 1}</span>
                  <div>
                    <p className="text-sm font-semibold text-navy-900 dark:text-white">{h.level}</p>
                    <p className="text-xs text-navy-500 dark:text-navy-400">{h.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-5">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy-900 dark:text-white">
              <BookMarked className="h-5 w-5 text-brand-600 dark:text-brand-400" /> Qonun qanday o‘qiladi?
            </h2>
            <dl className="mt-4 space-y-3">
              {structure.map((s) => (
                <div key={s.name} className="border-l-2 border-brand-500/40 pl-3">
                  <dt className="text-sm font-semibold text-navy-900 dark:text-white">{s.name}</dt>
                  <dd className="text-xs text-navy-500 dark:text-navy-400">{s.example}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-navy-500 dark:text-navy-400">
              Maslahat: har doim hujjatning <b>amaldagi tahriri</b>dan foydalaning va kuchga kirgan sanasiga e’tibor bering.
            </p>
            <ButtonLink href="/lugat" variant="secondary" size="sm" className="mt-4 w-full">
              Huquqiy lug‘at
            </ButtonLink>
          </section>

          <div className="flex gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900 dark:border-sky-400/20 dark:bg-sky-400/[0.06] dark:text-sky-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              HuquqLab rasmiy manba emas. Hujjatlarning to‘liq va amaldagi matni —{" "}
              <a href={LEX_BASE} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                lex.uz
              </a>{" "}
              (Qonunchilik ma’lumotlari milliy bazasi).
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
