"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "xp" | "badge" | "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  emoji?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toneStyles: Record<ToastTone, string> = {
  xp: "border-amber-300/60 bg-amber-50 text-amber-950 dark:border-amber-400/30 dark:bg-amber-950/80 dark:text-amber-50",
  badge: "border-brand-300/60 bg-brand-50 text-brand-950 dark:border-brand-400/30 dark:bg-brand-950/80 dark:text-brand-50",
  success: "border-emerald-300/60 bg-emerald-50 text-emerald-950 dark:border-emerald-400/30 dark:bg-emerald-950/80 dark:text-emerald-50",
  error: "border-rose-300/60 bg-rose-50 text-rose-950 dark:border-rose-400/30 dark:bg-rose-950/80 dark:text-rose-50",
  info: "border-navy-200 bg-white text-navy-900 dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = ++idRef.current;
      setToasts((all) => [...all.slice(-3), { ...t, id }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border p-4 shadow-xl shadow-navy-900/10 backdrop-blur",
              toneStyles[t.tone],
            )}
          >
            {t.emoji && <span className="text-2xl leading-none">{t.emoji}</span>}
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{t.title}</p>
              {t.description && <p className="mt-0.5 text-sm opacity-80">{t.description}</p>}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 opacity-60 transition hover:opacity-100"
              aria-label="Yopish"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast ToastProvider ichida ishlatilishi kerak");
  return ctx;
}
