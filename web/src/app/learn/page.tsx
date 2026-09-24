import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { CourseCoverIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { userEnrollments } from "@/lib/db/queries";
import { getDb } from "@/lib/db/store";
import { LogoutButton } from "@/components/logout-button";
import { OfflineReadyBadge } from "@/components/offline-ready-badge";

export default async function LearnHubPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const items = userEnrollments(user.id);
  const db = getDb();
  const certificates = db.certificates.filter((c) => c.userId === user.id);

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
              Mes cours
            </h1>
            <p className="mt-1 text-sm text-[var(--yk-muted)]">Bonjour {user.name}</p>
          </div>
          <div className="flex gap-2">
            <Link href="/catalog" className="yk-btn yk-btn-primary !py-2 !text-xs">
              Catalogue
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {items.map(({ enrollment, course }) => {
            if (!course) return null;
            const progress = db.progress.find(
              (p) => p.userId === user.id && p.courseId === course.id,
            );
            const cert = certificates.find((c) => c.courseId === course.id);
            return (
              <Link
                key={enrollment.id}
                href={`/learn/${course.id}`}
                className="yk-card block transition hover:border-[var(--yk-lime)]"
              >
                <div className="flex items-start gap-3">
                  <CourseCoverIcon name={course.coverIcon} size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-lg font-bold leading-snug text-[var(--yk-forest)]">
                        {course.title}
                      </p>
                      <OfflineReadyBadge courseId={course.id} />
                      {cert && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                          Certificat
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[var(--yk-muted)]">
                  Progression {progress?.percent ?? 0}% · Pack hors ligne{" "}
                  {enrollment.offlinePackUnlocked ? "débloqué" : "verrouillé"}
                </p>
              </Link>
            );
          })}
          {items.length === 0 && (
            <p className="text-[var(--yk-muted)]">
              Aucun cours acheté.{" "}
              <Link href="/catalog" className="font-bold text-[var(--yk-teal)]">
                Explorer le catalogue
              </Link>
            </p>
          )}
        </div>

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
      </main>
    </div>
  );
}
