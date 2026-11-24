import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "O‘qituvchi kirishi", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute top-1/4 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="relative flex w-full justify-center">
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}
