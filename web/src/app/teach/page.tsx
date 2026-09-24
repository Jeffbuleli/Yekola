"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { INSTRUCTOR, LEARNER } from "@/lib/seed/demo-data";
import { buildMeetUrl } from "@/lib/meet";
import { getPaymentProvider } from "@/lib/payments/provider";

export default function TeachPage() {
  const [draft, setDraft] = useState<string>("");
  const [payMsg, setPayMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateCourse() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: "Introduction à la cybersécurité",
          audience: "Débutants",
          weeks: 4,
          objective: "Apprendre les bases de la cybersécurité",
        }),
      });
      const data = await res.json();
      setDraft(JSON.stringify(data.draft, null, 2));
    } finally {
      setLoading(false);
    }
  }

  async function demoPay() {
    const p = getPaymentProvider();
    const r = await p.initiate({
      amount: 99,
      currency: "USD",
      description: "Abonnement Plan École",
      msisdn: "243890000000",
    });
    setPayMsg(`${r.message} Réf. ${r.reference}`);
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <div>
          <p className="text-sm text-[var(--yk-muted)]">{INSTRUCTOR.academy}</p>
          <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
            {INSTRUCTOR.name}
          </h1>
        </div>

        <section className="grid gap-3 sm:grid-cols-3">
          {[
            { l: "Apprenants", v: "48" },
            { l: "Formations", v: "6" },
            { l: "Revenus (DEMO)", v: "$420" },
          ].map((s) => (
            <div key={s.l} className="yk-card text-center">
              <p className="text-xs uppercase text-[var(--yk-muted)]">{s.l}</p>
              <p className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">{s.v}</p>
            </div>
          ))}
        </section>

        <section className="yk-card border-amber-300 bg-amber-50/60">
          <h2 className="font-display font-bold">AI Insights</h2>
          <p className="mt-2 text-sm">
            ⚠️ 43% des apprenants échouent au quiz du module 3 (JavaScript Functions).
          </p>
          <p className="mt-1 text-sm">
            💡 Yekola AI recommande de revoir « paramètres, return, portée » avec {LEARNER.name}.
          </p>
        </section>

        <section className="yk-card">
          <h2 className="font-display font-bold">✨ Créer avec Yekola AI</h2>
          <p className="mt-1 text-sm text-[var(--yk-muted)]">
            L&apos;IA propose un syllabus - tu valides. Jamais de publication automatique.
          </p>
          <button
            type="button"
            onClick={generateCourse}
            disabled={loading}
            className="yk-btn yk-btn-primary mt-3"
          >
            {loading ? "Génération…" : "Générer un cours cybersécurité"}
          </button>
          {draft && (
            <pre className="mt-4 max-h-80 overflow-auto rounded-xl bg-[var(--yk-ink)] p-3 text-xs text-[var(--yk-mint)]">
              {draft}
            </pre>
          )}
          <p className="mt-2 text-xs font-bold text-[var(--yk-amber)]">
            status: draft_needs_human_review
          </p>
        </section>

        <section className="yk-card">
          <h2 className="font-display font-bold">Classe Meet</h2>
          <a
            href={buildMeetUrl()}
            target="_blank"
            rel="noreferrer"
            className="yk-btn yk-btn-secondary mt-3"
          >
            Ouvrir live.mcbuleli.org (audio-first)
          </a>
        </section>

        <section className="yk-card">
          <h2 className="font-display font-bold">Paiement abonnement</h2>
          <button type="button" onClick={demoPay} className="yk-btn yk-btn-ghost mt-3">
            Simuler MoMo (DemoProvider)
          </button>
          {payMsg && <p className="mt-3 text-sm text-[var(--yk-muted)]">{payMsg}</p>}
        </section>

        <Link href="/org" className="text-sm font-bold text-[var(--yk-teal)]">
          Vue organisation →
        </Link>
      </main>
    </div>
  );
}
