import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { TestsHub } from "@/components/quiz/TestsHub";

export const metadata: Metadata = {
  title: "Testlar",
  description: "Huquqiy mavzular bo‘yicha testlar: darhol feedback, ball va natijalar.",
};

export default function TestsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Test tizimi"
        title="Bilimingni sinab ko‘r"
        description="Har bir savolda 4 ta variant, har bir javobdan keyin izoh. Eng yaxshi natijang saqlanadi va XP olib keladi."
      />
      <div className="container-page">
        <TestsHub />
      </div>
    </>
  );
}
