import type { Metadata } from "next";
import { CheckoutStatus } from "@/components/exam/CheckoutStatus";

export const metadata: Metadata = { title: "To‘lov", robots: { index: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  return (
    <div className="container-page py-12 sm:py-16">
      <CheckoutStatus orderId={(await params).orderId} />
    </div>
  );
}
