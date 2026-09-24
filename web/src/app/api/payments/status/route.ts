import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, mutateDb } from "@/lib/db/store";
import { fulfillPaymentIntent, markPaymentFailed } from "@/lib/payments/fulfill";
import {
  mapPawapayStatus,
  pawapayCheckDeposit,
  pawapayCheckPayout,
  unwrapStatus,
} from "@/lib/payments/pawapay-client";

/** Statut d'un paiement + reconciliation PawaPay si pending. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const reference = new URL(req.url).searchParams.get("ref");
  if (!reference) {
    return NextResponse.json({ error: "ref_required" }, { status: 400 });
  }

  let intent = getDb().payments.find((p) => p.reference === reference);
  if (!intent || intent.userId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (intent.status === "pending" && intent.provider === "momo") {
    const remote =
      intent.kind === "withdrawal"
        ? await pawapayCheckPayout(reference)
        : await pawapayCheckDeposit(reference);
    const body = unwrapStatus(remote);
    const mapped = mapPawapayStatus(body?.status);
    if (mapped === "COMPLETED") {
      fulfillPaymentIntent(reference);
      intent = getDb().payments.find((p) => p.reference === reference)!;
    } else if (mapped === "FAILED") {
      markPaymentFailed(
        reference,
        body?.failureReason?.failureMessage || "Paiement échoué",
      );
      intent = getDb().payments.find((p) => p.reference === reference)!;
    } else {
      mutateDb((d) => {
        const p = d.payments.find((x) => x.reference === reference);
        if (p) {
          p.message = `En cours (${body?.status || "PROCESSING"})`;
          p.updatedAt = new Date().toISOString();
        }
      });
      intent = getDb().payments.find((p) => p.reference === reference)!;
    }
  }

  const enrollment =
    intent.kind === "course_purchase" && intent.courseId
      ? getDb().enrollments.find(
          (e) => e.userId === user.id && e.courseId === intent!.courseId,
        )
      : null;

  return NextResponse.json({
    payment: intent,
    enrollment,
    paid: intent.status === "paid" || intent.status === "demo",
  });
}
