import { newId } from "@/lib/auth/crypto";
import { getDb, mutateDb } from "@/lib/db/store";
import { getPlan } from "@/lib/plans";
import { notifyPurchase } from "@/lib/email/notify";
import type {
  Enrollment,
  PaymentIntent,
  PlanId,
  SubscriptionPayment,
  WalletTx,
} from "@/lib/types";

/** Applique les effets métier d'un paiement réussi (idempotent). */
export function fulfillPaymentIntent(reference: string): {
  ok: boolean;
  intent: PaymentIntent | null;
  error?: string;
} {
  const db = getDb();
  const intent = db.payments.find((p) => p.reference === reference) ?? null;
  if (!intent) return { ok: false, intent: null, error: "not_found" };
  if (intent.status === "paid" && intent.fulfilledAt) {
    return { ok: true, intent };
  }
  if (intent.status === "failed") {
    return { ok: false, intent, error: "failed" };
  }

  let resultIntent: PaymentIntent = intent;
  let purchaseNotify: {
    to: string;
    name: string;
    courseTitle: string;
    amountCdf: number;
    courseId: string;
  } | null = null;

  mutateDb((d) => {
    const p = d.payments.find((x) => x.reference === reference);
    if (!p) return;
    if (p.fulfilledAt) {
      resultIntent = p;
      return;
    }

    const now = new Date().toISOString();

    if (p.kind === "course_purchase" && p.courseId) {
      const course = d.courses.find((c) => c.id === p.courseId);
      const academy = course
        ? d.academies.find((a) => a.id === course.academyId)
        : null;
      const user = d.users.find((u) => u.id === p.userId);
      if (!course || !academy || !user) {
        p.status = "failed";
        p.message = "Données cours/académie introuvables";
        p.updatedAt = now;
        resultIntent = p;
        return;
      }
      const already = d.enrollments.some(
        (e) => e.userId === p.userId && e.courseId === p.courseId,
      );
      if (!already) {
        const plan = getPlan(academy.planId);
        const fee = Math.round(course.priceCdf * (plan.commissionPercent / 100));
        const net = course.priceCdf - fee;
        const enrollment: Enrollment = {
          id: newId("enr"),
          userId: p.userId,
          courseId: course.id,
          academyId: academy.id,
          amountPaidCdf: course.priceCdf,
          platformFeeCdf: fee,
          teacherNetCdf: net,
          paymentRef: p.reference,
          paymentProvider: p.provider,
          offlinePackUnlocked: true,
          purchasedAt: now,
        };
        d.enrollments.push(enrollment);
        const tx: WalletTx = {
          id: newId("wtx"),
          academyId: academy.id,
          type: "sale",
          amountCdf: net,
          description: `Vente : ${course.title} → ${user.name}`,
          reference: p.reference,
          createdAt: now,
        };
        d.walletTx.push(tx);
        academy.walletBalanceCdf += net;
        purchaseNotify = {
          to: user.email,
          name: user.name,
          courseTitle: course.title,
          amountCdf: course.priceCdf,
          courseId: course.id,
        };
      }
    }

    if (p.kind === "teacher_subscription" && p.academyId && p.planId) {
      const academy = d.academies.find((a) => a.id === p.academyId);
      if (!academy) {
        p.status = "failed";
        p.message = "Académie introuvable";
        p.updatedAt = now;
        resultIntent = p;
        return;
      }
      const planId = p.planId as PlanId;
      academy.planId = planId;
      academy.subscriptionStatus = "active";
      academy.subscriptionExpiresAt = new Date(Date.now() + 30 * 864e5).toISOString();
      const sub: SubscriptionPayment = {
        id: newId("sub"),
        academyId: academy.id,
        planId,
        amountCdf: p.amountCdf,
        provider: p.provider,
        reference: p.reference,
        status: p.status === "demo" ? "demo" : "paid",
        createdAt: now,
      };
      d.subscriptions.push(sub);
      if (p.amountCdf > 0) {
        d.walletTx.push({
          id: newId("wtx"),
          academyId: academy.id,
          type: "subscription",
          amountCdf: -p.amountCdf,
          description: `Abonnement ${getPlan(planId).name}`,
          reference: p.reference,
          createdAt: now,
        });
      }
    }

    if (p.kind === "withdrawal" && p.academyId) {
      // Solde déjà débité à l'initiation ; on enregistre juste le succès
      const exists = d.walletTx.some((t) => t.reference === p.reference);
      if (!exists) {
        d.walletTx.push({
          id: newId("wtx"),
          academyId: p.academyId,
          type: "withdrawal",
          amountCdf: -p.amountCdf,
          description: `Retrait Mobile Money`,
          reference: p.reference,
          createdAt: now,
        });
      }
    }

    p.status = "paid";
    p.fulfilledAt = now;
    p.updatedAt = now;
    p.message = "Paiement confirmé";
    resultIntent = p;
  });

  if (purchaseNotify) {
    void notifyPurchase(purchaseNotify);
  }

  return { ok: true, intent: resultIntent };
}

export function markPaymentFailed(reference: string, message: string) {
  mutateDb((d) => {
    const p = d.payments.find((x) => x.reference === reference);
    if (!p || p.status === "paid") return;
    const now = new Date().toISOString();
    // Refund held withdrawal
    if (p.kind === "withdrawal" && p.academyId && p.status === "pending") {
      const a = d.academies.find((x) => x.id === p.academyId);
      if (a) a.walletBalanceCdf += p.amountCdf;
      d.walletTx.push({
        id: newId("wtx"),
        academyId: p.academyId,
        type: "fee",
        amountCdf: p.amountCdf,
        description: `Annulation retrait échoué (${reference})`,
        reference: `${reference}-refund`,
        createdAt: now,
      });
    }
    p.status = "failed";
    p.message = message;
    p.updatedAt = now;
  });
}
