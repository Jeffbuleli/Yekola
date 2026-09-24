"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { LEARNER, PATH } from "@/lib/seed/demo-data";

export default function AITutorPage() {
  const [question, setQuestion] = useState(
    "Je ne comprends pas les fonctions JavaScript. Explique-moi pourquoi ma réponse au quiz est fausse.",
  );
  const [answer, setAnswer] = useState("");
  const [provider, setProvider] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerName: LEARNER.name,
          pathTitle: PATH.title,
          moduleTitle: "JavaScript",
          lessonTitle: "Les fonctions JavaScript",
          quizScore: "4/10",
          weakTopics: ["paramètres", "return", "portée"],
          question,
        }),
      });
      const data = await res.json();
      setAnswer(data.answer || "Erreur");
      setProvider(data.provider || "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader compact />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">Yekola AI Tutor</p>
        <h1 className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">
          Tuteur contextualisé
        </h1>
        <p className="mt-2 text-sm text-[var(--yk-muted)]">
          Pas un ChatGPT générique : le tuteur connaît ton parcours, module et résultats quiz.
        </p>

        <textarea
          className="mt-5 w-full rounded-xl border border-[var(--yk-line)] p-3 text-sm"
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button
          type="button"
          onClick={ask}
          disabled={loading}
          className="yk-btn yk-btn-primary mt-3"
        >
          {loading ? "Réflexion…" : "Demander à Yekola AI"}
        </button>

        {answer && (
          <div className="yk-card mt-6 whitespace-pre-wrap text-sm leading-relaxed">
            <p className="mb-2 text-xs font-bold text-[var(--yk-muted)]">
              Provider : {provider}
              {provider === "demo" ? " (DEMO MODE - ajoute OPENAI_API_KEY pour le live)" : ""}
            </p>
            {answer}
          </div>
        )}
      </main>
    </div>
  );
}
