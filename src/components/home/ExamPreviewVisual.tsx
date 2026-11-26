import { Check, Clock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bosh sahifadagi imtihon interfeysi illyustratsiyasi (statik, bezak uchun).
 * Raqamlar real natija sifatida ko'rsatilmaydi — bu UI namunasi.
 */
export function ExamPreviewVisual() {
  const states = ["a", "a", "a", "f", "a", "c", "", "", "a", "", "", "", "", "", "", ""];
  return (
    <div className="relative mx-auto max-w-lg pb-20" aria-hidden>
      <div className="card overflow-hidden shadow-2xl shadow-navy-900/10">
        <div className="flex items-center justify-between border-b border-navy-100 px-5 py-3 dark:border-white/[0.06]">
          <span className="text-sm font-semibold text-navy-900 dark:text-white">Milliy sertifikat · mock</span>
          <span className="flex items-center gap-1.5 rounded-lg bg-navy-100 px-2.5 py-1 font-mono text-sm font-bold text-navy-900 dark:bg-white/10 dark:text-white">
            <Clock className="h-3.5 w-3.5" /> 74:12
          </span>
        </div>
        <div className="grid gap-5 p-5 sm:grid-cols-[1fr_120px]">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-display text-sm font-extrabold text-navy-900 dark:text-white">6-savol</span>
              <span className="rounded-full bg-navy-100 px-2 py-0.5 font-medium text-navy-600 dark:bg-white/10 dark:text-navy-300">Y-1 · yopiq</span>
              <Flag className="ml-auto h-3.5 w-3.5 text-navy-400" />
            </div>
            <p className="mt-3 text-sm font-semibold text-navy-900 dark:text-white">Huquq normasining qaysi elementi xulq-atvor qoidasini belgilaydi?</p>
            <div className="mt-3 space-y-2">
              {["Gipoteza", "Dispozitsiya", "Sanksiya", "Preambula"].map((o, i) => (
                <div
                  key={o}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs",
                    i === 1 ? "border-brand-600 bg-brand-50 dark:border-brand-400 dark:bg-brand-400/10" : "border-navy-200 dark:border-white/10",
                  )}
                >
                  <span className={cn("grid h-5 w-5 place-items-center rounded-md text-[10px] font-bold", i === 1 ? "bg-brand-600 text-white" : "bg-navy-100 text-navy-600 dark:bg-white/10 dark:text-navy-300")}>
                    {"ABCD"[i]}
                  </span>
                  <span className="text-navy-700 dark:text-navy-200">{o}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden grid-cols-4 content-start gap-1 sm:grid">
            {states.map((s, i) => (
              <span
                key={i}
                className={cn(
                  "relative grid h-6 place-items-center rounded text-[10px] font-semibold",
                  s === "a" || s === "f" ? "bg-brand-600 text-white" : s === "c" ? "bg-white text-navy-900 ring-2 ring-brand-500 dark:bg-navy-800 dark:text-white" : "bg-navy-100 text-navy-500 dark:bg-white/[0.06]",
                )}
              >
                {i + 1}
                {s === "f" && <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="card absolute -bottom-24 -left-2 w-56 p-4 shadow-xl animate-float sm:-left-10">
        <p className="text-xs font-semibold text-navy-500 dark:text-navy-400">Bo‘limlar bo‘yicha tahlil</p>
        {[
          ["Davlat va huquq nazariyasi", 82, "bg-emerald-500"],
          ["Konstitutsiyaviy huquq", 64, "bg-brand-500"],
          ["Huquq sohalari", 41, "bg-rose-500"],
        ].map(([label, v, c]) => (
          <div key={label as string} className="mt-2.5">
            <div className="flex justify-between text-[11px] text-navy-600 dark:text-navy-300">
              <span>{label}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-navy-100 dark:bg-white/10">
              <div className={cn("h-full rounded-full", c as string)} style={{ width: `${v}%` }} />
            </div>
          </div>
        ))}
        <p className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="h-3 w-3" /> Har bir savolga izoh va manba
        </p>
      </div>
    </div>
  );
}
