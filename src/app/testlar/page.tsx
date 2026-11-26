import type { Metadata } from "next";
import { MarketView } from "@/components/exam/MarketView";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestsHub } from "@/components/quiz/TestsHub";

export const metadata: Metadata = {
  title: "Testlar",
  description: "Milliy sertifikat formatidagi mock testlar, mavzulashtirilgan va Konstitutsiya testlari — taymer, batafsil natija va xatolar tahlili bilan.",
};

export default function TestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Test Market"
        title="Imtihonga real formatda tayyorlaning"
        description="Milliy sertifikat formati (45 topshiriq, 90 daqiqa), mavzulashtirilgan va Konstitutsiya testlari. Bepul diagnostikadan boshlang, keyin premium testlar bilan chuqurlashtiring."
      />
      <div className="container-page space-y-16">
        <MarketView />
        <section aria-labelledby="mavzu-testlari">
          <h2 id="mavzu-testlari" className="text-2xl font-bold text-navy-900 dark:text-white">
            Mavzu testlari <span className="text-base font-medium text-navy-500">· bepul</span>
          </h2>
          <p className="mt-1 mb-6 text-sm text-navy-500 dark:text-navy-400">Har bir darsdan keyin qisqa test: javobdan so‘ng darhol izoh.</p>
          <TestsHub />
        </section>
      </div>
    </>
  );
}
