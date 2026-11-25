"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X, Zap } from "lucide-react";
import { useProgress } from "@/components/providers/ProgressProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Logo } from "@/components/ui/Logo";
import { getLevel } from "@/lib/gamification";
import { cn } from "@/lib/utils";

export const navItems = [
  { href: "/mavzular", label: "Mavzular" },
  { href: "/simulyatorlar", label: "Simulyatorlar" },
  { href: "/testlar", label: "Testlar" },
  { href: "/kutubxona", label: "Kutubxona" },
  { href: "/profil", label: "Progress" },
  { href: "/admin", label: "O‘qituvchi" },
];

export function Header() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { progress, hydrated } = useProgress();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const level = getLevel(progress.xp);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled || open
          ? "border-navy-200/70 bg-white/80 backdrop-blur-xl dark:border-white/[0.06] dark:bg-navy-950/80"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Asosiy navigatsiya">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-brand-700 dark:text-white"
                  : "text-navy-600 hover:text-navy-900 dark:text-navy-400 dark:hover:text-white",
              )}
            >
              {item.label}
              {isActive(item.href) && (
                <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/profil"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300"
            title={`${level.level}-daraja: ${level.name}`}
          >
            <Zap className="h-4 w-4 fill-current" />
            <span className="tabular-nums">{hydrated ? progress.xp : "—"}</span>
            <span className="hidden text-xs font-semibold opacity-70 sm:inline">XP</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-xl text-navy-600 transition hover:bg-navy-100 dark:text-navy-300 dark:hover:bg-white/10"
            aria-label={theme === "dark" ? "Yorug‘ rejim" : "Qorong‘i rejim"}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-xl text-navy-700 transition hover:bg-navy-100 lg:hidden dark:text-navy-200 dark:hover:bg-white/10"
            aria-label="Menyu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="h-[calc(100dvh-4rem)] overflow-y-auto border-t border-navy-200/70 bg-white/95 backdrop-blur-xl lg:hidden dark:border-white/[0.06] dark:bg-navy-950/95">
          <nav className="container-page flex flex-col gap-1 py-4" aria-label="Mobil navigatsiya">
            <Link href="/" className={cn("rounded-2xl px-4 py-3.5 text-base font-semibold", pathname === "/" ? "bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300" : "text-navy-700 dark:text-navy-200")}>
              Bosh sahifa
            </Link>
            {navItems.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ animationDelay: `${i * 40}ms` }}
                className={cn(
                  "animate-fade-up rounded-2xl px-4 py-3.5 text-base font-semibold",
                  isActive(item.href)
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                    : "text-navy-700 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
