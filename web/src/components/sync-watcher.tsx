"use client";

import { useEffect } from "react";
import { FORCE_KEY, listPending, syncNow } from "@/lib/sync/sync-manager";

/** Sync silencieuse au retour réseau (sans bandeau UI). */
export function SyncWatcher() {
  useEffect(() => {
    async function onOnline() {
      if (localStorage.getItem(FORCE_KEY) === "1") return;
      const p = await listPending();
      if (p.length === 0) return;
      try {
        await syncNow();
      } catch {
        /* keep pending */
      }
    }
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);
  return null;
}
