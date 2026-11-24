import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/gamification/ProfileDashboard";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Mening progressim" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader eyebrow="Progress" title="Mening yutuqlarim" description="XP, daraja, nishonlar va haftalik challenge — barchasi bir joyda." />
      <div className="container-page">
        <ProfileDashboard />
      </div>
    </>
  );
}
