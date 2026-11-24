"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast({ tone: "info", title: "Paneldan chiqdingiz" });
      router.replace("/admin/kirish");
      router.refresh();
    } catch {
      toast({ tone: "error", title: "Chiqishda xatolik", description: "Qayta urinib ko‘ring." });
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={logout} disabled={loading}>
      <LogOut className="h-4 w-4" /> {loading ? "Chiqilmoqda..." : "Chiqish"}
    </Button>
  );
}
