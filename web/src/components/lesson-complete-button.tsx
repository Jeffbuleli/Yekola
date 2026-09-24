"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IconCheck } from "@/components/icons";
import { isOfflineMode, queueEvent, setProgress } from "@/lib/sync/sync-manager";

export function LessonCompleteButton({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function complete() {
    setBusy(true);
    try {
      if (isOfflineMode()) {
        await queueEvent("LESSON_COMPLETED", { courseId, lessonId });
        const key = `local_done:${courseId}`;
        const prev = (await import("@/lib/sync/sync-manager").then((m) =>
          m.getProgress<string[]>(key),
        )) ?? [];
        if (!prev.includes(lessonId)) {
          await setProgress(key, [...prev, lessonId]);
        }
        setDone(true);
      } else {
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, lessonId }),
        });
        setDone(true);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      disabled={busy || done}
      onClick={complete}
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
