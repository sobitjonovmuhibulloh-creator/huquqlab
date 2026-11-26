import type { Metadata } from "next";
import { GlossaryView } from "@/components/glossary/GlossaryView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Huquqiy lug‘at",
  description: "Huquqiy atamalarning sodda ta’riflari va ular uchraydigan mavzular.",
};

export default function GlossaryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Lug‘at"
        title="Huquqiy atamalar — oddiy tilda"
        description="Qonun matnida yoki darsda tushunarsiz so‘z uchradimi? Bu yerda sodda ta’rifini va u o‘rganiladigan mavzuni topasan."
      />
      <div className="container-page pb-16">
        <GlossaryView />
      </div>
    </>
  );
}
