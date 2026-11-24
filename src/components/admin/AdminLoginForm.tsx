"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, KeyRound, LogIn } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";
import { safeNextPath } from "@/lib/admin-auth";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return setError("Parolni kiriting");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Kirishda xatolik yuz berdi");
        setPassword("");
        return;
      }
      router.replace(safeNextPath(params.get("next")));
      router.refresh();
    } catch {
      setError("Server bilan aloqa yo‘q. Internetni tekshiring.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-md p-7 animate-fade-up sm:p-9" noValidate>
      <div className="flex flex-col items-center text-center">
        <LogoMark className="h-14 w-14" />
        <h1 className="mt-5 text-2xl font-extrabold text-navy-900 dark:text-white">O‘qituvchi paneliga kirish</h1>
        <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-400">Kontentni boshqarish uchun parolni kiriting.</p>
      </div>

      <label htmlFor="admin-password" className="label mt-7">
        Parol
      </label>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-navy-400" />
        <input
          id="admin-password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input h-12 pr-11 pl-10"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "login-error" : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute top-1/2 right-2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-navy-400 hover:bg-navy-100 dark:hover:bg-white/10"
          aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p id="login-error" role="alert" className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-medium text-rose-700 animate-shake dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
        <LogIn className="h-5 w-5" /> {loading ? "Tekshirilmoqda..." : "Kirish"}
      </Button>
      <p className="mt-5 text-center text-xs text-navy-500 dark:text-navy-400">Sessiya 8 soat davomida amal qiladi.</p>
    </form>
  );
}
