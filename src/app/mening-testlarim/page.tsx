import type { Metadata } from "next";
import { MyTests } from "@/components/exam/MyTests";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Mening testlarim", robots: { index: false } };

export default function MyTestsPage() {
  return (
    <>
      <PageHeader eyebrow="Kabinet" title="Mening testlarim" description="Ochiq premium testlar, paket kreditlari, xaridlar va urinishlar tarixi." />
      <div className="container-page pb-16">
        <MyTests />
      </div>
    </>
  );
}
