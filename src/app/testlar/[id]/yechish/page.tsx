import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExamRunner } from "@/components/exam/ExamRunner";
import { getExam } from "@/server/exam-repository";

export const metadata: Metadata = { title: "Imtihon rejimi", robots: { index: false } };

export default async function ExamRunPage({ params }: { params: Promise<{ id: string }> }) {
  const exam = await getExam((await params).id);
  if (!exam || exam.status !== "available") notFound();
  return <ExamRunner exam={exam} />;
}
