"use client";

import { useCallback, useEffect, useState } from "react";
import { QUIZ_PASS_THRESHOLD } from "@/lib/progress/certify";
import { getLocalProgress } from "@/lib/sync/sync-manager";

type Props = {
  courseId: string;
  lessonIds: string[];
  quizModuleIds: string[];
  serverCompleted: string[];
  serverQuizScores: Record<string, number>;
};

export function LearnProgressBar({
  courseId,
  lessonIds,
  quizModuleIds,
  serverCompleted,
  serverQuizScores,
}: Props) {
  const [percent, setPercent] = useState(0);
  const [lessonDone, setLessonDone] = useState(0);
  const [quizPassed, setQuizPassed] = useState(0);
  const lessonTotal = lessonIds.length;
  const quizTotal = quizModuleIds.length;

  const refresh = useCallback(async () => {
    const local = await getLocalProgress(courseId);
    const completed = Array.from(
      new Set([...serverCompleted, ...local.completedLessonIds]),
    );
    const quizScores: Record<string, number> = { ...serverQuizScores };
    for (const [k, v] of Object.entries(local.quizScores)) {
      if (quizScores[k] == null || v > quizScores[k]) quizScores[k] = v;
    }
    const lDone = completed.filter((id) => lessonIds.includes(id)).length;
    let qPass = 0;
    for (const id of quizModuleIds) {
      const s = quizScores[id];
      if (typeof s === "number" && s >= QUIZ_PASS_THRESHOLD) qPass++;
    }
    let pct: number;
    if (quizModuleIds.length === 0) {
      pct = Math.round((lDone / Math.max(lessonIds.length, 1)) * 100);
    } else {
      pct = Math.round(
        (lDone / Math.max(lessonIds.length, 1)) * 70 +
          (qPass / Math.max(quizModuleIds.length, 1)) * 30,
      );
    }
    setPercent(Math.min(100, pct));
    setLessonDone(lDone);
    setQuizPassed(qPass);
  }, [courseId, lessonIds, quizModuleIds, serverCompleted, serverQuizScores]);

  useEffect(() => {
    void refresh();
    const onEvt = () => void refresh();
    window.addEventListener("yekola-progress", onEvt);
    window.addEventListener("online", onEvt);
    const t = setInterval(onEvt, 5000);
    return () => {
      window.removeEventListener("yekola-progress", onEvt);
      window.removeEventListener("online", onEvt);
      clearInterval(t);
    };
  }, [refresh]);

  return (
    <div className="mt-3">
      <p className="text-sm text-[var(--yk-muted)]">
        Progression <strong className="text-[var(--yk-ink)]">{percent}%</strong>
        {" · "}
        leçons {lessonDone}/{lessonTotal}
        {" · "}
        quiz {quizPassed}/{quizTotal}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--yk-line)]">
        <div
          className="h-full bg-[var(--yk-lime)] transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--yk-muted)]">
        Brevet : toutes les leçons + chaque quiz ≥ {QUIZ_PASS_THRESHOLD}%. Sync auto
        online/offline.
      </p>
    </div>
  );
}
