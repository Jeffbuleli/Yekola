import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CourseCoverIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { academyStats, enrichCourse } from "@/lib/db/queries";
import { formatFc } from "@/lib/plans";
import { MeetJoinButton } from "@/components/meet-join-button";
import { LogoutButton } from "@/components/logout-button";
import { togglePublishCourse } from "./actions";

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "teacher" || !user.academyId) redirect("/learn");

  const db = getDb();
  const academy = db.academies.find((a) => a.id === user.academyId)!;
  const stats = academyStats(academy.id);
  const courses = db.courses
    .filter((c) => c.academyId === academy.id)
    .map(enrichCourse);

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="yk-shell py-8 sm:py-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--yk-amber)]">
              Studio enseignant
            </p>
            <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
              {academy.name}
            </h1>
            <p className="mt-1 text-sm text-[var(--yk-muted)]">
              Plan {stats.plan?.name} · {academy.city} · Bonjour {user.name}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Link
              href="/studio/courses/new"
              className="yk-btn yk-btn-primary col-span-2 sm:col-span-1"
            >
              Nouveau cours
            </Link>
            <Link href="/studio/billing" className="yk-btn yk-btn-ghost">
              Abonnement
            </Link>
            <Link href="/studio/wallet" className="yk-btn yk-btn-ghost">
              Portefeuille
            </Link>
            <Link href="/studio/analytics" className="yk-btn yk-btn-ghost">
              Stats
            </Link>
            <Link href="/studio/ai" className="yk-btn yk-btn-ghost">
              IA
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[
            { l: "Cours publiés", v: stats.publishedCourses },
            { l: "Brouillons", v: stats.draftCourses },
            { l: "Ventes", v: stats.sales },
            { l: "Portefeuille", v: formatFc(stats.walletBalanceCdf) },
          ].map((s) => (
            <div key={s.l} className="yk-card">
              <p className="text-xs uppercase text-[var(--yk-muted)]">{s.l}</p>
              <p className="font-display mt-1 text-xl font-bold text-[var(--yk-forest)] sm:text-2xl">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">Mes cours</h2>
          <div className="mt-4 space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="yk-card">
                <div className="flex items-start gap-3">
                  <CourseCoverIcon name={c.coverIcon} size={22} />
                  <p className="min-w-0 flex-1 font-display font-bold leading-snug text-[var(--yk-forest)]">
                    {c.title}
                  </p>
                </div>
                <p className="mt-2 text-sm text-[var(--yk-muted)]">
                  {c.status === "published" ? "Publié" : "Brouillon"} · {formatFc(c.priceCdf)} · /
                  {c.slug}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <MeetJoinButton courseId={c.id} />
                  {c.status === "published" && (
                    <Link href={`/courses/${c.slug}`} className="yk-btn yk-btn-ghost !py-2 !text-xs">
                      Voir
                    </Link>
                  )}
                  <form action={togglePublishCourse.bind(null, c.id)}>
                    <button type="submit" className="yk-btn yk-btn-secondary !py-2 !text-xs">
                      {c.status === "published" ? "Dépublier" : "Publier"}
                    </button>
                  </form>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-[var(--yk-muted)]">
                Aucun cours.{" "}
                <Link href="/studio/courses/new" className="font-bold text-[var(--yk-teal)]">
                  Créer le premier
                </Link>
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
