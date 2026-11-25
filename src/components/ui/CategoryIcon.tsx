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
import type { CategoryId } from "@/types";

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

/** Barcha kategoriyalar bir xil vazmin uslubda — rang-baranglik o'rniga ikonka farqlaydi */
const iconStyle = {
  soft: "bg-brand-50 ring-1 ring-brand-100 dark:bg-brand-400/10 dark:ring-brand-400/15",
  text: "text-brand-700 dark:text-brand-300",
};

export function CategoryIcon({ categoryId, className, size = "md" }: { categoryId: CategoryId; className?: string; size?: "sm" | "md" | "lg" }) {
  const category = categoryById[categoryId];
  const Icon = icons[category?.icon] ?? Scale;
  const style = iconStyle;
  const box = { sm: "h-9 w-9 rounded-xl", md: "h-11 w-11 rounded-2xl", lg: "h-14 w-14 rounded-2xl" }[size];
  const icon = { sm: "h-4.5 w-4.5", md: "h-5 w-5", lg: "h-7 w-7" }[size];
  return (
    <span className={cn("grid shrink-0 place-items-center", box, style.soft, style.text, className)}>
      <Icon className={icon} />
    </span>
  );
}
