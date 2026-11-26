import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentView } from "@/components/laws/DocumentView";
import { documentBySlug, documents } from "@/data/documents";

export function generateStaticParams() {
  return documents.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = documentBySlug[slug];
  return doc ? { title: doc.shortTitle, description: doc.summary } : { title: "Hujjat" };
}

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = documentBySlug[slug];
  if (!doc) notFound();
  return <DocumentView doc={doc} />;
}
