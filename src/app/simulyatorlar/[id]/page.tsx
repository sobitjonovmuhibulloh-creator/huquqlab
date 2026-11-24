import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { SimulatorPlayer } from "@/components/simulator/SimulatorPlayer";
import { Pill } from "@/components/ui/misc";
import { scenarioById, scenarios } from "@/data/simulators";

export const dynamicParams = false;

export function generateStaticParams() {
  return scenarios.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const s = scenarioById(id);
  return s ? { title: `Simulyator: ${s.title}`, description: s.description } : { title: "Simulyator" };
}

export default async function SimulatorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scenario = scenarioById(id);
  if (!scenario) notFound();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-brand-500/10 to-transparent" />
      <div className="relative mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <Link href="/simulyatorlar" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-500 hover:text-brand-600 dark:text-navy-400">
          <ArrowLeft className="h-4 w-4" /> Simulyatorlar
        </Link>
        <div className="mt-5 mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{scenario.emoji}</span>
            <h1 className="text-3xl font-extrabold text-navy-900 sm:text-4xl dark:text-white">{scenario.title}</h1>
          </div>
          <p className="mt-3 text-navy-600 dark:text-navy-300">{scenario.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Pill>
              <Clock className="h-3 w-3" /> ~{scenario.durationMinutes} daqiqa
            </Pill>
            <Pill>{scenario.grades.join(", ")}-sinflar</Pill>
          </div>
        </div>
        <SimulatorPlayer scenario={scenario} />
      </div>
    </div>
  );
}
