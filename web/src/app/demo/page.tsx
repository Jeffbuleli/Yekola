import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { INSTRUCTOR, LEARNER, ORG, PATH } from "@/lib/seed/demo-data";

export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const preferInstructor = sp.role === "instructor";

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader compact />
      <main className="mx-auto max-w-lg px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--yk-amber)]">
          Démo hackathon · {ORG.name}
        </p>
        <h1 className="font-display mt-2 text-3xl font-bold text-[var(--yk-forest)]">
          Qui es-tu aujourd&apos;hui ?
        </h1>
        <p className="mt-2 text-[var(--yk-muted)]">
          Parcours seed : {PATH.title}. Données réalistes RDC - pas de &quot;User 2&quot;.
        </p>

        <div className="mt-8 space-y-4">
          <Link
            href="/learn"
            className={`yk-card block transition hover:border-[var(--yk-lime)] ${
              !preferInstructor ? "ring-2 ring-[var(--yk-amber)]" : ""
            }`}
          >
            <p className="text-xs font-bold text-[var(--yk-amber)]">APPRENANT</p>
            <h2 className="font-display mt-1 text-xl font-bold">{LEARNER.name}</h2>
            <p className="text-sm text-[var(--yk-muted)]">
              {LEARNER.city} · Objectif : {LEARNER.goal}
            </p>
          </Link>

          <Link
            href="/teach"
            className={`yk-card block transition hover:border-[var(--yk-lime)] ${
              preferInstructor ? "ring-2 ring-[var(--yk-amber)]" : ""
            }`}
          >
            <p className="text-xs font-bold text-[var(--yk-amber)]">FORMATRICE</p>
            <h2 className="font-display mt-1 text-xl font-bold">{INSTRUCTOR.name}</h2>
            <p className="text-sm text-[var(--yk-muted)]">
              {INSTRUCTOR.title} · {INSTRUCTOR.academy}
            </p>
          </Link>

          <Link href="/org" className="yk-card block transition hover:border-[var(--yk-lime)]">
            <p className="text-xs font-bold text-[var(--yk-amber)]">ORGANISATION</p>
            <h2 className="font-display mt-1 text-xl font-bold">{ORG.name}</h2>
            <p className="text-sm text-[var(--yk-muted)]">
              Vue centre · Learning Hubs · statistiques
            </p>
          </Link>
        </div>
      </main>
    </div>
  );
}
