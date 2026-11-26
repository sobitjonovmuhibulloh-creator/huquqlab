import type { Metadata } from "next";
import { ResultView } from "@/components/exam/ResultView";

export const metadata: Metadata = { title: "Test natijasi", robots: { index: false } };

export default async function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  return <ResultView attemptId={(await params).attemptId} />;
}
