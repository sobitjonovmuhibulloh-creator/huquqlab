import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { LibraryView } from "@/components/library/LibraryView";

export const metadata: Metadata = {
  title: "Kutubxona",
  description: "8–11-sinf huquq darsliklari — rasmiy ta’lim portalidagi nusxalar.",
};

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Kutubxona"
        title="Huquq darsliklari"
        description="8–11-sinflar uchun rasmiy huquq darsliklari o‘zbek va rus tillarida. Darslikni o‘qing, so‘ng mavzularni interaktiv tarzda mustahkamlang."
      />
      <div className="container-page">
        <LibraryView />
      </div>
    </>
  );
}
