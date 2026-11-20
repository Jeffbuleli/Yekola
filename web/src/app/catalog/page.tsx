import { SiteHeader } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { getCurrentUser } from "@/lib/auth/session";
import { listPublishedCourses } from "@/lib/db/queries";
import { getDb } from "@/lib/db/store";
import { evaluateProgress } from "@/lib/progress/certify";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogue - Yekola",
  description: "Achetez un cours et apprenez hors ligne après l’achat.",
};

export default async function CatalogPage() {
  const courses = listPublishedCourses();
  const user = await getCurrentUser();
  const db = getDb();

  const enrolledIds = new Set(
    user
      ? db.enrollments.filter((e) => e.userId === user.id).map((e) => e.courseId)
      : [],
  );
  const certIds = new Set(
    user
      ? db.certificates.filter((c) => c.userId === user.id).map((c) => c.courseId)
      : [],
  );

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="yk-shell py-8 sm:py-10">
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
          Catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--yk-muted)] sm:text-base">
          Achetez un cours pour y accéder et télécharger le pack hors ligne.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            let badge: string | null = null;
            let badgeTone: "done" | "progress" | "owned" | null = null;
            if (certIds.has(c.id)) {
              badge = "Achevé";
              badgeTone = "done";
            } else if (enrolledIds.has(c.id)) {
              const progress = db.progress.find(
                (p) => p.userId === user!.id && p.courseId === c.id,
              );
              const evald = evaluateProgress(c, progress ?? {
                completedLessonIds: [],
                quizScores: {},
              });
              if (evald.percent > 0) {
                badge = `En cours · ${evald.percent}%`;
                badgeTone = "progress";
              } else {
                badge = "Acheté";
                badgeTone = "owned";
              }
            }
            return (
              <CourseCard
                key={c.id}
                href={
                  enrolledIds.has(c.id) ? `/learn/${c.id}` : `/courses/${c.slug}`
                }
                coverIcon={c.coverIcon}
                coverImage={c.coverImage}
                title={c.title}
                detail={c.tagline}
                meta={`${c.academy?.name ?? ""} · ${c.lessonCount} leçons${c.liveRequired ? " · Live" : ""}`}
                priceCdf={enrolledIds.has(c.id) ? undefined : c.priceCdf}
                liveRequired={c.liveRequired}
                badge={badge}
                badgeTone={badgeTone}
              />
            );
          })}
          {courses.length === 0 && (
            <p className="text-[var(--yk-muted)]">Aucun cours publié pour le moment.</p>
          )}
        </div>
      </main>
    </div>
  );
}
