import { SiteHeader } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { listPublishedCourses } from "@/lib/db/queries";

export const metadata = {
  title: "Catalogue - Yekola",
  description: "Achetez un cours et apprenez hors ligne après l’achat.",
};

export default function CatalogPage() {
  const courses = listPublishedCourses();

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
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              href={`/courses/${c.slug}`}
              coverIcon={c.coverIcon}
              title={c.title}
              detail={c.tagline}
              meta={`${c.academy?.name ?? ""} · ${c.lessonCount} leçons`}
              priceCdf={c.priceCdf}
            />
          ))}
          {courses.length === 0 && (
            <p className="text-[var(--yk-muted)]">Aucun cours publié pour le moment.</p>
          )}
        </div>
      </main>
    </div>
  );
}
