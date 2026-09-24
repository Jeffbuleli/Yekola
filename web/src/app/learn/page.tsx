"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { LEARNER, MODULES, PATH, PROJECT, SKILLS } from "@/lib/seed/demo-data";
import { getProgress, queueEvent, setProgress } from "@/lib/sync/sync-manager";

export default function LearnDashboard() {
  const [pathPct, setPathPct] = useState(42);
  const [lessonPct, setLessonPct] = useState(65);

  useEffect(() => {
    (async () => {
      const p = await getProgress<{ path?: number; lesson?: number }>("dashboard");
      if (p?.path) setPathPct(p.path);
      if (p?.lesson) setLessonPct(p.lesson);
    })();
  }, []);

  async function continueLearning() {
    await setProgress("dashboard", { path: pathPct, lesson: Math.min(100, lessonPct + 5) });
    await queueEvent("PROGRESS_UPDATED", { lessonId: "les-js-functions", pct: lessonPct + 5 });
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-16">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <div>
          <p className="text-sm text-[var(--yk-muted)]">Bonjour, {LEARNER.name}</p>
          <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">
            Continuer mon apprentissage
          </h1>
        </div>

        <section className="yk-card">
          <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">En cours</p>
          <h2 className="font-display mt-1 text-lg font-bold">JavaScript - Functions</h2>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
            <div
              className="h-full rounded-full bg-[var(--yk-lime)]"
              style={{ width: `${lessonPct}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--yk-forest)]">{lessonPct}%</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/learn/lesson/les-js-functions"
              className="yk-btn yk-btn-primary"
              onClick={() => continueLearning()}
            >
              Continuer
            </Link>
            <Link href="/learn/quiz/js-functions" className="yk-btn yk-btn-ghost">
              Quiz
            </Link>
          </div>
        </section>

        <section className="yk-card">
          <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">Mon objectif</p>
          <h2 className="font-display mt-1 text-lg font-bold">{LEARNER.goal}</h2>
          <p className="text-sm text-[var(--yk-muted)]">{PATH.title}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
            <div
              className="h-full rounded-full bg-[var(--yk-forest)]"
              style={{ width: `${pathPct}%` }}
            />
          </div>
          <p className="mt-1 text-sm font-semibold">{pathPct}%</p>
          <Link href="/learn/path/developpeur-web" className="mt-3 inline-block text-sm font-bold text-[var(--yk-teal)]">
            Voir le parcours →
          </Link>
        </section>

        <section className="yk-card border-[var(--yk-mint)] bg-emerald-50/50">
          <p className="text-xs font-bold uppercase text-[var(--yk-forest)]">Yekola AI</p>
          <p className="mt-2 text-sm leading-relaxed">
            Tu sembles avoir des difficultés avec les fonctions JavaScript. Faisons un exercice de 5
            minutes ?
          </p>
          <Link href="/learn/ai" className="yk-btn yk-btn-secondary mt-3 !text-sm">
            Parler au tuteur
          </Link>
        </section>

        <section className="yk-card">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">Mes compétences</h2>
            <Link href="/learn/skills" className="text-sm font-bold text-[var(--yk-teal)]">
              Passeport
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {SKILLS.map((s) => (
              <li key={s.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{s.label}</span>
                <span>
                  {s.status === "validated" ? "✓" : s.status === "progress" ? "◐" : "○"}{" "}
                  {s.score}%
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="yk-card">
          <h2 className="font-display font-bold">Mon projet</h2>
          <p className="mt-1 text-sm text-[var(--yk-muted)]">{PROJECT.title}</p>
          <Link href={`/learn/project/${PROJECT.id}`} className="yk-btn yk-btn-ghost mt-3 !text-sm">
            Ouvrir le brief
          </Link>
        </section>

        <section className="yk-card">
          <h2 className="font-display font-bold">Modules</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {MODULES.map((m) => (
              <li key={m.id} className="flex gap-2">
                <span className="font-bold text-[var(--yk-amber)]">{m.order}.</span>
                <span>{m.title}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
