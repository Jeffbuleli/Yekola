import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";
import { AppShell, TEACHER_NAV } from "@/components/app-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db/store";
import { academyStats, enrichCourse } from "@/lib/db/queries";
import { formatFc } from "@/lib/plans";
import { MeetJoinButton } from "@/components/meet-join-button";
import { togglePublishCourse } from "./actions";

function statusLabel(status: string) {
  if (status === "published") return "Publié";
  if (status === "pending_review") return "En validation";
  if (status === "rejected") return "Refusé";
  return "Brouillon";
}

function actionLabel(status: string) {
  if (status === "published") return "Retirer";
  if (status === "pending_review") return "Annuler envoi";
  if (status === "rejected") return "Resoumettre";
  return "Soumettre à validation";
}

export default async function StudioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role !== "teacher" || !user.academyId) redirect("/learn");

  const db = getDb();
  const academy = db.academies.find((a) => a.id === user.academyId)!;
  const stats = academyStats(academy.id);
  const courses = db.courses
    .filter((c) => c.academyId === academy.id)
    .map(enrichCourse);

  const upcomingLive = courses.flatMap((c) =>
    (c.liveSessions || []).map((s) => ({ ...s, courseTitle: c.title, courseId: c.id })),
  );

  return (
    <AppShell
      role="teacher"
      userName={user.name}
      title={academy.name}
      subtitle={`Plan ${stats.plan?.name} · ${academy.city} · soumettez vos cours à validation admin`}
      nav={TEACHER_NAV}
      actions={
        <Link href="/studio/courses/new" className="yk-btn yk-btn-primary">
          Nouveau cours
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { l: "Publiés", v: stats.publishedCourses },
          { l: "En validation", v: stats.pendingCourses ?? 0 },
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

      {upcomingLive.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-bold text-[var(--yk-forest)]">
            Prochains lives
          </h2>
          <ul className="mt-3 space-y-2">
            {upcomingLive.slice(0, 5).map((s) => (
              <li key={s.id} className="yk-card flex flex-wrap items-center justify-between gap-2 text-sm">
                <div>
                  <p className="font-bold">{s.title}</p>
                  <p className="text-[var(--yk-muted)]">
                    {s.courseTitle} · {new Date(s.startsAt).toLocaleString("fr-CD")} ·{" "}
                    {s.durationMin} min
                    {s.required ? " · obligatoire" : ""}
                  </p>
                </div>
                <MeetJoinButton courseId={s.courseId} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">
          Cours de mon académie
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <article key={c.id} className="yk-card !p-0 overflow-hidden">
              {c.coverImage && (
                <div className="relative aspect-[16/9] bg-[var(--yk-line)]">
                  <Image src={c.coverImage} alt="" fill className="object-cover" sizes="400px" />
                  {c.liveRequired && (
                    <span className="absolute left-2 top-2 rounded-md bg-[var(--yk-amber)] px-2 py-0.5 text-[10px] font-bold">
                      Live
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                <p className="font-display font-bold text-[var(--yk-forest)]">{c.title}</p>
                <p className="mt-1 text-sm text-[var(--yk-muted)]">
                  {statusLabel(c.status)} · {formatFc(c.priceCdf)}
                  {(c.liveSessions?.length ?? 0) > 0
                    ? ` · ${c.liveSessions!.length} live(s)`
                    : ""}
                </p>
                {c.status === "rejected" && c.reviewNote && (
                  <p className="mt-1 text-sm text-red-700">Motif : {c.reviewNote}</p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(c.status === "published" || c.status === "pending_review") && (
                    <>
                      <MeetJoinButton courseId={c.id} />
                      <Link
                        href={`/courses/${c.slug}`}
                        className="yk-btn yk-btn-ghost !py-2 !text-xs"
                      >
                        Voir
                      </Link>
                    </>
                  )}
                  <form action={togglePublishCourse.bind(null, c.id)}>
                    <button type="submit" className="yk-btn yk-btn-secondary !py-2 !text-xs">
                      {actionLabel(c.status)}
                    </button>
                  </form>
                </div>
              </div>
            </article>
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
    </AppShell>
  );
}
