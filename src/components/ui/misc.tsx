import { AlertTriangle, BadgeCheck, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LegalStatus } from "@/types";

export function ProgressBar({
  value,
  className,
  barClassName,
  label,
}: {
  value: number;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-navy-200/80 dark:bg-white/10", className)}
    >
      <div
        className={cn("h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-[width] duration-700 ease-out", barClassName)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center animate-fade-in">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-navy-100 text-navy-500 dark:bg-white/5 dark:text-navy-400">
        {icon ?? <SearchX className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-bold text-navy-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-navy-500 dark:text-navy-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-navy-200/80 dark:bg-white/10", className)} />;
}

export function LegalStatusBadge({ status }: { status: LegalStatus }) {
  return status === "verified" ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20">
      <BadgeCheck className="h-3.5 w-3.5" /> Rasmiy hujjat
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20">
      <AlertTriangle className="h-3.5 w-3.5" /> Tekshirish talab etiladi
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-600 dark:bg-white/[0.06] dark:text-navy-300",
        className,
      )}
    >
      {children}
    </span>
  );
}
