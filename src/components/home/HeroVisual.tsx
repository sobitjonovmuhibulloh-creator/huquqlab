import { Check, Flame, Zap } from "lucide-react";

/** Hero o'ng tomonidagi dekorativ kompozitsiya (faqat vizual) */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden>
      <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-500/25 via-brand-500/15 to-emerald-400/20 blur-2xl" />

      {/* Asosiy karta */}
      <div className="card relative rotate-[-1.5deg] p-6 shadow-2xl shadow-brand-900/10">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-400/15">👛</span>
          <div>
            <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">Simulyator</p>
            <p className="font-bold text-navy-900 dark:text-white">Topilgan hamyon</p>
          </div>
          <span className="ml-auto rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
            Jonli
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-navy-600 dark:text-navy-300">
          Koridorda hamyon topding. Ichida pul va egasining kartochkasi bor. Nima qilasan?
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3 rounded-xl border-2 border-emerald-400 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900 dark:bg-emerald-400/10 dark:text-emerald-100">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-500 text-white">
              <Check className="h-4 w-4" />
            </span>
            Ma’muriyatga topshiraman
            <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-xs text-white">+30</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-navy-200 p-3 text-sm font-medium text-navy-500 dark:border-white/10 dark:text-navy-400">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-navy-100 text-xs font-bold dark:bg-white/10">B</span>
            Katta yordamida egasini qidiraman
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-navy-200 p-3 text-sm font-medium text-navy-500 dark:border-white/10 dark:text-navy-400">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-navy-100 text-xs font-bold dark:bg-white/10">C</span>
            O‘zimda olib qolaman
          </div>
        </div>
      </div>

      {/* Suzuvchi elementlar */}
      <div className="card absolute -top-6 -right-2 flex items-center gap-2 px-4 py-3 shadow-xl animate-float sm:-right-6">
        <Zap className="h-5 w-5 fill-amber-400 text-amber-400" />
        <span className="font-extrabold text-navy-900 dark:text-white">+30 XP</span>
      </div>
      <div className="card absolute -bottom-8 -left-2 flex items-center gap-3 px-4 py-3 shadow-xl animate-float [animation-delay:1.5s] sm:-left-8">
        <span className="text-2xl">👛</span>
        <div>
          <p className="text-[11px] font-semibold text-brand-600 dark:text-brand-300">Yangi nishon</p>
          <p className="text-sm font-bold text-navy-900 dark:text-white">Halol qahramon</p>
        </div>
      </div>
      <div className="card absolute -right-2 -bottom-10 hidden items-center gap-2 px-4 py-3 shadow-xl animate-float [animation-delay:3s] sm:flex">
        <Flame className="h-5 w-5 text-orange-500" />
        <div>
          <p className="text-[11px] font-semibold text-navy-500">Haftalik challenge</p>
          <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-navy-200 dark:bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-400 to-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
