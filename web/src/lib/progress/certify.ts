import { newId } from "@/lib/auth/crypto";
import type { Certificate, Course, DbShape, ProgressRecord, User } from "@/lib/types";

export const QUIZ_PASS_THRESHOLD = 70;

export type ProgressEval = {
  lessonTotal: number;
  lessonDone: number;
  quizTotal: number;
  quizPassed: number;
  quizScores: Record<string, number>;
  lessonsComplete: boolean;
  quizzesComplete: boolean;
  percent: number;
  eligibleForCertificate: boolean;
};

export function quizModuleIds(course: Course): string[] {
  return course.modules.filter((m) => (m.quiz?.length ?? 0) > 0).map((m) => m.id);
}

export function evaluateProgress(
  course: Course,
  progress: Pick<ProgressRecord, "completedLessonIds" | "quizScores">,
): ProgressEval {
  const allLessons = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const lessonDone = progress.completedLessonIds.filter((id) =>
    allLessons.includes(id),
  ).length;
  const lessonTotal = Math.max(allLessons.length, 1);
  const qIds = quizModuleIds(course);
  const quizTotal = qIds.length;
  let quizPassed = 0;
  for (const id of qIds) {
    const score = progress.quizScores[id];
    if (typeof score === "number" && score >= QUIZ_PASS_THRESHOLD) quizPassed++;
  }
  const lessonsComplete = lessonDone >= allLessons.length && allLessons.length > 0;
  const quizzesComplete = quizTotal === 0 || quizPassed === quizTotal;

  // Barre : 70 % leçons + 30 % quiz (si aucun quiz → 100 % leçons)
  let percent: number;
  if (quizTotal === 0) {
    percent = Math.round((lessonDone / lessonTotal) * 100);
  } else {
    const lessonPart = (lessonDone / lessonTotal) * 70;
    const quizPart = (quizPassed / quizTotal) * 30;
    percent = Math.round(lessonPart + quizPart);
  }

  return {
    lessonTotal: allLessons.length,
    lessonDone,
    quizTotal,
    quizPassed,
    quizScores: { ...progress.quizScores },
    lessonsComplete,
    quizzesComplete,
    percent: Math.min(100, percent),
    eligibleForCertificate: lessonsComplete && quizzesComplete,
  };
}

export function ensureProgressRow(
  d: DbShape,
  userId: string,
  courseId: string,
): ProgressRecord {
  let p = d.progress.find((x) => x.userId === userId && x.courseId === courseId);
  if (!p) {
    p = {
      id: newId("prg"),
      userId,
      courseId,
      lessonId: null,
      completedLessonIds: [],
      quizScores: {},
      percent: 0,
      updatedAt: new Date().toISOString(),
    };
    d.progress.push(p);
  }
  return p;
}

export function recomputeAndMaybeCertify(args: {
  d: DbShape;
  user: User;
  course: Course;
  progress: ProgressRecord;
}): Certificate | null {
  const evald = evaluateProgress(args.course, args.progress);
  args.progress.percent = evald.percent;
  args.progress.updatedAt = new Date().toISOString();

  if (!evald.eligibleForCertificate) return null;

  const existing = args.d.certificates.find(
    (c) => c.userId === args.user.id && c.courseId === args.course.id,
  );
  if (existing) return existing;

  const academy = args.d.academies.find((a) => a.id === args.course.academyId);
  const teacher = academy
    ? args.d.users.find((u) => u.id === academy.ownerId)
    : null;
  const code = makeCertCode(args.course.slug, args.user.id);
  const cert: Certificate = {
    id: newId("crt"),
    code,
    userId: args.user.id,
    courseId: args.course.id,
    learnerName: args.user.name,
    courseTitle: args.course.title,
    academyName: academy?.name ?? "Yekola",
    teacherName: teacher?.name ?? "Formateur",
    skills: args.course.modules.map((m) => m.title),
    issuedAt: new Date().toISOString().slice(0, 10),
    overallQuizAverage: averageQuizScore(args.progress.quizScores, args.course),
  };
  args.d.certificates.push(cert);
  return cert;
}

function averageQuizScore(scores: Record<string, number>, course: Course) {
  const ids = quizModuleIds(course);
  if (ids.length === 0) return 100;
  const vals = ids.map((id) => scores[id] ?? 0);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function makeCertCode(slug: string, userId: string) {
  const a = slug.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase() || "YK";
  const b = userId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();
  const c = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YK-${a}-${b}-${c}`;
}
