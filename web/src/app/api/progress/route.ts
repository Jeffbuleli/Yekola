import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, mutateDb } from "@/lib/db/store";
import { enrollmentFor } from "@/lib/db/queries";
import {
  ensureProgressRow,
  evaluateProgress,
  QUIZ_PASS_THRESHOLD,
  recomputeAndMaybeCertify,
} from "@/lib/progress/certify";
import type { Certificate } from "@/lib/types";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const courseId = new URL(req.url).searchParams.get("courseId");
  const db = getDb();
  if (courseId) {
    const p = db.progress.find((x) => x.userId === user.id && x.courseId === courseId);
    const course = db.courses.find((c) => c.id === courseId);
    const evald = course && p ? evaluateProgress(course, p) : null;
    const cert = db.certificates.find(
      (c) => c.userId === user.id && c.courseId === courseId,
    );
    return NextResponse.json({
      progress: p ?? null,
      evaluation: evald,
      certificate: cert ?? null,
      quizPassThreshold: QUIZ_PASS_THRESHOLD,
    });
  }
  return NextResponse.json({
    progress: db.progress.filter((x) => x.userId === user.id),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const courseId = String(body?.courseId ?? "");
  const lessonId = body?.lessonId ? String(body.lessonId) : null;
  const quizModuleId = body?.quizModuleId ? String(body.quizModuleId) : null;
  const quizScore = typeof body?.quizScore === "number" ? body.quizScore : null;

  if (!enrollmentFor(user.id, courseId)) {
    return NextResponse.json({ error: "not_enrolled" }, { status: 403 });
  }

  const db = getDb();
  const course = db.courses.find((c) => c.id === courseId);
  if (!course) return NextResponse.json({ error: "not_found" }, { status: 404 });

  let certificate: Certificate | null = null;
  let evaluation = null as ReturnType<typeof evaluateProgress> | null;

  mutateDb((d) => {
    const p = ensureProgressRow(d, user.id, courseId);
    if (lessonId && !p.completedLessonIds.includes(lessonId)) {
      p.completedLessonIds.push(lessonId);
    }
    if (quizModuleId != null && quizScore != null) {
      // Keep best score
      const prev = p.quizScores[quizModuleId];
      if (prev == null || quizScore > prev) {
        p.quizScores[quizModuleId] = quizScore;
      }
    }
    p.lessonId = lessonId ?? p.lessonId;
    evaluation = evaluateProgress(course, p);
    p.percent = evaluation.percent;
    p.updatedAt = new Date().toISOString();
    certificate = recomputeAndMaybeCertify({ d, user, course, progress: p });
  });

  const progress = getDb().progress.find(
    (x) => x.userId === user.id && x.courseId === courseId,
  );
  return NextResponse.json({
    progress,
    evaluation,
    certificate,
    quizPassThreshold: QUIZ_PASS_THRESHOLD,
  });
}
