import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "navy";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-700 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-800 dark:bg-brand-400 dark:text-navy-950 dark:hover:bg-brand-300",
  secondary:
    "border border-navy-200 bg-white text-navy-900 hover:border-navy-300 hover:bg-navy-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
  ghost: "text-navy-600 hover:bg-navy-100 hover:text-navy-900 dark:text-navy-300 dark:hover:bg-white/10 dark:hover:text-white",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  success: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800",
  navy: "bg-navy-900 text-white shadow-sm hover:bg-navy-800 dark:bg-white dark:text-navy-950 dark:hover:bg-navy-100",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-5 text-sm gap-2 rounded-xl",
  lg: "h-13 px-7 text-base gap-2.5 rounded-2xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

const base =
  "inline-flex select-none items-center justify-center font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/40 disabled:pointer-events-none disabled:opacity-50";

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: BaseProps & { href: string }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </Link>
  );
}
