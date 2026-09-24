"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LessonCompleteButton } from "@/components/lesson-complete-button";
import {
  getLessonFromPack,
  isOfflineMode,
} from "@/lib/sync/sync-manager";
import type { LessonMedia } from "@/lib/types";

type ServerLesson = {
  title: string;
  body: string;
  minutes: number;
  media?: LessonMedia[];
};

type Props = {
  courseId: string;
  lessonId: string;
  courseTitle: string;
  serverLesson: ServerLesson | null;
};

export function LessonViewer({ courseId, lessonId, courseTitle, serverLesson }: Props) {
  const [lesson, setLesson] = useState<ServerLesson | null>(serverLesson);
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
          media: (packed as { media?: LessonMedia[] }).media ?? [],
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
          Leçon indisponible hors ligne. Reconnectez-vous ou téléchargez le pack depuis « Mes
          cours ».
        </p>
        <Link href={`/learn/${courseId}`} className="mt-4 inline-block font-bold text-[var(--yk-teal)]">
          ← Retour
        </Link>
      </main>
    );
  }

  const media = lesson.media ?? [];

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

      {media.length > 0 && (
        <section className="mt-6 space-y-4">
          <h2 className="font-display font-bold text-[var(--yk-forest)]">Médias</h2>
          {media.map((m) => (
            <div key={m.id} className="yk-card">
              <p className="mb-2 text-[10px] font-bold uppercase text-[var(--yk-teal)]">
                {m.kind} · {m.name}
              </p>
              {m.kind === "image" && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-[var(--yk-line)]">
                  <Image src={m.url} alt={m.name} fill className="object-contain" sizes="640px" />
                </div>
              )}
              {m.kind === "video" && (
                <video src={m.url} controls className="w-full rounded-lg" preload="metadata" />
              )}
              {m.kind === "file" && (
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-[var(--yk-teal)] underline"
                >
                  Télécharger {m.name}
                </a>
              )}
            </div>
          ))}
        </section>
      )}

      <div className="mt-6">
        <LessonCompleteButton courseId={courseId} lessonId={lessonId} />
      </div>
    </main>
  );
}
