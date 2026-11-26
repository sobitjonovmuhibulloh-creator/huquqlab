import { NextResponse } from "next/server";
import { handle } from "@/server/http";
import { getPaymentProvider, isMockPaymentsAllowed } from "@/server/payments";
import { getPricing } from "@/server/pricing-store";

export const dynamic = "force-dynamic";

export const GET = handle(async () => {
  const pricing = await getPricing();
  const payment = getPaymentProvider();
  return NextResponse.json(
    {
      currency: pricing.currency,
      products: pricing.products.filter((p) => p.active),
      payments: payment.provider ? { enabled: true, mock: isMockPaymentsAllowed() } : { enabled: false, reason: payment.reason },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
});
