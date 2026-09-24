"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { PROJECT } from "@/lib/seed/demo-data";
import { queueEvent } from "@/lib/sync/sync-manager";

export default function ProjectPage() {
  const [url, setUrl] = useState("");
  const [github, setGithub] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    await queueEvent("PROJECT_SUBMITTED", {
      projectId: PROJECT.id,
      url,
      github,
      notes,
    });
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">Projet pratique</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">
          {PROJECT.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--yk-muted)]">{PROJECT.brief}</p>

        <div className="yk-card mt-6 space-y-3">
          <label className="block text-sm font-semibold">
            URL de la page
            <input
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label className="block text-sm font-semibold">
            GitHub
            <input
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/…"
            />
          </label>
          <label className="block text-sm font-semibold">
            Description / capture
            <textarea
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <button type="button" onClick={submit} className="yk-btn yk-btn-primary" disabled={submitted}>
            {submitted ? "Soumis · en file sync" : "Soumettre le projet"}
          </button>
        </div>
      </main>
    </div>
  );
}
