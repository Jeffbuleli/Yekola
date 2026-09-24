"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectMode,
  FORCE_KEY,
  listPending,
  syncNow,
  type ConnectivityMode,
} from "@/lib/sync/sync-manager";

export function ConnectivityBar() {
  const [mode, setMode] = useState<ConnectivityMode>("online");
  const [pending, setPending] = useState(0);
  const [forced, setForced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const force = localStorage.getItem(FORCE_KEY) === "1";
    setForced(force);
    const p = await listPending();
    setPending(p.length);
    setMode(detectMode(p.length, force));
  }, []);

  useEffect(() => {
    refresh();

    async function onOnline() {
      await refresh();
      if (localStorage.getItem(FORCE_KEY) === "1") return;
      const p = await listPending();
      if (p.length === 0) return;
      try {
        const r = await syncNow();
        if (r.synced > 0) {
          setToast(
            `${r.synced} activité${r.synced > 1 ? "s" : ""} synchronisée${r.synced > 1 ? "s" : ""}`,
          );
          setTimeout(() => setToast(null), 4000);
        }
        await refresh();
      } catch {
        /* keep pending */
      }
    }

    function onOffline() {
      refresh();
    }

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    const t = setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      clearInterval(t);
    };
  }, [refresh]);

  async function toggleOffline() {
    const next = !(localStorage.getItem(FORCE_KEY) === "1");
    localStorage.setItem(FORCE_KEY, next ? "1" : "0");
    if (!next) {
      try {
        await syncNow();
      } catch {
        /* ignore */
      }
    }
    await refresh();
  }

  async function doSync() {
    if (forced || !navigator.onLine) return;
    setBusy(true);
    try {
      const r = await syncNow();
      if (r.synced > 0) setToast(`${r.synced} synchronisée(s)`);
      await refresh();
    } catch {
      setToast("Échec de synchronisation");
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 3500);
    }
  }

  const label =
    mode === "offline" ? "Hors ligne" : mode === "syncing" ? "À synchroniser" : "En ligne";
  const color =
    mode === "offline" ? "bg-sky-500" : mode === "syncing" ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="sticky top-0 z-50 border-b border-[var(--yk-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-[var(--yk-ink)]">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
          <span>{label}</span>
          {pending > 0 && (
            <span className="text-[var(--yk-muted)]">· {pending} à synchroniser</span>
          )}
          {toast && <span className="text-emerald-700">· {toast}</span>}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleOffline}
            className="rounded-lg border border-[var(--yk-line)] px-3 py-1.5 text-xs font-semibold"
          >
            {forced ? "Revenir en ligne" : "Simuler hors ligne"}
          </button>
          <button
            type="button"
            disabled={busy || forced || pending === 0}
            onClick={doSync}
            className="rounded-lg bg-[var(--yk-forest)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {busy ? "…" : "Synchroniser"}
          </button>
        </div>
      </div>
      {mode === "offline" && (
        <div className="bg-sky-50 px-4 py-1.5 text-center text-xs text-sky-900">
          Mode hors ligne — leçons et quiz du pack restent sur cet appareil jusqu&apos;à la sync.
        </div>
      )}
    </div>
  );
}
