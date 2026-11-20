"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconCheck } from "@/components/icons";
import {
  emitProgressChanged,
  getProgress,
  isOfflineMode,
  queueEvent,
  saveLocalLessonDone,
  syncNow,
} from "@/lib/sync/sync-manager";

export function LessonCompleteButton({
  courseId,
  lessonId,
  completed = false,
}: {
  courseId: string;
  lessonId: string;
  completed?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(completed);

  useEffect(() => {
    setDone(completed);
  }, [completed]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (completed) return;
      const key = `local_done:${courseId}`;
      const prev = (await getProgress<string[]>(key)) ?? [];
      if (!cancelled && prev.includes(lessonId)) setDone(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId, completed]);

  async function complete() {
    if (done || busy) return;
    setBusy(true);
    try {
      await queueEvent("LESSON_COMPLETED", { courseId, lessonId });
      await saveLocalLessonDone(courseId, lessonId);
      emitProgressChanged();

      if (!isOfflineMode()) {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ courseId, lessonId }),
        });
        try {
          await syncNow();
        } catch {
          /* keep queue */
        }
        setDone(true);
        emitProgressChanged();
        if (res.ok) router.refresh();
        return;
      }
      setDone(true);
      emitProgressChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy || done}
      onClick={() => void complete()}
      className="inline-flex items-center justify-center gap-1 rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm font-bold disabled:opacity-50"
    >
      {done ? (
        <>
          <IconCheck size={16} className="text-[var(--yk-lime)]" />
          Terminée
        </>
      ) : busy ? (
        "…"
      ) : isOfflineMode() ? (
        "Terminer (hors ligne)"
      ) : (
        "Terminer"
      )}
    </button>
  );
}
