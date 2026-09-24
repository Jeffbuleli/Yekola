import { getDb } from "@/lib/db/store";
import { getPlan } from "@/lib/plans";

export function academyAnalytics(academyId: string) {
  const db = getDb();
  const courses = db.courses.filter((c) => c.academyId === academyId);
  const enrollments = db.enrollments.filter((e) => e.academyId === academyId);
  const courseIds = new Set(courses.map((c) => c.id));
  const progress = db.progress.filter((p) => courseIds.has(p.courseId));
  const certificates = db.certificates.filter((c) => courseIds.has(c.courseId));
  const academy = db.academies.find((a) => a.id === academyId);
  const plan = academy ? getPlan(academy.planId) : null;

  const byCourse = courses.map((course) => {
    const sales = enrollments.filter((e) => e.courseId === course.id);
    const prog = progress.filter((p) => p.courseId === course.id);
    const avg =
      prog.length === 0
        ? 0
        : Math.round(prog.reduce((s, p) => s + p.percent, 0) / prog.length);
    const completed = prog.filter((p) => p.percent >= 100).length;
    const revenue = sales.reduce((s, e) => s + e.teacherNetCdf, 0);
    const certs = certificates.filter((c) => c.courseId === course.id).length;
    return {
      courseId: course.id,
      title: course.title,
      status: course.status,
      priceCdf: course.priceCdf,
      sales: sales.length,
      revenueCdf: revenue,
      avgProgress: avg,
      completed,
      certificates: certs,
      learners: sales.map((e) => {
        const learner = db.users.find((u) => u.id === e.userId);
        const p = prog.find((x) => x.userId === e.userId);
        return {
          id: e.userId,
          name: learner?.name ?? "Apprenant",
          email: learner?.email ?? "",
          percent: p?.percent ?? 0,
          purchasedAt: e.purchasedAt,
        };
      }),
    };
  });

  return {
    publishedCourses: courses.filter((c) => c.status === "published").length,
    draftCourses: courses.filter((c) => c.status === "draft").length,
    sales: enrollments.length,
    revenueCdf: enrollments.reduce((s, e) => s + e.teacherNetCdf, 0),
    walletBalanceCdf: academy?.walletBalanceCdf ?? 0,
    certificatesIssued: certificates.length,
    avgProgress:
      progress.length === 0
        ? 0
        : Math.round(progress.reduce((s, p) => s + p.percent, 0) / progress.length),
    plan,
    byCourse,
    recentSales: enrollments
      .slice()
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt))
      .slice(0, 20)
      .map((e) => {
        const course = db.courses.find((c) => c.id === e.courseId);
        const learner = db.users.find((u) => u.id === e.userId);
        return {
          id: e.id,
          learnerName: learner?.name ?? "Apprenant",
          courseTitle: course?.title ?? "Cours",
          netCdf: e.teacherNetCdf,
          purchasedAt: e.purchasedAt,
        };
      }),
    recentCertificates: certificates
      .slice()
      .reverse()
      .slice(0, 10),
  };
}
