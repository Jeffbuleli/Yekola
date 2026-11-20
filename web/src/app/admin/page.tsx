import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, ADMIN_NAV } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";
import { CourseCoverIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { enrichCourse } from "@/lib/db/queries";
import { formatFc } from "@/lib/plans";
import { approveCourseAction, rejectCourseAction } from "@/app/studio/actions";
import Image from "next/image";

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
      <SiteHeader variant="app" />
      <AppShell
      role="admin"
      userName={user.name}
      title="Modération des cours"
      subtitle="Validez le contenu avant publication publique"
      nav={ADMIN_NAV}
    >
      <div className="grid grid-cols-3 gap-3">
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

      <section className="mt-10 space-y-3">
        <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">À valider</h2>
        {pending.map((c) => (
          <article key={c.id} className="yk-card !p-0 overflow-hidden">
            {c.coverImage && (
              <div className="relative aspect-[21/9] bg-[var(--yk-line)]">
                <Image src={c.coverImage} alt="" fill className="object-cover" sizes="800px" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {!c.coverImage && <CourseCoverIcon name={c.coverIcon} size={22} />}
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-[var(--yk-forest)]">{c.title}</p>
                  <p className="mt-1 text-sm text-[var(--yk-muted)]">{c.tagline}</p>
                  <p className="mt-2 text-xs text-[var(--yk-muted)]">
                    {c.academy?.name} · {c.teacher?.name} · {formatFc(c.priceCdf)} ·{" "}
                    {c.lessonCount} leçons
                    {c.liveRequired ? " · live requis" : ""}
                  </p>
                </div>
              </div>
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
                  href={`/courses/${c.slug}`}
                  className="yk-btn yk-btn-secondary !py-2 !text-xs"
                >
                  Voir fiche
                </Link>
              </div>
            </div>
          </article>
        ))}
        {pending.length === 0 && (
          <p className="text-[var(--yk-muted)]">Aucun cours en attente.</p>
        )}
      </section>
      </AppShell>
    </div>
  );
}
