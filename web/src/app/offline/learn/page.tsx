"use client";

/**
 * Coquille hors ligne : servie par le SW quand /learn/* est inaccessible.
 * L’URL affichée reste /learn/... ; on lit le pathname.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import {
  emitProgressChanged,
  getLessonFromPack,
  getPack,
  getQuizFromPack,
  queueEvent,
  saveLocalQuizScore,
  type OfflinePack,
} from "@/lib/sync/sync-manager";

type QuizQ = {
  id: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

type View =
  | { kind: "loading" }
  | { kind: "missing"; courseId: string | null }
  | { kind: "course"; pack: OfflinePack }
  | {
      kind: "lesson";
      pack: OfflinePack;
      lesson: { id: string; title: string; body: string; minutes: number };
    }
  | {
      kind: "quiz";
      pack: OfflinePack;
      moduleId: string;
      title: string;
      quiz: QuizQ[];
    };

function parseLearnPath(pathname: string) {
  const lesson = pathname.match(/^\/learn\/([^/]+)\/lesson\/([^/]+)\/?$/);
  if (lesson) return { courseId: lesson[1], lessonId: lesson[2], moduleId: null as string | null };
  const quiz = pathname.match(/^\/learn\/([^/]+)\/quiz\/([^/]+)\/?$/);
  if (quiz) return { courseId: quiz[1], lessonId: null as string | null, moduleId: quiz[2] };
  const course = pathname.match(/^\/learn\/([^/]+)\/?$/);
  if (course) return { courseId: course[1], lessonId: null as string | null, moduleId: null as string | null };
  return { courseId: null as string | null, lessonId: null as string | null, moduleId: null as string | null };
}

const PASS = 70;

export default function OfflineLearnPage() {
  const [view, setView] = useState<View>({ kind: "loading" });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<string | null>(null);
  const [pathHint, setPathHint] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = new URLSearchParams(window.location.search).get("u");
      const path = u || window.location.pathname;
      setPathHint(path);
      const parsed = parseLearnPath(path);
      const cid = parsed.courseId;
      if (!cid) {
        if (!cancelled) setView({ kind: "missing", courseId: null });
        return;
      }
      const pack = await getPack(cid);
      if (!pack) {
        if (!cancelled) setView({ kind: "missing", courseId: cid });
        return;
      }
      if (parsed.lessonId) {
        const lesson = await getLessonFromPack(cid, parsed.lessonId);
        if (lesson && !cancelled) {
          setView({
            kind: "lesson",
            pack,
            lesson: {
              id: parsed.lessonId,
              title: lesson.title,
              body: lesson.body,
              minutes: lesson.minutes,
            },
          });
          return;
        }
      }
      if (parsed.moduleId) {
        const q = await getQuizFromPack(cid, parsed.moduleId);
        if (q && !cancelled) {
          setView({
            kind: "quiz",
            pack,
            moduleId: parsed.moduleId,
            title: q.title,
            quiz: q.quiz,
          });
          return;
        }
      }
      if (!cancelled) setView({ kind: "course", pack });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function submitQuiz(courseId: string, moduleId: string, questions: QuizQ[]) {
    let correct = 0;
    for (const q of questions) {
      if (answers[q.id] === q.correctIndex) correct++;
    }
    const score = Math.round((correct / Math.max(questions.length, 1)) * 100);
    const ok = score >= PASS;
    setQuizResult(
      ok
        ? `Réussi · ${score}% (≥ ${PASS}%) — sync à la reconnexion`
        : `Échec · ${score}% — minimum ${PASS}%`,
    );
    await queueEvent("QUIZ_ATTEMPT_CREATED", {
      courseId,
      quizModuleId: moduleId,
      quizScore: score,
      moduleId,
      score,
      passed: ok,
    });
    await saveLocalQuizScore(courseId, moduleId, score);
    emitProgressChanged();
  }

  if (view.kind === "loading") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="text-sm text-[var(--yk-muted)]">Chargement du pack hors ligne…</p>
      </main>
    );
  }

  if (view.kind === "missing") {
    return (
      <main className="mx-auto max-w-2xl space-y-3 px-4 py-10">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Mode hors ligne — pack introuvable sur cet appareil
          {view.courseId ? ` (${view.courseId})` : ""}.
        </p>
        <p className="text-sm text-[var(--yk-muted)]">
          Reconnectez-vous, ouvrez le cours, puis « Télécharger pour hors ligne ».
        </p>
        <p className="text-xs text-[var(--yk-muted)]">Chemin : {pathHint}</p>
        <Link href="/learn" className="font-bold text-[var(--yk-teal)]">
          ← Mes cours
        </Link>
      </main>
    );
  }

  if (view.kind === "lesson") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <OfflineBadge />
        <a href={`/learn/${view.pack.courseId}`} className="text-sm font-bold text-[var(--yk-teal)]">
          ← {view.pack.title}
        </a>
        <h1 className="font-display mt-4 text-2xl font-bold text-[var(--yk-forest)]">
          {view.lesson.title}
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">{view.lesson.minutes} min</p>
        <article className="yk-card mt-6 whitespace-pre-wrap text-sm leading-relaxed">
          {view.lesson.body}
        </article>
        <div className="mt-6">
          <LessonCompleteButton courseId={view.pack.courseId} lessonId={view.lesson.id} />
        </div>
      </main>
    );
  }

  if (view.kind === "quiz") {
    return (
      <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <OfflineBadge />
        <a href={`/learn/${view.pack.courseId}`} className="text-sm font-bold text-[var(--yk-teal)]">
          ← {view.pack.title}
        </a>
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
          Quiz — {view.title}
        </h1>
        {view.quiz.map((q) => (
          <div key={q.id} className="yk-card space-y-2">
            <p className="font-semibold">{q.prompt}</p>
            <div className="space-y-1">
              {q.choices.map((c, i) => (
                <label key={i} className="flex gap-2 text-sm">
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
          </div>
        ))}
        <button
          type="button"
          className="yk-btn yk-btn-primary"
          onClick={() => submitQuiz(view.pack.courseId, view.moduleId, view.quiz)}
        >
          Valider le quiz
        </button>
        {quizResult && (
          <p className="text-sm font-semibold text-[var(--yk-forest)]">{quizResult}</p>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 px-4 py-10">
      <OfflineBadge />
      <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">{view.pack.title}</h1>
      <p className="text-sm text-[var(--yk-muted)]">
        Contenu lu depuis le pack téléchargé sur cet appareil.
      </p>
      {view.pack.modules.map((m, idx) => (
        <section key={m.id} className="yk-card space-y-2">
          <h2 className="font-display font-bold">
            Module {idx + 1} — {m.title}
          </h2>
          <ul className="space-y-1 text-sm">
            {m.lessons.map((l) => (
              <li key={l.id}>
                <a
                  href={`/learn/${view.pack.courseId}/lesson/${l.id}`}
                  className="font-semibold text-[var(--yk-forest)] underline"
                >
                  {l.title}
                </a>
                <span className="text-[var(--yk-muted)]"> · {l.minutes} min</span>
              </li>
            ))}
          </ul>
          {m.quiz.length > 0 && (
            <a
              href={`/learn/${view.pack.courseId}/quiz/${m.id}`}
              className="inline-block text-sm font-bold text-[var(--yk-teal)]"
            >
              Quiz du module →
            </a>
          )}
        </section>
      ))}
    </main>
  );
}

function OfflineBadge() {
  return (
    <p className="mb-3 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900">
      Hors ligne — pack local
    </p>
  );
}
