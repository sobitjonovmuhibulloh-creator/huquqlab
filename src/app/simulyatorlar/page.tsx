import type { Metadata } from "next";
import { Brain, GitBranch, Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SimulatorCard } from "@/components/simulator/SimulatorCard";
import { scenarios } from "@/data/simulators";

export const metadata: Metadata = {
  title: "Huquqiy simulyatorlar",
  description: "Maktab hayotidagi real vaziyatlarda qaror qabul qil va uning huquqiy oqibatlarini ko‘r.",
};

const how = [
  { icon: Brain, title: "Vaziyatni o‘qi", text: "Har bir simulyator maktab hayotidagi real holatga asoslangan." },
  { icon: GitBranch, title: "Qaror qabul qil", text: "Har bir tanlov voqealar rivojini va ballingni o‘zgartiradi." },
  { icon: Scale, title: "Oqibatni tushun", text: "Har bir qaror uchun huquqiy va axloqiy izoh olasan." },
];

export default function SimulatorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Interaktiv simulyatorlar"
        title="Qaror sening qo‘lingda"
        description="Hayotiy vaziyatlarda tanlov qil, natijasini ko‘r va qonun nima deyishini bilib ol. Har bir simulyatorni turli yo‘llar bilan qayta o‘ynash mumkin."
      />
      <div className="container-page">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((s, i) => (
            <SimulatorCard key={s.id} scenario={s} index={i} />
          ))}
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {how.map((h) => (
            <div key={h.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-brand-300">
                <h.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-navy-900 dark:text-white">{h.title}</h3>
              <p className="mt-1 text-sm text-navy-600 dark:text-navy-400">{h.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
