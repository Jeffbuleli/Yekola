import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { ORG } from "@/lib/seed/demo-data";

export default function OrgPage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">{ORG.type}</p>
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">{ORG.name}</h1>
        <p className="text-sm text-[var(--yk-muted)]">{ORG.city}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[
            ["1 248", "apprenants"],
            ["48", "formations"],
            ["32", "formateurs"],
            ["17", "cohortes"],
            ["12", "Learning Hubs"],
            ["94%", "sync OK"],
          ].map(([v, l]) => (
            <div key={l} className="yk-card text-center">
              <p className="font-display text-xl font-bold text-[var(--yk-forest)]">{v}</p>
              <p className="text-xs text-[var(--yk-muted)]">{l}</p>
            </div>
          ))}
        </div>

        <section className="yk-card mt-6">
          <h2 className="font-display font-bold">Performance pédagogique</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--yk-muted)]">
            <li>Taux de complétion : 61%</li>
            <li>Taux de réussite quiz : 72%</li>
            <li>Compétences validées (30j) : 384</li>
            <li>Apprenants à risque : 23</li>
            <li>Activité offline (7j) : 41%</li>
            <li>Dernière sync hub : aujourd&apos;hui 08:12</li>
          </ul>
        </section>

        <Link href="/demo" className="mt-6 inline-block text-sm font-bold text-[var(--yk-teal)]">
          ← Changer de rôle
        </Link>
      </main>
    </div>
  );
}
