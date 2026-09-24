import { getDb } from "./store";
import type { Academy, Course, Enrollment, User } from "@/lib/types";
import { getPlan } from "@/lib/plans";

export function publicUser(u: User) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    academyId: u.academyId,
  };
}

export function listPublishedCourses() {
  const db = getDb();
  return db.courses
    .filter((c) => c.status === "published")
    .map((c) => enrichCourse(c));
}

export function getCourseBySlug(slug: string) {
  const db = getDb();
  const c = db.courses.find((x) => x.slug === slug);
  return c ? enrichCourse(c) : null;
}

export function getCourseById(id: string) {
  const db = getDb();
  const c = db.courses.find((x) => x.id === id);
  return c ? enrichCourse(c) : null;
}

export function enrichCourse(c: Course) {
  const db = getDb();
  const academy = db.academies.find((a) => a.id === c.academyId) ?? null;
  const teacher = academy
    ? db.users.find((u) => u.id === academy.ownerId) ?? null
    : null;
  const lessonCount = c.modules.reduce((n, m) => n + m.lessons.length, 0);
  return {
    ...c,
    academy: academy
      ? { id: academy.id, name: academy.name, slug: academy.slug, city: academy.city }
      : null,
    teacher: teacher ? { id: teacher.id, name: teacher.name } : null,
    lessonCount,
  };
}

export function getAcademyForUser(userId: string): Academy | null {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user?.academyId) return null;
  return db.academies.find((a) => a.id === user.academyId) ?? null;
}

export function enrollmentFor(userId: string, courseId: string): Enrollment | null {
  const db = getDb();
  return (
    db.enrollments.find((e) => e.userId === userId && e.courseId === courseId) ?? null
  );
}

export function userEnrollments(userId: string) {
  const db = getDb();
  return db.enrollments
    .filter((e) => e.userId === userId)
    .map((e) => {
      const course = db.courses.find((c) => c.id === e.courseId);
      return { enrollment: e, course: course ? enrichCourse(course) : null };
    });
}

export function academyStats(academyId: string) {
  const db = getDb();
  const courses = db.courses.filter((c) => c.academyId === academyId);
  const enrollments = db.enrollments.filter((e) => e.academyId === academyId);
  const revenue = enrollments.reduce((s, e) => s + e.teacherNetCdf, 0);
  const academy = db.academies.find((a) => a.id === academyId);
  const plan = academy ? getPlan(academy.planId) : null;
  return {
    publishedCourses: courses.filter((c) => c.status === "published").length,
    pendingCourses: courses.filter((c) => c.status === "pending_review").length,
    draftCourses: courses.filter((c) => c.status === "draft" || c.status === "rejected").length,
    sales: enrollments.length,
    revenueCdf: revenue,
    walletBalanceCdf: academy?.walletBalanceCdf ?? 0,
    plan,
  };
}

export function buildOfflinePack(courseId: string) {
  const course = getCourseById(courseId);
  if (!course) return null;
  return {
    version: 1,
    courseId: course.id,
    slug: course.slug,
    title: course.title,
    downloadedAt: new Date().toISOString(),
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        minutes: l.minutes,
        body: l.body,
        order: l.order,
        media: l.media ?? [],
      })),
      quiz: m.quiz.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices,
        // correctIndex omitted from client pack until after attempt sync —
        // actually learners need to score offline; include it in pack (trusted device).
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
    })),
  };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}
