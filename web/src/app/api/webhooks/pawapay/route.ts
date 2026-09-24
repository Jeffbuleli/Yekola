import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getDb } from "@/lib/db/store";
import { fulfillPaymentIntent, markPaymentFailed } from "@/lib/payments/fulfill";
import { mapPawapayStatus } from "@/lib/payments/pawapay-client";

/**
 * Webhook PawaPay (dépôts + payouts).
 * Configurer l'URL dashboard : https://yekola.mcbuleli.com/api/webhooks/pawapay
 * Optionnel : PAWAPAY_CALLBACK_SECRET (Bearer ou x-callback-secret).
 */
export async function POST(req: Request) {
  try {
    assertCallbackSecret(req);
  } catch {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const raw = await req.text();
  let body: Record<string, unknown> = {};
  try {
    body = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const reference = String(
    body.depositId || body.payoutId || body.reference || "",
  ).trim();
  if (!reference) {
    return NextResponse.json({ error: "missing_reference" }, { status: 400 });
  }

  const status = mapPawapayStatus(String(body.status ?? ""));
  const intent = getDb().payments.find((p) => p.reference === reference);

  if (!intent) {
    // Acknowledge unknown refs to avoid retries storm
    return NextResponse.json({ ok: true, ignored: true });
  }

  if (status === "COMPLETED") {
    fulfillPaymentIntent(reference);
  } else if (status === "FAILED") {
    const failMsg =
      (body.failureReason as { failureMessage?: string } | undefined)
        ?.failureMessage || "Échec Mobile Money";
    markPaymentFailed(reference, failMsg);
  }

  return NextResponse.json({ ok: true, reference, status });
}

function assertCallbackSecret(req: Request) {
  const expected = process.env.PAWAPAY_CALLBACK_SECRET?.trim();
  if (!expected) return;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  const bearer = auth.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : "";
  const header =
    req.headers.get("x-callback-secret")?.trim() ||
    req.headers.get("x-pawapay-callback-secret")?.trim() ||
    "";
  const provided = bearer || header;
  if (!provided) throw new Error("missing_secret");
  const a = Buffer.from(provided, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("bad_secret");
  }
}
