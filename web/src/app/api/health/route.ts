import { NextResponse } from "next/server";
import { getAIProviderName } from "@/lib/ai/provider";
import { canSendViaResend } from "@/lib/email/resend";
import { isPawapayConfigured } from "@/lib/payments/pawapay-client";
import { paymentsMode } from "@/lib/payments/provider";
import { dbInfo, getDb } from "@/lib/db/store";

export async function GET() {
  const meetBase =
    process.env.NEXT_PUBLIC_MEET_BASE_URL?.trim() || "https://live.mcbuleli.org";
  // Touch DB so path/users are accurate
  const db = getDb();
  const info = dbInfo();

  return NextResponse.json({
    ok: true,
    service: "yekola",
    time: new Date().toISOString(),
    integrations: {
      openai: getAIProviderName(),
      payments: paymentsMode(),
      pawapayConfigured: isPawapayConfigured(),
      meetBase,
      resend: canSendViaResend() ? "configured" : "missing",
    },
    db: {
      ...info,
      usersOnDisk: db.users.length,
      realUsers: db.users.filter((u) => !u.email.endsWith("@yekola.demo")).map((u) => u.email),
      sessions: db.sessions?.length ?? 0,
    },
  });
}
