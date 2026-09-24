"use client";

import { useEffect, useState } from "react";
import { hasPack } from "@/lib/sync/sync-manager";

export function OfflineReadyBadge({ courseId }: { courseId: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    hasPack(courseId).then(setReady);
  }, [courseId]);
  if (!ready) return null;
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-800">
      Hors ligne
    </span>
  );
}
