"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function StudioAiPage() {
  const [subject, setSubject] = useState("Comptabilité pour petites boutiques");
  const [audience, setAudience] = useState("Commerçants à Goma");
  const [objective, setObjective] = useState("Tenir une caisse simple et réconcilier Mobile Money");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOut("");
    try {
      const res = await fetch("/api/ai/course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, audience, weeks: 4, objective }),
      });
      const data = await res.json();
      setOut(JSON.stringify(data, null, 2));
    } catch {
      setOut("Erreur - vérifiez OPENAI_API_KEY ou le mode démo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/studio" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Studio
        </Link>
        <h1 className="font-display mt-4 text-2xl font-bold text-[var(--yk-forest)]">
          Assistant cours (optionnel)
        </h1>
        <p className="mt-2 text-sm text-[var(--yk-muted)]">
          Aide à structurer un brouillon. Relisez toujours avant de publier.
        </p>
        <form onSubmit={onSubmit} className="yk-card mt-6 space-y-3">
          <label className="block text-sm font-semibold">
            Sujet
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Public
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Objectif
            <textarea
              rows={3}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary">
            {busy ? "…" : "Générer un brouillon"}
          </button>
        </form>
        {out && (
          <pre className="yk-card mt-4 overflow-auto whitespace-pre-wrap text-sm">{out}</pre>
        )}
      </div>
    </div>
  );
}
