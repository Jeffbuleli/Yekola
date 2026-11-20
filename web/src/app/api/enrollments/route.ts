import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";
import { getDb, mutateDb } from "@/lib/db/store";
import { getPlan } from "@/lib/plans";
import { getPaymentProvider, paymentsMode } from "@/lib/payments/provider";
import { fulfillPaymentIntent } from "@/lib/payments/fulfill";
import { enrichCourse, enrollmentFor } from "@/lib/db/queries";
import type { PaymentIntent } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const db = getDb();
  const items = db.enrollments
    .filter((e) => e.userId === user.id)
    .map((e) => {
      const course = db.courses.find((c) => c.id === e.courseId);
      return {
        enrollment: e,
        course: course ? enrichCourse(course) : null,
      };
    });
  return NextResponse.json({ enrollments: items, paymentsMode: paymentsMode() });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const rawId = String(body?.courseId ?? "").trim();
  const rawSlug = String(body?.slug ?? "").trim();
  const msisdn = body?.msisdn ? String(body.msisdn) : undefined;
  const momoProvider = body?.momoProvider ? String(body.momoProvider) : undefined;
  const db = getDb();
  const published = db.courses.filter((c) => c.status === "published");
  const course =
    published.find((c) => rawId && c.id === rawId) ||
    published.find((c) => rawId && c.slug === rawId) ||
    published.find((c) => rawSlug && c.slug === rawSlug) ||
    published.find((c) => rawSlug && c.id === rawSlug);
  if (!course) {
    return NextResponse.json(
      {
        error: "course_not_found",
        message: "Cours introuvable ou pas encore publié. Rafraîchissez la page et réessayez.",
      },
      { status: 404 },
    );
  }
  const courseId = course.id;

  if (enrollmentFor(user.id, courseId)) {
    return NextResponse.json({ error: "already_enrolled" }, { status: 409 });
  }

  const academy = db.academies.find((a) => a.id === course.academyId);
  if (!academy) return NextResponse.json({ error: "academy_missing" }, { status: 400 });

  // Enseignant : pas d'achat de ses propres cours (même académie)
  if (user.academyId && user.academyId === course.academyId) {
    return NextResponse.json(
      {
        error: "own_course",
        message: "Vous ne pouvez pas acheter un cours de votre propre académie.",
      },
      { status: 403 },
    );
  }
  if (user.id === academy.ownerId) {
    return NextResponse.json(
      {
        error: "own_course",
        message: "Vous ne pouvez pas acheter un cours de votre propre académie.",
      },
      { status: 403 },
    );
  }
  // Admin : consultation / modération uniquement
  if (user.role === "admin") {
    return NextResponse.json(
      {
        error: "admin_no_purchase",
        message: "Le compte admin valide le contenu ; il n’achète pas de cours.",
      },
      { status: 403 },
    );
  }

  // Free course → instant
  if (course.priceCdf <= 0) {
    const pay = await getPaymentProvider().initiate({
      amount: 0,
      currency: "CDF",
      description: `Cours ${course.title}`,
      kind: "course_purchase",
    });
    const intent = createIntentRecord({
      pay,
      userId: user.id,
      kind: "course_purchase",
      amountCdf: 0,
      courseId: course.id,
      academyId: academy.id,
    });
    fulfillPaymentIntent(intent.reference);
    return NextResponse.json({
      enrollment: getDb().enrollments.find(
        (e) => e.userId === user.id && e.courseId === course.id,
      ),
      payment: { ...pay, status: "paid" },
      course: enrichCourse(course),
    });
  }

  const provider = getPaymentProvider();
  const pay = await provider.initiate({
    amount: course.priceCdf,
    currency: "CDF",
    msisdn,
    momoProvider,
    description: `Cours ${course.title}`.slice(0, 40),
    kind: "course_purchase",
  });

  if (pay.status === "failed") {
    return NextResponse.json(
      { error: "payment_failed", message: pay.message, pay },
      { status: 402 },
    );
  }

  const intent = createIntentRecord({
    pay,
    userId: user.id,
    kind: "course_purchase",
    amountCdf: course.priceCdf,
    courseId: course.id,
    academyId: academy.id,
  });

  // Demo or already paid → fulfill now
  if (pay.status === "demo" || pay.status === "paid") {
    fulfillPaymentIntent(intent.reference);
    const enrollment = getDb().enrollments.find(
      (e) => e.userId === user.id && e.courseId === course.id,
    );
    return NextResponse.json({
      enrollment,
      payment: { ...pay, status: "paid" },
      course: enrichCourse(course),
      pending: false,
    });
  }

  // MoMo pending — wait for webhook / poll
  return NextResponse.json({
    enrollment: null,
    payment: pay,
    course: enrichCourse(course),
    pending: true,
    reference: pay.reference,
    planHint: getPlan(academy.planId).name,
  });
}

function createIntentRecord(args: {
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
  courseId?: string;
  academyId?: string;
  planId?: PaymentIntent["planId"];
}): PaymentIntent {
  const now = new Date().toISOString();
  const intent: PaymentIntent = {
    id: newId("pay"),
    reference: args.pay.reference,
    kind: args.kind,
    status: args.pay.status === "demo" ? "demo" : args.pay.status,
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
