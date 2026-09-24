"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { getLesson, getModule } from "@/lib/seed/demo-data";
import { queueEvent, setProgress } from "@/lib/sync/sync-manager";

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const lesson = getLesson(id);
  const mod = lesson ? getModule(lesson.moduleId) : null;
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    // Prefetch marker for offline shell
    setProgress(`lesson:${lesson.id}:opened`, true);
  }, [lesson]);

  if (!lesson || !mod) {
    return (
      <div className="p-8">
        Leçon introuvable. <Link href="/learn">Retour</Link>
      </div>
    );
  }

  async function complete() {
    await queueEvent("LESSON_COMPLETED", { lessonId: lesson!.id, moduleId: mod!.id });
    await setProgress(`lesson:${lesson!.id}:done`, true);
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] pb-20">
      <SiteHeader compact />
      <article className="mx-auto max-w-2xl px-4 py-6">
        <p className="text-xs font-bold uppercase text-[var(--yk-amber)]">
          {mod.title} · {lesson.minutes} min
          {lesson.offlineReady ? " · Offline OK" : ""}
        </p>
        <h1 className="font-display mt-1 text-2xl font-bold text-[var(--yk-forest)]">
          {lesson.title}
        </h1>
        <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-[var(--yk-ink)]">
          {lesson.body}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" onClick={complete} className="yk-btn yk-btn-primary" disabled={done}>
            {done ? "Marquée · en file sync" : "Marquer comme terminée"}
          </button>
          <Link href="/learn/quiz/js-functions" className="yk-btn yk-btn-secondary">
            Passer le quiz
          </Link>
          <Link href="/learn/ai" className="yk-btn yk-btn-ghost">
            Demander à Yekola AI
          </Link>
        </div>
      </article>
    </div>
  );
}
