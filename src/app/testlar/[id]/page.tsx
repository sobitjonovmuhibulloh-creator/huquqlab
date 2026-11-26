import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamDetail } from "@/components/exam/ExamDetail";
import { exams } from "@/data/exams";
import { getExam } from "@/server/exam-repository";

/**
 * Kod ichidagi testlar oldindan generatsiya qilinadi; bazadagi testlar so'rov paytida topiladi.
 * revalidate: admin testni nashrdan olsa yoki narxini o'zgartirsa, sahifa 1 daqiqa ichida yangilanadi.
 */
export const revalidate = 60;

export function generateStaticParams() {
  return exams.map((e) => ({ id: e.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const exam = await getExam((await params).id);
  return exam ? { title: exam.title, description: exam.description } : { title: "Test" };
}

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const exam = await getExam((await params).id);
  if (!exam) notFound();
  return <ExamDetail exam={exam} />;
}
