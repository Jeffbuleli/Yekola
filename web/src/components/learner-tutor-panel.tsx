"use client";

import { FormEvent, useState } from "react";

export function LearnerTutorPanel({
  courseTitle,
  learnerName,
}: {
  courseTitle: string;
  learnerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerName,
          pathTitle: courseTitle,
          moduleTitle: courseTitle,
          lessonTitle: "Question libre",
          question,
        }),
      });
      const data = await res.json();
      setAnswer(data.answer || JSON.stringify(data));
    } catch {
      setAnswer("Tuteur indisponible pour le moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-bold text-[var(--yk-teal)]"
      >
        Aide tuteur (optionnel)
      </button>
    );
  }

  return (
    <div className="yk-card mt-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display font-bold text-[var(--yk-forest)]">Tuteur (optionnel)</p>
        <button
          type="button"
          className="text-xs font-semibold text-[var(--yk-muted)]"
          onClick={() => setOpen(false)}
        >
          Fermer
        </button>
      </div>
      <p className="text-xs text-[var(--yk-muted)]">
        Posez une question sur ce cours. Relisez toujours la réponse.
      </p>
      <form onSubmit={onSubmit} className="space-y-2">
        <textarea
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ex. Je n’ai pas compris les fonctions JavaScript…"
          className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
        />
        <button type="submit" disabled={busy} className="yk-btn yk-btn-secondary">
          {busy ? "…" : "Demander"}
        </button>
      </form>
      {answer && (
        <pre className="whitespace-pre-wrap rounded-lg bg-[var(--yk-paper)] p-3 text-sm">
          {answer}
        </pre>
      )}
    </div>
  );
}
