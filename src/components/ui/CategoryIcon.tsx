import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { categoryById } from "@/data/categories";
import { cn } from "@/lib/utils";
import type { Category, CategoryId } from "@/types";

const icons: Record<string, LucideIcon> = {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Home,
  Landmark,
  Scale,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wallet,
};

/** Tailwind klasslari to'liq yozilishi kerak (dinamik klasslar purge bo'lib ketadi) */
export const colorStyles: Record<Category["color"], { soft: string; text: string; gradient: string }> = {
  indigo: { soft: "bg-indigo-100 dark:bg-indigo-400/15", text: "text-indigo-600 dark:text-indigo-300", gradient: "from-indigo-500 to-blue-500" },
  emerald: { soft: "bg-emerald-100 dark:bg-emerald-400/15", text: "text-emerald-600 dark:text-emerald-300", gradient: "from-emerald-500 to-teal-500" },
  amber: { soft: "bg-amber-100 dark:bg-amber-400/15", text: "text-amber-600 dark:text-amber-300", gradient: "from-amber-500 to-orange-500" },
  rose: { soft: "bg-rose-100 dark:bg-rose-400/15", text: "text-rose-600 dark:text-rose-300", gradient: "from-rose-500 to-pink-500" },
  sky: { soft: "bg-sky-100 dark:bg-sky-400/15", text: "text-sky-600 dark:text-sky-300", gradient: "from-sky-500 to-cyan-500" },
  violet: { soft: "bg-violet-100 dark:bg-violet-400/15", text: "text-violet-600 dark:text-violet-300", gradient: "from-violet-500 to-purple-500" },
  teal: { soft: "bg-teal-100 dark:bg-teal-400/15", text: "text-teal-600 dark:text-teal-300", gradient: "from-teal-500 to-emerald-500" },
  orange: { soft: "bg-orange-100 dark:bg-orange-400/15", text: "text-orange-600 dark:text-orange-300", gradient: "from-orange-500 to-red-500" },
  fuchsia: { soft: "bg-fuchsia-100 dark:bg-fuchsia-400/15", text: "text-fuchsia-600 dark:text-fuchsia-300", gradient: "from-fuchsia-500 to-pink-500" },
  lime: { soft: "bg-lime-100 dark:bg-lime-400/15", text: "text-lime-700 dark:text-lime-300", gradient: "from-lime-500 to-green-500" },
};

export function CategoryIcon({ categoryId, className, size = "md" }: { categoryId: CategoryId; className?: string; size?: "sm" | "md" | "lg" }) {
  const category = categoryById[categoryId];
  const Icon = icons[category?.icon] ?? Scale;
  const style = colorStyles[category?.color ?? "indigo"];
  const box = { sm: "h-9 w-9 rounded-xl", md: "h-11 w-11 rounded-2xl", lg: "h-14 w-14 rounded-2xl" }[size];
  const icon = { sm: "h-4.5 w-4.5", md: "h-5 w-5", lg: "h-7 w-7" }[size];
  return (
    <span className={cn("grid shrink-0 place-items-center", box, style.soft, style.text, className)}>
      <Icon className={icon} />
    </span>
  );
}
