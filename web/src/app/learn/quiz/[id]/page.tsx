"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { QUIZ_JS } from "@/lib/seed/demo-data";
import { queueEvent, setProgress } from "@/lib/sync/sync-manager";

export default function QuizPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [score, setScore] = useState<number | null>(null);

  async function submit() {
    let correct = 0;
    for (const q of QUIZ_JS) {
      if (answers[q.id] === q.correctIndex) correct += 1;
    }
    const pct = Math.round((correct / QUIZ_JS.length) * 100);
    setScore(pct);
    await queueEvent("QUIZ_ATTEMPT_CREATED", {
      quizId: "js-functions",
      score: pct,
      correct,
      total: QUIZ_JS.length,
    });
    await setProgress("quiz:js-functions", { score: pct, correct, total: QUIZ_JS.length });
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-20">
      <SiteHeader compact />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
          Quiz - JavaScript Functions
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">
          Fonctionne hors ligne - résultat mis en file de synchronisation.
        </p>

        <div className="mt-6 space-y-5">
          {QUIZ_JS.map((q, i) => (
            <fieldset key={q.id} className="yk-card">
              <legend className="font-display text-sm font-bold">
                {i + 1}. {q.prompt}
              </legend>
              <div className="mt-3 space-y-2">
                {q.choices.map((c, idx) => (
                  <label key={c} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === idx}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: idx }))}
                    />
                    {c}
                  </label>
                ))}
              </div>
              {score !== null && (
                <p className="mt-2 text-xs text-[var(--yk-muted)]">{q.explanation}</p>
              )}
            </fieldset>
          ))}
        </div>

        {score === null ? (
          <button type="button" onClick={submit} className="yk-btn yk-btn-primary mt-6">
            Valider le quiz
          </button>
        ) : (
          <div className="yk-card mt-6 border-[var(--yk-amber)]">
            <p className="font-display text-xl font-bold">Score : {score}%</p>
            <p className="mt-1 text-sm text-[var(--yk-muted)]">
              Tentative enregistrée localement (Learning Hub). Synchronise quand tu es en ligne.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/learn/ai" className="yk-btn yk-btn-secondary">
                Pourquoi ma réponse est fausse ?
              </Link>
              <Link href="/learn/skills" className="yk-btn yk-btn-ghost">
                Voir compétences
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
