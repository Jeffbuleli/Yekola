import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { IconAcademy, IconArrowRight, IconCheck, IconOffline, IconSell } from "@/components/icons";
import { CourseCard } from "@/components/course-card";
import { PLANS, formatFc } from "@/lib/plans";
import { listPublishedCourses } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Yekola - Formation professionnelle hors ligne.",
  description:
    "Plateforme de cours téléchargeables pour la formation professionnelle en zones à faible connectivité. Mobile Money natif.",
};

export default function HomePage() {
  const courses = listPublishedCourses().slice(0, 3);

  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[var(--yk-black)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_-10%,rgba(61,190,110,0.28),transparent_55%),radial-gradient(60%_50%_at_10%_80%,rgba(240,160,32,0.12),transparent_50%)]" />
          <div className="yk-shell relative grid gap-8 py-10 sm:gap-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:py-20">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--yk-amber)] sm:text-xs">
                Formation professionnelle · Offline-first
              </p>
              <h1 className="font-display text-[1.85rem] font-bold leading-tight sm:text-4xl lg:text-5xl">
                Apprenez un métier.{" "}
                <span className="bg-gradient-to-r from-[var(--yk-lime)] to-[var(--yk-mint)] bg-clip-text text-transparent">
                  Même hors ligne.
                </span>
              </h1>
              <p className="mt-4 max-w-md text-sm text-[#c5d6cb] sm:text-base lg:text-lg">
                Pour les centres et jeunes en formation professionnelle : cours téléchargeables,
                suivables hors ligne, payés en Mobile Money.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
                <Link href="/auth/register?role=teacher" className="yk-btn yk-btn-primary w-full sm:w-auto">
                  Créer mon académie
                </Link>
                <Link
                  href="/catalog"
                  className="yk-btn w-full border border-[var(--yk-mint)] text-[var(--yk-mint)] sm:w-auto"
                >
                  Explorer les cours
                </Link>
              </div>
              <p className="mt-4 text-xs text-[var(--yk-muted)] sm:text-sm">
                Beta ouverte · Mobile Money · Pack hors ligne après achat
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/40 p-4 shadow-2xl sm:p-5">
              <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
                <div className="rounded-xl bg-black/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--yk-muted)]">
                    Formateurs
                  </p>
                  <p className="font-display text-base font-bold text-[var(--yk-mint)] sm:text-xl">
                    Abonnement / mois
                  </p>
                </div>
                <div className="rounded-xl bg-black/40 p-3">
                  <p className="text-[10px] uppercase tracking-wide text-[var(--yk-muted)]">
                    Apprenants
                  </p>
                  <p className="font-display text-base font-bold text-[var(--yk-amber)] sm:text-xl">
                    Paient le cours
                  </p>
                </div>
              </div>
              {courses[0] ? (
                <div>
                  <p className="mb-2 text-xs font-bold text-[var(--yk-mint)]">Cours en vedette</p>
                  <CourseCard
                    href={`/courses/${courses[0].slug}`}
                    coverIcon={courses[0].coverIcon}
                    title={courses[0].title}
                    detail={courses[0].tagline}
                    priceCdf={courses[0].priceCdf}
                    dark
                  />
                </div>
              ) : (
                <div className="rounded-xl bg-black/50 p-4 text-sm text-[#b7c9be]">
                  Publiez votre premier cours depuis le Studio.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="yk-shell py-10 sm:py-14">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)] sm:text-2xl lg:text-3xl">
            Une plateforme pour enseigner et monétiser
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--yk-muted)] sm:text-base">
            Conçue pour les formateurs et apprenants en Afrique : paiements locaux, cours
            structurés, et apprentissage hors ligne après achat.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "Vendez vos formations",
                d: "Fixez vos prix, publiez vos modules et quiz, encaissez via Mobile Money.",
                Icon: IconSell,
              },
              {
                t: "Apprentissage hors ligne",
                d: "Après l’achat, l’apprenant télécharge le pack et continue sans réseau.",
                Icon: IconOffline,
              },
              {
                t: "Académie multi-cours",
                d: "Chaque enseignant a son espace (tenant), son plan et son portefeuille.",
                Icon: IconAcademy,
              },
            ].map((c) => (
              <article key={c.t} className="yk-card sm:col-span-1 lg:col-span-1 [&:last-child]:sm:col-span-2 [&:last-child]:lg:col-span-1">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--yk-paper)] text-[var(--yk-teal)]">
                    <c.Icon size={24} />
                  </span>
                  <h3 className="min-w-0 flex-1 font-display text-lg font-bold leading-snug text-[var(--yk-forest)]">
                    {c.t}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-[var(--yk-muted)]">{c.d}</p>
              </article>
            ))}
          </div>
        </section>

        {courses.length > 0 && (
          <section className="border-y border-[var(--yk-line)] bg-white py-10 sm:py-14">
            <div className="yk-shell">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-xl font-bold text-[var(--yk-forest)] sm:text-2xl">
                  Cours disponibles
                </h2>
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-1 text-sm font-bold text-[var(--yk-teal)]"
                >
                  Tout voir <IconArrowRight size={16} />
                </Link>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((c) => (
                  <CourseCard
                    key={c.id}
                    href={`/courses/${c.slug}`}
                    coverIcon={c.coverIcon}
                    title={c.title}
                    detail={c.tagline}
                    priceCdf={c.priceCdf}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="pricing" className="yk-shell py-10 sm:py-14">
          <h2 className="font-display text-xl font-bold text-[var(--yk-forest)] sm:text-2xl lg:text-3xl">
            Tarifs enseignants
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--yk-muted)] sm:text-base">
            Abonnement mensuel pour publier. Les apprenants paient les cours séparément.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((p) => (
              <article
                key={p.id}
                className={`yk-card flex flex-col ${p.highlighted ? "ring-2 ring-[var(--yk-amber)]" : ""}`}
              >
                {p.highlighted && (
                  <p className="mb-2 text-xs font-bold uppercase text-[var(--yk-amber)]">
                    Populaire
                  </p>
                )}
                <h3 className="font-display text-lg font-bold">{p.name}</h3>
                <p className="mt-1 font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
                  {formatFc(p.priceCdf)}
                  <span className="text-sm font-medium text-[var(--yk-muted)]">/mois</span>
                </p>
                <p className="mt-2 text-sm text-[var(--yk-muted)]">{p.blurb}</p>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <IconCheck size={16} className="mt-0.5 shrink-0 text-[var(--yk-lime)]" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/auth/register?role=teacher&plan=${p.id}`}
                  className={`yk-btn mt-5 w-full ${p.highlighted ? "yk-btn-primary" : "yk-btn-secondary"}`}
                >
                  Choisir {p.name}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--yk-line)] bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-display text-xl font-bold text-[var(--yk-forest)] sm:text-2xl">FAQ</h2>
            <div className="mt-6 space-y-4">
              {[
                {
                  q: "Qui paie quoi ?",
                  a: "L’enseignant paie un abonnement mensuel pour publier. L’apprenant paie le prix de chaque cours pour y accéder.",
                },
                {
                  q: "Comment fonctionne le hors ligne ?",
                  a: "Après l’achat, l’apprenant télécharge le pack du cours sur son appareil. Il peut lire les leçons et passer les quiz sans Internet, puis synchroniser sa progression.",
                },
                {
                  q: "Quels moyens de paiement ?",
                  a: "Mobile Money (Orange Money, Airtel Money, M-Pesa, etc.) en priorité. Carte bancaire à venir.",
                },
                {
                  q: "Puis-je retirer mes gains ?",
                  a: "Oui. Les ventes nettes (après commission selon votre plan) alimentent votre portefeuille Yekola, retirable en Mobile Money.",
                },
              ].map((item) => (
                <details key={item.q} className="yk-card group">
                  <summary className="cursor-pointer font-display font-bold text-[var(--yk-forest)]">
                    {item.q}
                  </summary>
                  <p className="mt-2 text-sm text-[var(--yk-muted)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-[var(--yk-line)] py-8 text-center text-sm text-[var(--yk-muted)]">
          <p>Yekola · McBuleli · yekola.mcbuleli.com</p>
          <p className="mt-1">Apprenez un métier - même hors ligne.</p>
        </footer>
      </main>
    </div>
  );
}
