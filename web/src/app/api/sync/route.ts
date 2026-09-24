import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";
import { mutateDb, getDb } from "@/lib/db/store";
import type { Certificate, ProgressRecord } from "@/lib/types";

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

        let p = d.progress.find((x) => x.userId === user.id && x.courseId === courseId);
        if (!p) {
          p = {
            id: newId("prg"),
            userId: user.id,
            courseId,
            lessonId: null,
            completedLessonIds: [],
            quizScores: {},
            percent: 0,
            updatedAt: new Date().toISOString(),
          } satisfies ProgressRecord;
          d.progress.push(p);
        }

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
            p.quizScores[quizModuleId] = quizScore;
          }
        }

        const allLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
        p.percent = Math.round(
          (p.completedLessonIds.length / Math.max(allLessons.length, 1)) * 100,
        );
        p.updatedAt = new Date().toISOString();

        if (p.percent >= 100) {
          const existing = d.certificates.find(
            (c) => c.userId === user.id && c.courseId === courseId,
          );
          if (!existing) {
            const academy = d.academies.find((a) => a.id === course.academyId);
            const teacher = academy
              ? d.users.find((u) => u.id === academy.ownerId)
              : null;
            const cert: Certificate = {
              id: newId("crt"),
              code: `YK-${course.slug.slice(0, 8).toUpperCase()}-${user.id.slice(-4).toUpperCase()}`,
              userId: user.id,
              courseId,
              learnerName: user.name,
              courseTitle: course.title,
              academyName: academy?.name ?? "Yekola",
              teacherName: teacher?.name ?? "Formateur",
              skills: course.modules.map((m) => m.title),
              issuedAt: new Date().toISOString().slice(0, 10),
            };
            d.certificates.push(cert);
          }
        }
      }

      accepted.push(id);
    }
  });

  // Touch getDb so in-memory is consistent after mutate
  getDb();

  return NextResponse.json({ accepted, applied: accepted.length });
}
