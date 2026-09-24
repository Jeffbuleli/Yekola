import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CourseCoverIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { enrichCourse } from "@/lib/db/queries";
import { formatFc } from "@/lib/plans";
import { approveCourseAction, rejectCourseAction } from "@/app/studio/actions";
import { LogoutButton } from "@/components/logout-button";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role !== "admin") {
    if (user.role === "teacher") redirect("/studio");
    redirect("/learn");
  }

  const db = getDb();
  const pending = db.courses
    .filter((c) => c.status === "pending_review")
    .map(enrichCourse);
  const published = db.courses.filter((c) => c.status === "published").length;
  const rejected = db.courses.filter((c) => c.status === "rejected").length;

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="yk-shell py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--yk-amber)]">
              Administration
            </p>
            <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
              Modération des cours
            </h1>
            <p className="mt-1 text-sm text-[var(--yk-muted)]">
              Bonjour {user.name} · validez le contenu avant publication publique
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { l: "En attente", v: pending.length },
            { l: "Publiés", v: published },
            { l: "Refusés", v: rejected },
          ].map((s) => (
            <div key={s.l} className="yk-card">
              <p className="text-xs uppercase text-[var(--yk-muted)]">{s.l}</p>
              <p className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">{s.v}</p>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">
            À valider
          </h2>
          <div className="mt-4 space-y-3">
            {pending.map((c) => (
              <article key={c.id} className="yk-card">
                <div className="flex items-start gap-3">
                  <CourseCoverIcon name={c.coverIcon} size={22} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-[var(--yk-forest)]">{c.title}</p>
                    <p className="mt-1 text-sm text-[var(--yk-muted)]">{c.tagline}</p>
                    <p className="mt-2 text-xs text-[var(--yk-muted)]">
                      {c.academy?.name} · {c.teacher?.name} · {formatFc(c.priceCdf)} ·{" "}
                      {c.lessonCount} leçons · {c.modules.length} modules
                    </p>
                  </div>
                </div>
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-[var(--yk-teal)]">
                    Aperçu du contenu
                  </summary>
                  <ol className="mt-2 space-y-2 pl-1">
                    {c.modules.map((m) => (
                      <li key={m.id}>
                        <strong>
                          Module {m.order} - {m.title}
                        </strong>
                        <ul className="ml-4 list-disc text-[var(--yk-muted)]">
                          {m.lessons.map((l) => (
                            <li key={l.id}>
                              {l.title} ({l.minutes} min)
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </details>
                <div className="mt-4 flex flex-wrap gap-2">
                  <form action={approveCourseAction.bind(null, c.id)}>
                    <button type="submit" className="yk-btn yk-btn-primary !py-2 !text-xs">
                      Approuver
                    </button>
                  </form>
                  <form action={rejectCourseAction.bind(null, c.id)}>
                    <button type="submit" className="yk-btn yk-btn-ghost !py-2 !text-xs">
                      Refuser
                    </button>
                  </form>
                  <Link
                    href={`/courses/${c.slug}?preview=1`}
                    className="yk-btn yk-btn-secondary !py-2 !text-xs"
                  >
                    Voir fiche
                  </Link>
                </div>
              </article>
            ))}
            {pending.length === 0 && (
              <p className="text-[var(--yk-muted)]">
                Aucun cours en attente. Les enseignants soumettent depuis le Studio.
              </p>
            )}
          </div>
        </section>

        <p className="mt-8 text-sm text-[var(--yk-muted)]">
          <Link href="/catalog" className="font-bold text-[var(--yk-teal)]">
            Voir le catalogue public
          </Link>
        </p>
      </main>
    </div>
  );
}
