import { Skeleton } from "@/components/ui/misc";

export default function Loading() {
  return (
    <div className="container-page space-y-6 py-16" aria-busy="true" aria-label="Yuklanmoqda">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <div className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-52 rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
