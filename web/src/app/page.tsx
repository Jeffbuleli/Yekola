import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-[var(--yk-black)] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_80%_-10%,rgba(61,190,110,0.28),transparent_55%)]" />
          <div className="relative mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
            <div>
              <Image
                src="/brand/yekola-mark.png"
                alt=""
                width={88}
                height={88}
                className="mb-4 h-20 w-20 object-contain"
                priority
              />
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--yk-amber)]">
                VUK&apos;AFRIK · RDC · Formation pro
              </p>
              <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
                Apprendre. Pratiquer. Prouver.
              </h1>
              <p className="mt-4 max-w-md text-base text-[#c5d6cb] sm:text-lg">
                La plateforme de formation professionnelle pensée pour les réalités de la RDC et de
                l&apos;Afrique - avec ou sans Internet.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/demo" className="yk-btn yk-btn-primary">
                  Commencer à apprendre
                </Link>
                <Link
                  href="/demo?role=instructor"
                  className="yk-btn border border-[var(--yk-mint)] text-[var(--yk-mint)]"
                >
                  Créer une académie
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/40 p-5 shadow-2xl">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[var(--yk-mint)]">
                Chaîne Yekola
              </p>
              <ol className="space-y-3 font-display text-sm font-semibold sm:text-base">
                {[
                  "ONLINE - Cloud Yekola",
                  "LEARNING HUB - centre local",
                  "OFFLINE - pack + quiz sur l'appareil",
                  "SYNC - file d'attente idempotente",
                  "AI - tuteur contextualisé",
                  "SKILLS - passeport de compétences",
                ].map((step) => (
                  <li
                    key={step}
                    className="flex items-center gap-3 rounded-xl bg-black/35 px-3 py-2.5"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--yk-amber)]" />
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <h2 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
            Pas un LMS générique. Une infrastructure pour la RDC.
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--yk-muted)]">
            Inspiré de Kolibri (offline), Moodle Workplace (orgs), Ansella (académies + MoMo) - sans
            les cloner. Différenciation : connectivité, compétences, employabilité.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                t: "Learning Hub",
                d: "Continuer hors ligne, synchroniser dès qu'il y a une barre.",
              },
              {
                t: "Yekola AI",
                d: "Tuteur qui connaît ton module, ton quiz et tes lacunes.",
              },
              {
                t: "Skill Passport",
                d: "Compétences + projets + certificat vérifiable.",
              },
            ].map((c) => (
              <article key={c.t} className="yk-card">
                <h3 className="font-display text-lg font-bold text-[var(--yk-forest)]">{c.t}</h3>
                <p className="mt-2 text-sm text-[var(--yk-muted)]">{c.d}</p>
              </article>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/demo" className="yk-btn yk-btn-secondary">
              Lancer le parcours démo Jonathan
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
