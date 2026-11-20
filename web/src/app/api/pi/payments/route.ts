import { NextResponse } from "next/server";
import { newId } from "@/lib/auth/crypto";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, mutateDb } from "@/lib/db/store";
import { enrollmentFor } from "@/lib/db/queries";
import { fulfillPaymentIntent } from "@/lib/payments/fulfill";
import { cdfToPi, getPlan, PLANS } from "@/lib/plans";
import {
  piApiKey,
  piWalletAddress,
  piApprovePayment,
  piCompletePayment,
  piGetPayment,
} from "@/lib/pi/platform";
import type { PaymentIntent, PlanId } from "@/lib/types";

export const dynamic = "force-dynamic";

type Kind = "course_purchase" | "teacher_subscription";

function amountsMatch(paid: number, expected: number): boolean {
  return Math.abs(paid - expected) < 0.001;
}

function expectedPi(kind: Kind, courseId: string | null, planId: string | null) {
  const db = getDb();
  if (kind === "course_purchase") {
    const course = db.courses.find((c) => c.id === courseId && c.status === "published");
    if (!course) return { error: "course_not_found" as const };
    const academy = db.academies.find((a) => a.id === course.academyId);
    if (!academy) return { error: "academy_missing" as const };
    return {
      amountPi: cdfToPi(course.priceCdf),
      courseId: course.id,
      academyId: academy.id,
      planId: null as PlanId | null,
      memo: `Yekola ${course.title}`.slice(0, 80),
    };
  }
  const plan = PLANS.find((p) => p.id === planId);
  if (!plan) return { error: "invalid_plan" as const };
  return {
    amountPi: plan.pricePi,
    courseId: null,
    academyId: null,
    planId: plan.id,
    memo: `Yekola ${plan.name}`.slice(0, 80),
  };
}

function upsertPending(args: {
  paymentId: string;
  userId: string;
  kind: Kind;
  amountPi: number;
  courseId: string | null;
  academyId: string | null;
  planId: PlanId | null;
}): PaymentIntent {
  const now = new Date().toISOString();
  let intent: PaymentIntent | undefined;
  mutateDb((d) => {
    intent = d.payments.find((p) => p.reference === args.paymentId);
    if (intent) return;
    intent = {
      id: newId("pay"),
      reference: args.paymentId,
      kind: args.kind,
      status: "pending",
      amountCdf: 0,
      amountPi: args.amountPi,
      currency: "PI",
      msisdn: null,
      momoProvider: null,
      userId: args.userId,
      courseId: args.courseId,
      academyId: args.academyId,
      planId: args.planId,
      provider: "pi",
      message: "Paiement Pi en attente de confirmation",
      createdAt: now,
      updatedAt: now,
      fulfilledAt: null,
    };
    d.payments.push(intent);
  });
  return intent!;
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(piApiKey()),
    wallet: Boolean(piWalletAddress()),
    sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX !== "0",
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const apiKey = piApiKey();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "pi_not_configured",
        message: "Clé API Pi manquante sur le serveur. Le paiement Pi n’est pas encore activé.",
      },
      { status: 503 },
    );
  }

  const body = await req.json().catch(() => null);
  const action = String(body?.action ?? "");
  const paymentId = String(body?.paymentId ?? "").trim();
  const kind = String(body?.kind ?? "") as Kind;
  const courseId = body?.courseId ? String(body.courseId) : null;
  const planId = body?.planId ? String(body.planId) : null;

  if (!paymentId || (kind !== "course_purchase" && kind !== "teacher_subscription")) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (kind === "teacher_subscription" && user.role !== "teacher") {
    return NextResponse.json({ error: "teachers_only" }, { status: 403 });
  }

  if (kind === "course_purchase" && courseId && enrollmentFor(user.id, courseId)) {
    return NextResponse.json({ error: "already_enrolled" }, { status: 409 });
  }

  const quote = expectedPi(kind, courseId, planId);
  if ("error" in quote) {
    return NextResponse.json({ error: quote.error }, { status: 400 });
  }
  if (quote.amountPi <= 0 && action === "approve") {
    return NextResponse.json({ error: "free_use_existing_checkout" }, { status: 400 });
  }

  const academyId =
    kind === "teacher_subscription" ? user.academyId : quote.academyId;

  if (kind === "course_purchase" && user.academyId && user.academyId === quote.academyId) {
    return NextResponse.json({ error: "own_course" }, { status: 403 });
  }

  let platform;
  try {
    platform = await piGetPayment(paymentId, apiKey);
  } catch (err) {
    return NextResponse.json(
      { error: "pi_lookup_failed", message: err instanceof Error ? err.message : "Pi" },
      { status: 502 },
    );
  }

  const paid = Number(platform.amount ?? 0);
  if (!amountsMatch(paid, quote.amountPi)) {
    return NextResponse.json(
      {
        error: "amount_mismatch",
        message: `Montant Pi attendu : ${quote.amountPi}, reçu : ${paid}.`,
      },
      { status: 409 },
    );
  }

  upsertPending({
    paymentId,
    userId: user.id,
    kind,
    amountPi: quote.amountPi,
    courseId: quote.courseId,
    academyId,
    planId: kind === "teacher_subscription" ? (quote.planId as PlanId) : null,
  });

  if (action === "approve") {
    try {
      await piApprovePayment(paymentId, apiKey);
    } catch (err) {
      return NextResponse.json(
        { error: "pi_approve_failed", message: err instanceof Error ? err.message : "Pi" },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, approved: true, amountPi: quote.amountPi });
  }

  if (action === "complete") {
    const txid = String(body?.txid ?? platform.transaction?.txid ?? "").trim();
    if (!txid) return NextResponse.json({ error: "missing_txid" }, { status: 400 });
    try {
      if (!platform.status?.developer_approved) await piApprovePayment(paymentId, apiKey);
      await piCompletePayment(paymentId, txid, apiKey);
    } catch (err) {
      return NextResponse.json(
        { error: "pi_complete_failed", message: err instanceof Error ? err.message : "Pi" },
        { status: 502 },
      );
    }
    const done = fulfillPaymentIntent(paymentId);
    const plan = quote.planId ? getPlan(quote.planId) : null;
    return NextResponse.json({
      ok: done.ok,
      completed: true,
      reference: paymentId,
      commissionPercent: plan?.commissionPercent ?? null,
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
