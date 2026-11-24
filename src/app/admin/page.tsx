import type { Metadata } from "next";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "O‘qituvchi paneli", robots: { index: false } };

export default function AdminPage() {
  return (
    <>
      <PageHeader
        eyebrow="O‘qituvchi paneli"
        title="Kontent boshqaruvi"
        description="Mavzular qo‘shing va tahrirlang, test savollarini boshqaring, simulyatorlarni tekshiring."
      >
        <div className="mt-6">
          <LogoutButton />
        </div>
      </PageHeader>
      <div className="container-page">
        <AdminPanel />
      </div>
    </>
  );
}
