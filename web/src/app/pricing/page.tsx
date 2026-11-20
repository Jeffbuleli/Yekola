import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { IconCheck } from "@/components/icons";
import { PLANS, formatFc, formatPi } from "@/lib/plans";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tarifs enseignants - Yekola",
  description: "Abonnements mensuels pour publier et vendre vos formations sur Yekola.",
};

export default async function PricingPage() {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main className="yk-shell py-8 sm:py-12">
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
          Tarifs enseignants
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--yk-muted)] sm:text-base">
          L’enseignant paie l’abonnement (100 % Yekola). L’apprenant paie le cours ou le
          livre : Yekola retient la commission du plan, le reste revient à l’enseignant.
          Barème Pi : 1 π = 1 000 FC. Le pack hors ligne s’ouvre après le paiement.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <article
              key={p.id}
              className={`yk-card flex flex-col ${p.highlighted ? "ring-2 ring-[var(--yk-amber)]" : ""}`}
            >
              <h2 className="font-display text-lg font-bold">{p.name}</h2>
              <p className="mt-1 font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
                {formatFc(p.priceCdf)}
                <span className="text-sm font-medium text-[var(--yk-muted)]">/mois</span>
                {p.pricePi > 0 && (
                  <span className="mt-1 block text-base text-[var(--yk-ink)]">
                    ou {formatPi(p.pricePi)}/mois
                  </span>
                )}
              </p>
              <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <IconCheck size={16} className="mt-0.5 shrink-0 text-[var(--yk-lime)]" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={
                  user?.role === "teacher"
                    ? `/studio/billing?plan=${p.id}`
                    : user
                      ? "/catalog"
                      : `/auth/register?role=teacher&plan=${p.id}`
                }
                className={`yk-btn mt-5 w-full ${p.highlighted ? "yk-btn-primary" : "yk-btn-secondary"}`}
              >
                {user?.role === "teacher"
                  ? `Passer à ${p.name}`
                  : user
                    ? "Voir le catalogue"
                    : "Commencer"}
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
