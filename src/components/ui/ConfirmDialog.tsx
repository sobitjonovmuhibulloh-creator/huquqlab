"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";

interface Request {
  title: string;
  description?: string;
  confirmLabel?: string;
  resolve: (ok: boolean) => void;
}

/**
 * window.confirm o'rniga: `const [confirm, dialog] = useConfirm();`
 * `if (!(await confirm({ title: "..." }))) return;` va `{dialog}` ni JSX ga qo'shing.
 */
export function useConfirm() {
  const [request, setRequest] = useState<Request | null>(null);
  const ref = useRef<HTMLDialogElement>(null);

  const confirm = useCallback(
    (opts: Omit<Request, "resolve">) => new Promise<boolean>((resolve) => setRequest({ ...opts, resolve })),
    [],
  );

  useEffect(() => {
    const d = ref.current;
    if (request && d && !d.open) d.showModal();
  }, [request]);

  const close = (ok: boolean) => {
    request?.resolve(ok);
    ref.current?.close();
    setRequest(null);
  };

  const dialog = request ? (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        close(false);
      }}
      onClick={(e) => e.target === e.currentTarget && close(false)}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-navy-200 bg-white p-0 text-navy-900 shadow-2xl backdrop:bg-navy-950/60 backdrop:backdrop-blur-sm dark:border-white/10 dark:bg-navy-900 dark:text-white"
      aria-labelledby="confirm-title"
    >
      <div className="p-6 animate-pop">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <h2 id="confirm-title" className="mt-4 text-lg font-extrabold">
          {request.title}
        </h2>
        {request.description && <p className="mt-1 text-sm text-navy-600 dark:text-navy-300">{request.description}</p>}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => close(false)} autoFocus>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={() => close(true)}>
            {request.confirmLabel ?? "O‘chirish"}
          </Button>
        </div>
      </div>
    </dialog>
  ) : null;

  return [confirm, dialog] as const;
}
