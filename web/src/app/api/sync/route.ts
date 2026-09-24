import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { mutateDb, getDb } from "@/lib/db/store";
import {
  ensureProgressRow,
  evaluateProgress,
  recomputeAndMaybeCertify,
} from "@/lib/progress/certify";

/**
 * Sync offline → serveur.
 * Idempotent par event.id. Applique leçons terminées et scores quiz.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const events = Array.isArray(body?.events) ? body.events : [];
  const accepted: string[] = [];

  mutateDb((d) => {
    for (const ev of events) {
      const id = String(ev?.id ?? "");
      if (!id) continue;

      const already = d.syncAccepted.some((s) => s.id === id);
      if (!already) {
        d.syncAccepted.push({ id, acceptedAt: new Date().toISOString() });

        const type = String(ev?.type ?? "");
        const payload = (ev?.payload ?? {}) as Record<string, unknown>;
        const courseId = String(payload.courseId ?? "");
        if (!courseId) {
          accepted.push(id);
          continue;
        }

        const enrolled = d.enrollments.some(
          (e) => e.userId === user.id && e.courseId === courseId,
        );
        if (!enrolled) {
          accepted.push(id);
          continue;
        }

        const course = d.courses.find((c) => c.id === courseId);
        if (!course) {
          accepted.push(id);
          continue;
        }

        const p = ensureProgressRow(d, user.id, courseId);

        if (type === "LESSON_COMPLETED") {
          const lessonId = String(payload.lessonId ?? "");
          if (lessonId && !p.completedLessonIds.includes(lessonId)) {
            p.completedLessonIds.push(lessonId);
          }
          p.lessonId = lessonId || p.lessonId;
        }

        if (type === "QUIZ_ATTEMPT_CREATED") {
          const quizModuleId = String(payload.quizModuleId ?? "");
          const quizScore =
            typeof payload.quizScore === "number" ? payload.quizScore : null;
          if (quizModuleId && quizScore != null) {
            const prev = p.quizScores[quizModuleId];
            if (prev == null || quizScore > prev) {
              p.quizScores[quizModuleId] = quizScore;
            }
          }
        }

        const evald = evaluateProgress(course, p);
        p.percent = evald.percent;
        p.updatedAt = new Date().toISOString();
        recomputeAndMaybeCertify({ d, user, course, progress: p });
      }

      accepted.push(id);
    }
  });

  getDb();
  return NextResponse.json({ accepted, applied: accepted.length });
}
