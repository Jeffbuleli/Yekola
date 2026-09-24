import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";
import { getDb, mutateDb } from "@/lib/db/store";
import { getPlan, PLANS } from "@/lib/plans";
import { getPaymentProvider, paymentsMode } from "@/lib/payments/provider";
import { assertSudoOrPasskey } from "@/lib/auth/sudo";
import { fulfillPaymentIntent } from "@/lib/payments/fulfill";
import { academyStats } from "@/lib/db/queries";
import type { PaymentIntent, PlanId } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.academyId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getDb();
  const academy = db.academies.find((a) => a.id === user.academyId)!;
  const stats = academyStats(academy.id);
  const txs = db.walletTx
    .filter((t) => t.academyId === academy.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({
    academy,
    stats,
    plans: PLANS,
    currentPlan: getPlan(academy.planId),
    walletTx: txs,
    paymentsMode: paymentsMode(),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.academyId || user.role !== "teacher") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const action = body?.action as string;
  const msisdn = body?.msisdn ? String(body.msisdn) : undefined;
  const momoProvider = body?.momoProvider ? String(body.momoProvider) : undefined;

  if (action === "subscribe") {
    const planId = body.planId as PlanId;
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "invalid_plan" }, { status: 400 });

    const provider = getPaymentProvider();
    const pay = await provider.initiate({
      amount: plan.priceCdf,
      currency: "CDF",
      msisdn,
      momoProvider,
      description: `Yekola ${plan.name}`.slice(0, 22),
      kind: "teacher_subscription",
    });

    if (pay.status === "failed") {
      return NextResponse.json(
        { error: "payment_failed", message: pay.message, pay },
        { status: 402 },
      );
    }

    const intent = pushIntent({
      pay,
      userId: user.id,
      kind: "teacher_subscription",
      amountCdf: plan.priceCdf,
      academyId: user.academyId,
      planId,
    });

    if (pay.status === "demo" || pay.status === "paid" || plan.priceCdf === 0) {
      fulfillPaymentIntent(intent.reference);
      return NextResponse.json({
        ok: true,
        payment: { ...pay, status: "paid" },
        plan,
        pending: false,
      });
    }

    return NextResponse.json({
      ok: true,
      payment: pay,
      plan,
      pending: true,
      reference: pay.reference,
    });
  }

  if (action === "withdraw") {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
    }
    const sudo = await assertSudoOrPasskey({
      userId: user.id,
      passkeyChallengeId: body?.passkeyChallengeId ? String(body.passkeyChallengeId) : null,
      passkeyResponse: body?.passkeyResponse,
    });
    if (!sudo.ok) {
      return NextResponse.json(
        { error: sudo.error, message: "Validez SUDO (passkey) pour retirer." },
        { status: 403 },
      );
    }
    const db = getDb();
    const academy = db.academies.find((a) => a.id === user.academyId)!;
    if (amount > academy.walletBalanceCdf) {
      return NextResponse.json({ error: "insufficient_balance" }, { status: 400 });
    }

    const provider = getPaymentProvider();
    const pay = await provider.initiate({
      amount,
      currency: "CDF",
      msisdn,
      momoProvider,
      description: "Retrait Yekola",
      kind: "withdrawal",
    });

    if (pay.status === "failed") {
      return NextResponse.json(
        { error: "payment_failed", message: pay.message, pay },
        { status: 402 },
      );
    }

    // Hold balance immediately for pending/demo payouts
    mutateDb((d) => {
      const a = d.academies.find((x) => x.id === user.academyId!);
      if (a) a.walletBalanceCdf -= amount;
    });

    const intent = pushIntent({
      pay,
      userId: user.id,
      kind: "withdrawal",
      amountCdf: amount,
      academyId: user.academyId,
    });

    if (pay.status === "demo" || pay.status === "paid") {
      fulfillPaymentIntent(intent.reference);
      return NextResponse.json({
        ok: true,
        payment: { ...pay, status: "paid" },
        pending: false,
      });
    }

    return NextResponse.json({
      ok: true,
      payment: pay,
      pending: true,
      reference: pay.reference,
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

function pushIntent(args: {
  pay: {
    reference: string;
    status: PaymentIntent["status"];
    message: string;
    provider: string;
    msisdn?: string;
    momoProvider?: string;
  };
  userId: string;
  kind: PaymentIntent["kind"];
  amountCdf: number;
  academyId?: string;
  courseId?: string;
  planId?: PlanId;
}): PaymentIntent {
  const now = new Date().toISOString();
  const intent: PaymentIntent = {
    id: newId("pay"),
    reference: args.pay.reference,
    kind: args.kind,
    status: args.pay.status,
    amountCdf: args.amountCdf,
    currency: "CDF",
    msisdn: args.pay.msisdn ?? null,
    momoProvider: args.pay.momoProvider ?? null,
    userId: args.userId,
    courseId: args.courseId ?? null,
    academyId: args.academyId ?? null,
    planId: args.planId ?? null,
    provider: args.pay.provider,
    message: args.pay.message,
    createdAt: now,
    updatedAt: now,
    fulfilledAt: null,
  };
  mutateDb((d) => {
    d.payments.push(intent);
  });
  return intent;
}
