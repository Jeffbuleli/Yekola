import { NextResponse } from "next/server";
import { getAIProviderName } from "@/lib/ai/provider";
import { isPawapayConfigured } from "@/lib/payments/pawapay-client";
import { paymentsMode } from "@/lib/payments/provider";

export async function GET() {
  const meetBase =
    process.env.NEXT_PUBLIC_MEET_BASE_URL?.trim() || "https://live.mcbuleli.org";

  return NextResponse.json({
    ok: true,
    service: "yekola",
    time: new Date().toISOString(),
    integrations: {
      openai: getAIProviderName(),
      payments: paymentsMode(),
      pawapayConfigured: isPawapayConfigured(),
      meetBase,
    },
  });
}
