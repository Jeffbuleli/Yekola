import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { academyAnalytics } from "@/lib/db/analytics";
import { formatFc } from "@/lib/plans";

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user?.academyId) redirect("/auth/login");

  const stats = academyAnalytics(user.academyId);

  return (
    <div className="max-w-4xl">
<h1 className="font-display mt-4 text-3xl font-bold text-[var(--yk-forest)]">
          Statistiques
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">
          Plan {stats.plan?.name} · ventes, progression, certificats
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: "Ventes", v: String(stats.sales) },
            { l: "Revenus nets", v: formatFc(stats.revenueCdf) },
            { l: "Progression moy.", v: `${stats.avgProgress}%` },
            { l: "Certificats", v: String(stats.certificatesIssued) },
          ].map((s) => (
            <div key={s.l} className="yk-card">
              <p className="text-xs uppercase text-[var(--yk-muted)]">{s.l}</p>
              <p className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">
                {s.v}
              </p>
            </div>
          ))}
        </div>

        <h2 className="font-display mt-10 font-bold">Par cours</h2>
        <div className="mt-3 space-y-3">
          {stats.byCourse.map((c) => (
            <article key={c.courseId} className="yk-card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-display font-bold">{c.title}</p>
                  <p className="text-xs text-[var(--yk-muted)]">
                    {c.status === "published" ? "Publié" : "Brouillon"} ·{" "}
                    {formatFc(c.priceCdf)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p>
                    <strong>{c.sales}</strong> ventes · {formatFc(c.revenueCdf)}
                  </p>
                  <p className="text-[var(--yk-muted)]">
                    Prog. moy. {c.avgProgress}% · {c.completed} terminé(s) ·{" "}
                    {c.certificates} certificat(s)
                  </p>
                </div>
              </div>
              {c.learners.length > 0 && (
                <ul className="mt-3 space-y-1 border-t border-[var(--yk-line)] pt-3 text-sm">
                  {c.learners.map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <span>
                        {l.name}{" "}
                        <span className="text-xs text-[var(--yk-muted)]">{l.email}</span>
                      </span>
                      <span className="font-semibold">{l.percent}%</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {stats.byCourse.length === 0 && (
            <p className="text-[var(--yk-muted)]">Aucun cours encore.</p>
          )}
        </div>

        <h2 className="font-display mt-10 font-bold">Dernières ventes</h2>
        <ul className="mt-3 space-y-2">
          {stats.recentSales.map((e) => (
            <li key={e.id} className="yk-card text-sm">
              <strong>{e.learnerName}</strong> - {e.courseTitle} · net{" "}
              {formatFc(e.netCdf)}
            </li>
          ))}
          {stats.recentSales.length === 0 && (
            <p className="text-[var(--yk-muted)]">Pas encore de ventes.</p>
          )}
        </ul>

        {stats.recentCertificates.length > 0 && (
          <>
            <h2 className="font-display mt-10 font-bold">Certificats récents</h2>
            <ul className="mt-3 space-y-2">
              {stats.recentCertificates.map((c) => (
                <li key={c.id} className="yk-card text-sm">
                  {c.learnerName} · {c.courseTitle} ·{" "}
                  <Link href={`/verify/${c.code}`} className="font-bold text-[var(--yk-teal)]">
                    {c.code}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
  );
}
