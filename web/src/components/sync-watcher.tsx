"use client";

import { useEffect } from "react";
import { FORCE_KEY, listPending, syncNow } from "@/lib/sync/sync-manager";

/** Sync auto au montage, au retour réseau, et périodiquement. */
export function SyncWatcher() {
  useEffect(() => {
    async function flush() {
      if (typeof localStorage !== "undefined" && localStorage.getItem(FORCE_KEY) === "1") {
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) return;
      const p = await listPending();
      if (p.length === 0) return;
      try {
        await syncNow();
      } catch {
        /* keep pending */
      }
    }

    void flush();
    window.addEventListener("online", flush);
    window.addEventListener("focus", flush);
    const timer = setInterval(() => void flush(), 20_000);

    return () => {
      window.removeEventListener("online", flush);
      window.removeEventListener("focus", flush);
      clearInterval(timer);
    };
  }, []);
  return null;
}
