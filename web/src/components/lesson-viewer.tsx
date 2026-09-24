"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import {
  getLessonFromPack,
  isOfflineMode,
} from "@/lib/sync/sync-manager";

type Props = {
  courseId: string;
  lessonId: string;
  courseTitle: string;
  serverLesson: { title: string; body: string; minutes: number } | null;
};

export function LessonViewer({ courseId, lessonId, courseTitle, serverLesson }: Props) {
  const [lesson, setLesson] = useState(serverLesson);
  const [fromPack, setFromPack] = useState(false);
  const [title, setTitle] = useState(courseTitle);
  const [loading, setLoading] = useState(!serverLesson);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (serverLesson && !isOfflineMode()) {
        setLesson(serverLesson);
        setFromPack(false);
        setLoading(false);
        return;
      }
      const packed = await getLessonFromPack(courseId, lessonId);
      if (cancelled) return;
      if (packed) {
        setLesson({
          title: packed.title,
          body: packed.body,
          minutes: packed.minutes,
        });
        setTitle(packed.courseTitle);
        setFromPack(true);
      } else if (serverLesson) {
        setLesson(serverLesson);
        setFromPack(false);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, serverLesson]);

  if (loading) {
    return <p className="px-4 py-10 text-sm text-[var(--yk-muted)]">Chargement…</p>;
  }

  if (!lesson) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <p className="yk-card text-sm text-red-700">
          Leçon indisponible hors ligne. Reconnectez-vous ou téléchargez le pack depuis « Mes cours ».
        </p>
        <Link href={`/learn/${courseId}`} className="mt-4 inline-block font-bold text-[var(--yk-teal)]">
          ← Retour
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href={`/learn/${courseId}`} className="text-sm font-bold text-[var(--yk-teal)]">
        ← {title}
      </Link>
      {fromPack && (
        <p className="mt-3 rounded-lg bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-900">
          Lecture depuis le pack hors ligne
        </p>
      )}
      <h1 className="font-display mt-4 text-2xl font-bold text-[var(--yk-forest)]">
        {lesson.title}
      </h1>
      <p className="mt-1 text-sm text-[var(--yk-muted)]">{lesson.minutes} min</p>
      <article className="yk-card mt-6 whitespace-pre-wrap text-sm leading-relaxed">
        {lesson.body}
      </article>
      <div className="mt-6">
        <LessonCompleteButton courseId={courseId} lessonId={lessonId} />
      </div>
    </main>
  );
}
