import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, LEARNER_NAV } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";
import { CourseCard } from "@/components/course-card";
import { getCurrentUser } from "@/lib/auth/session";
import { userEnrollments } from "@/lib/db/queries";
import { getDb } from "@/lib/db/store";
import { OfflineReadyBadge } from "@/components/offline-ready-badge";

export default async function LearnHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.role === "admin") redirect("/admin");
  if (user.role === "teacher") redirect("/studio");

  const items = userEnrollments(user.id);
  const db = getDb();
  const certificates = db.certificates.filter((c) => c.userId === user.id);

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader variant="app" />
      <AppShell
      role="learner"
      userName={user.name}
      title="Mes cours"
      subtitle="Packs hors ligne, progression et lives planifiés"
      nav={LEARNER_NAV}
      actions={
        <Link href="/catalog" className="yk-btn yk-btn-primary">
          Catalogue
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ enrollment, course }) => {
          if (!course) return null;
          const progress = db.progress.find(
            (p) => p.userId === user.id && p.courseId === course.id,
          );
          const cert = certificates.find((c) => c.courseId === course.id);
          const nextLive = (course.liveSessions || [])
            .filter((s) => new Date(s.startsAt).getTime() > Date.now() - 3600e3)
            .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];
          return (
            <div key={enrollment.id} className="relative">
              <CourseCard
                href={`/learn/${course.id}`}
                coverIcon={course.coverIcon}
                coverImage={course.coverImage}
                title={course.title}
                detail={`Progression ${progress?.percent ?? 0}% · Pack ${
                  enrollment.offlinePackUnlocked ? "débloqué" : "verrouillé"
                }${nextLive ? ` · Live ${new Date(nextLive.startsAt).toLocaleDateString("fr-CD")}` : ""}`}
                liveRequired={course.liveRequired}
              />
              <div className="pointer-events-none absolute right-3 top-3 flex gap-1">
                <OfflineReadyBadge courseId={course.id} />
                {cert && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                    Certificat
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {items.length === 0 && (
        <p className="text-[var(--yk-muted)]">
          Aucun cours acheté.{" "}
          <Link href="/catalog" className="font-bold text-[var(--yk-teal)]">
            Explorer le catalogue
          </Link>
        </p>
      )}

      {certificates.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)]">
            Mes brevets
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {certificates.map((c) => (
              <article
                key={c.id}
                className="overflow-hidden rounded-2xl border border-[var(--yk-line)] bg-white"
              >
                <div className="bg-[var(--yk-forest)] px-4 py-3 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--yk-amber)]">
                    Brevet
                  </p>
                  <h3 className="font-display mt-0.5 text-base font-bold leading-snug">
                    {c.courseTitle}
                  </h3>
                </div>
                <div className="space-y-2 px-4 py-3 text-sm">
                  <p className="text-[var(--yk-muted)]">
                    Émis le{" "}
                    {new Date(c.issuedAt).toLocaleDateString("fr-CD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="font-mono text-xs font-semibold">{c.code}</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      href={`/verify/${c.code}`}
                      className="yk-btn yk-btn-secondary !py-2 !text-xs"
                    >
                      Vérifier
                    </Link>
                    <a
                      href={`/api/certificates/${encodeURIComponent(c.code)}`}
                      className="yk-btn yk-btn-primary !py-2 !text-xs"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Télécharger
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
      </AppShell>
    </div>
  );
}
