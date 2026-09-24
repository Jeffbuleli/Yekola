import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CourseHead } from "@/components/course-card";
import { getCurrentUser } from "@/lib/auth/session";
import { enrollmentFor, getCourseBySlug } from "@/lib/db/queries";
import { BuyCourseButton } from "@/components/buy-course-button";
import { formatFc } from "@/lib/plans";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  const enrolled = user ? enrollmentFor(user.id, course.id) : null;

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <CourseHead
          coverIcon={course.coverIcon}
          title={course.title}
          detail={course.tagline}
          size={32}
        />
        <p className="mt-4 text-sm text-[var(--yk-muted)]">
          Par <strong className="text-[var(--yk-ink)]">{course.teacher?.name}</strong> ·{" "}
          {course.academy?.name} · {course.academy?.city}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <p className="font-display text-3xl font-bold text-[var(--yk-amber)]">
            {formatFc(course.priceCdf)}
          </p>
          {enrolled ? (
            <Link href={`/learn/${course.id}`} className="yk-btn yk-btn-primary w-full sm:w-auto">
              Continuer le cours
            </Link>
          ) : user ? (
            <BuyCourseButton courseId={course.id} priceCdf={course.priceCdf} />
          ) : (
            <Link
              href={`/auth/login?email=patty@yekola.demo`}
              className="yk-btn yk-btn-primary w-full sm:w-auto"
            >
              Se connecter pour acheter
            </Link>
          )}
        </div>
        <p className="mt-3 text-sm text-[var(--yk-muted)]">
          Après achat : accès immédiat + téléchargement du pack hors ligne.
        </p>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">
            Contenu du cours
          </h2>
          <ol className="mt-4 space-y-3">
            {course.modules.map((m) => (
              <li key={m.id} className="yk-card">
                <p className="font-display font-bold">
                  Module {m.order} - {m.title}
                </p>
                <p className="mt-1 text-sm text-[var(--yk-muted)]">{m.summary}</p>
                <p className="mt-2 text-xs text-[var(--yk-muted)]">
                  {m.lessons.length} leçon{m.lessons.length > 1 ? "s" : ""}
                  {m.quiz.length > 0 ? ` · ${m.quiz.length} question(s)` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">Description</h2>
          <p className="mt-2 whitespace-pre-wrap text-[var(--yk-ink)]">{course.description}</p>
        </section>
      </main>
    </div>
  );
}
