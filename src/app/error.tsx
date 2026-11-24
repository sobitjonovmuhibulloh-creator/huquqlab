"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl">⚠️</span>
      <h1 className="mt-4 text-3xl font-extrabold text-navy-900 dark:text-white">Nimadir noto‘g‘ri ketdi</h1>
      <p className="mt-2 max-w-md text-navy-600 dark:text-navy-400">
        Sahifani yuklashda kutilmagan xatolik yuz berdi. Qayta urinib ko‘ring.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Qayta urinish</Button>
        <ButtonLink href="/" variant="secondary">
          Bosh sahifa
        </ButtonLink>
      </div>
    </div>
  );
}
