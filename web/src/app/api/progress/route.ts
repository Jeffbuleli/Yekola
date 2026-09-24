import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { newId } from "@/lib/auth/crypto";
import { getDb, mutateDb } from "@/lib/db/store";
import { enrollmentFor } from "@/lib/db/queries";
import type { Certificate } from "@/lib/types";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const courseId = new URL(req.url).searchParams.get("courseId");
  const db = getDb();
  if (courseId) {
    const p = db.progress.find((x) => x.userId === user.id && x.courseId === courseId);
    return NextResponse.json({ progress: p ?? null });
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

  const allLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

  let certificate: Certificate | null = null;

  mutateDb((d) => {
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
      };
      d.progress.push(p);
    }
    if (lessonId && !p.completedLessonIds.includes(lessonId)) {
      p.completedLessonIds.push(lessonId);
    }
    if (quizModuleId != null && quizScore != null) {
      p.quizScores[quizModuleId] = quizScore;
    }
    p.lessonId = lessonId ?? p.lessonId;
    p.percent = Math.round((p.completedLessonIds.length / Math.max(allLessons.length, 1)) * 100);
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
        const code = `YK-${course.slug.slice(0, 8).toUpperCase()}-${user.id.slice(-4).toUpperCase()}`;
        certificate = {
          id: newId("crt"),
          code,
          userId: user.id,
          courseId,
          learnerName: user.name,
          courseTitle: course.title,
          academyName: academy?.name ?? "Yekola",
          teacherName: teacher?.name ?? "Formateur",
          skills: course.modules.map((m) => m.title),
          issuedAt: new Date().toISOString().slice(0, 10),
        };
        d.certificates.push(certificate);
      } else {
        certificate = existing;
      }
    }
  });

  const progress = getDb().progress.find(
    (x) => x.userId === user.id && x.courseId === courseId,
  );
  return NextResponse.json({ progress, certificate });
}
