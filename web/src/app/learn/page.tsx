import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, LEARNER_NAV } from "@/components/app-shell";
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
            Mes certificats
          </h2>
          <ul className="mt-3 space-y-2">
            {certificates.map((c) => (
              <li key={c.id} className="yk-card text-sm">
                <strong>{c.courseTitle}</strong> · {c.issuedAt} ·{" "}
                <Link href={`/verify/${c.code}`} className="font-bold text-[var(--yk-teal)]">
                  Vérifier {c.code}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
