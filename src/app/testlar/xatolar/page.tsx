import type { Metadata } from "next";
import { SmartReview } from "@/components/exam/SmartReview";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Xatolar ustida ishlash", robots: { index: false } };

export default function SmartReviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Smart Review"
        title="Xatolar ustida ishlash"
        description="Barcha testlardagi xato javoblaringiz bir joyda: bo‘limlar bo‘yicha guruhlangan, takroriy xatolar ajratilgan. Mashqda to‘g‘ri yechgan savollaringiz ro‘yxatdan chiqadi."
      />
      <div className="container-page pb-16">
        <SmartReview />
      </div>
    </>
  );
}
