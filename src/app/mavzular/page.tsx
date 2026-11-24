import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TopicsExplorer } from "@/components/topics/TopicsExplorer";
import { Skeleton } from "@/components/ui/misc";

export const metadata: Metadata = {
  title: "Huquqiy mavzular",
  description: "7–11-sinf o‘quvchilari uchun sodda va qiziqarli huquqiy darslar.",
};

export default function TopicsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Huquqiy darslar"
        title="Sinfingni tanla va o‘rganishni boshla"
        description="Har bir mavzu: sodda tushuntirish, huquqiy asos, hayotiy misol, vaziyat tahlili va test. O‘rganganlaringni belgilab bor — progressing saqlanadi."
      />
      <div className="container-page">
        <Suspense fallback={<ExplorerSkeleton />}>
          <TopicsExplorer />
        </Suspense>
      </div>
    </>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true">
      <Skeleton className="h-16 rounded-3xl" />
      <Skeleton className="h-13" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
