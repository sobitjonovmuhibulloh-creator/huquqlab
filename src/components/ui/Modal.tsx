"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native <dialog> asosidagi modal: Esc va fon bosilganda yopiladi, fokus brauzer tomonidan boshqariladi */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-labelledby="modal-title"
      className={cn(
        "m-auto max-h-[90dvh] w-[calc(100%-2rem)] rounded-3xl border border-navy-200 bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-950/60 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-navy-900 dark:text-white",
        size === "md" ? "max-w-lg" : size === "lg" ? "max-w-3xl" : "max-w-6xl",
      )}
    >
      {open && (
        <div className="flex max-h-[90dvh] flex-col animate-pop">
          <div className="flex items-center justify-between gap-4 border-b border-navy-100 px-6 py-4 dark:border-white/10">
            <h2 id="modal-title" className="text-lg font-extrabold">
              {title}
            </h2>
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-navy-500 hover:bg-navy-100 dark:hover:bg-white/10" aria-label="Yopish">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
          {footer && <div className="flex flex-col-reverse gap-2 border-t border-navy-100 px-6 py-4 sm:flex-row sm:justify-end dark:border-white/10">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
