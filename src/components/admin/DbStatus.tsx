import { Database } from "lucide-react";

/** Baza ulanmaganda: nima ishlamasligi va qanday ulanishi — hech narsa «ishlayapti» deb ko'rsatilmaydi */
export function DbNotConfigured({ what }: { what: string }) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-100">
      <p className="flex items-center gap-2 font-bold">
        <Database className="h-4 w-4" /> Ma’lumotlar bazasi ulanmagan — {what}
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5">
        <li>
          Supabase loyihasida <code className="rounded bg-amber-100 px-1 dark:bg-white/10">supabase/migrations</code> papkasidagi SQL fayllarni tartib bilan ishga tushiring (SQL Editor yoki{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-white/10">supabase db push</code>).
        </li>
        <li>
          Server env’ga qo‘shing: <code className="rounded bg-amber-100 px-1 dark:bg-white/10">SUPABASE_URL</code> va{" "}
          <code className="rounded bg-amber-100 px-1 dark:bg-white/10">SUPABASE_SERVICE_ROLE_KEY</code> (lokal — <code>.env.local</code>, production — Vercel → Settings → Environment Variables).
          Kalitni hech qachon <code>NEXT_PUBLIC_</code> bilan boshlamang.
        </li>
        <li>Serverni qayta ishga tushiring.</li>
      </ol>
      <p className="mt-3">Hozircha faylni yuklab, tekshiruv va preview’ni ko‘rishingiz mumkin — lekin bazaga import qilinmaydi.</p>
    </div>
  );
}
