"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  emitProgressChanged,
  getQuizFromPack,
  isOfflineMode,
  queueEvent,
  saveLocalQuizScore,
  syncNow,
} from "@/lib/sync/sync-manager";

type Q = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

const PASS = 70;

export default function QuizPage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const router = useRouter();
  const [questions, setQuestions] = useState<Q[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<string | null>(null);
  const [passed, setPassed] = useState<boolean | null>(null);
  const [title, setTitle] = useState("Quiz");
  const [source, setSource] = useState<"server" | "pack">("server");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isOfflineMode()) {
        const packed = await getQuizFromPack(params.courseId, params.moduleId);
        if (cancelled) return;
        if (packed) {
          setQuestions(packed.quiz);
          setTitle(packed.title);
          setSource("pack");
          return;
        }
      }
      const res = await fetch(`/api/courses?id=${params.courseId}`, {
        credentials: "same-origin",
      });
      const d = await res.json();
      if (cancelled) return;
      const mod = d.course?.modules?.find((m: { id: string }) => m.id === params.moduleId);
      if (mod) {
        setQuestions(mod.quiz ?? []);
        setTitle(mod.title);
        setSource("server");
      } else {
        const packed = await getQuizFromPack(params.courseId, params.moduleId);
        if (packed) {
          setQuestions(packed.quiz);
          setTitle(packed.title);
          setSource("pack");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.courseId, params.moduleId]);

  async function submit() {
    if (busy) return;
    setBusy(true);
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    const score = Math.round((correct / Math.max(questions.length, 1)) * 100);
    const ok = score >= PASS;
    setPassed(ok);

    try {
      await queueEvent("QUIZ_ATTEMPT_CREATED", {
        courseId: params.courseId,
        quizModuleId: params.moduleId,
        quizScore: score,
        moduleId: params.moduleId,
        score,
      });
      await saveLocalQuizScore(params.courseId, params.moduleId, score);
      emitProgressChanged();

      if (!isOfflineMode()) {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            courseId: params.courseId,
            quizModuleId: params.moduleId,
            quizScore: score,
          }),
        });
        try {
          await syncNow();
        } catch {
          /* ok */
        }
        setResult(
          ok
            ? `Score ${score}% — module validé (≥ ${PASS}%).`
            : `Score ${score}% — minimum ${PASS}% requis pour le brevet.`,
        );
        emitProgressChanged();
        router.refresh();
      } else {
        setResult(
          ok
            ? `Score ${score}% — enregistré hors ligne (sync auto).`
            : `Score ${score}% — sous ${PASS}%, à retenter.`,
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/learn/${params.courseId}`}
          className="text-sm font-bold text-[var(--yk-teal)]"
        >
          ← Retour
        </Link>
        <h1 className="font-display mt-4 text-2xl font-bold text-[var(--yk-forest)]">
          Quiz — {title}
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">
          Seuil brevet : ≥ {PASS}% sur chaque quiz du cours.
        </p>
        {source === "pack" && (
          <p className="mt-2 text-xs font-semibold text-sky-800">Pack hors ligne</p>
        )}
        <div className="mt-6 space-y-4">
          {questions.map((q) => (
            <fieldset key={q.id} className="yk-card">
              <legend className="font-semibold">{q.prompt}</legend>
              <div className="mt-3 space-y-2">
                {q.choices.map((c, i) => (
                  <label key={`${q.id}-${i}`} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === i}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          {questions.length === 0 && (
            <p className="text-sm text-[var(--yk-muted)]">
              Aucune question. Téléchargez le pack ou reconnectez-vous.
            </p>
          )}
        </div>
        {questions.length > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="yk-btn yk-btn-primary mt-6"
          >
            {busy ? "…" : "Valider"}
          </button>
        )}
        {result && (
          <p
            className={`mt-3 font-bold ${
              passed ? "text-emerald-800" : "text-amber-800"
            }`}
          >
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
