import type { Metadata } from "next";
import { TopicView } from "@/components/topics/TopicView";
import { topics } from "@/data/topics";

export function generateStaticParams() {
  return topics.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = topics.find((t) => t.slug === slug);
  return topic ? { title: topic.title, description: topic.shortDescription } : { title: "Mavzu" };
}

/**
 * Demo mavzular oldindan generatsiya qilinadi. O'qituvchi paneli orqali
 * qo'shilgan mavzular esa brauzerda (ContentProvider orqali) topiladi.
 */
export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <TopicView slug={slug} />;
}
