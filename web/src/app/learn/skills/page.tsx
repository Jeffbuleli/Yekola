import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { CERTIFICATE, LEARNER, PROJECT, SKILLS } from "@/lib/seed/demo-data";

export default function SkillsPage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
          Passeport de compétences
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">
          Profil {LEARNER.name} - skills first, certificat ensuite.
        </p>

        <section className="yk-card mt-6">
          <h2 className="font-display font-bold">Analyse de compétences</h2>
          <ul className="mt-4 space-y-3">
            {SKILLS.map((s) => (
              <li key={s.id}>
                <div className="flex justify-between text-sm font-medium">
                  <span>
                    {s.status === "validated" ? "✓" : s.status === "progress" ? "◐" : "○"} {s.label}
                  </span>
                  <span>{s.score}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
                  <div
                    className="h-full rounded-full bg-[var(--yk-lime)]"
                    style={{ width: `${s.score}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl bg-amber-50 p-3 text-sm">
            <p className="font-bold text-[var(--yk-forest)]">À renforcer (recommandation)</p>
            <ol className="mt-1 list-decimal pl-4 text-[var(--yk-muted)]">
              <li>JavaScript</li>
              <li>Responsive Design</li>
              <li>Git</li>
            </ol>
            <p className="mt-2 font-semibold">Prochaine étape → JavaScript intermédiaire</p>
          </div>
        </section>

        <section className="yk-card mt-4">
          <h2 className="font-display font-bold">Projet preuve</h2>
          <p className="mt-1 text-sm">{PROJECT.title}</p>
          <Link href={`/learn/project/${PROJECT.id}`} className="text-sm font-bold text-[var(--yk-teal)]">
            Ouvrir →
          </Link>
        </section>

        <section className="yk-card mt-4">
          <h2 className="font-display font-bold">Certificat</h2>
          <p className="mt-1 text-sm text-[var(--yk-muted)]">
            Code {CERTIFICATE.code} - vérifiable publiquement
          </p>
          <Link
            href={`/verify/${CERTIFICATE.code}`}
            className="yk-btn yk-btn-secondary mt-3 !text-sm"
          >
            Voir / vérifier
          </Link>
        </section>
      </main>
    </div>
  );
}
