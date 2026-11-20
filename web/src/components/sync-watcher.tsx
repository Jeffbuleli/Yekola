"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  emitProgressChanged,
  FORCE_KEY,
  listPending,
  syncNow,
} from "@/lib/sync/sync-manager";

/** Sync auto au montage, au retour réseau, et périodiquement. */
export function SyncWatcher() {
  const router = useRouter();

  useEffect(() => {
    async function flush() {
      if (typeof localStorage !== "undefined" && localStorage.getItem(FORCE_KEY) === "1") {
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const p = await listPending();
      if (p.length === 0) return;
      try {
        const r = await syncNow();
        if (r.synced > 0) {
          emitProgressChanged();
          router.refresh();
        }
      } catch {
        /* keep pending */
      }
    }

    void flush();
    window.addEventListener("online", flush);
    window.addEventListener("focus", flush);
    const timer = setInterval(() => void flush(), 15_000);

    return () => {
      window.removeEventListener("online", flush);
      window.removeEventListener("focus", flush);
      clearInterval(timer);
    };
  }, [router]);
  return null;
}
