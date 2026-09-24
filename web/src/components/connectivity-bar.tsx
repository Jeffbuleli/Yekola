"use client";

import { useCallback, useEffect, useState } from "react";
import {
  detectMode,
  listPending,
  syncNow,
  type ConnectivityMode,
} from "@/lib/sync/sync-manager";

const FORCE_KEY = "yekola_force_offline";

export function ConnectivityBar() {
  const [mode, setMode] = useState<ConnectivityMode>("online");
  const [pending, setPending] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [forced, setForced] = useState(false);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const force = localStorage.getItem(FORCE_KEY) === "1";
    setForced(force);
    const p = await listPending();
    setPending(p.length);
    setMode(detectMode(p.length, force));
  }, []);

  useEffect(() => {
    refresh();
    const onOnline = () => refresh();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOnline);
    const t = setInterval(refresh, 4000);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOnline);
      clearInterval(t);
    };
  }, [refresh]);

  async function toggleOffline() {
    const next = !(localStorage.getItem(FORCE_KEY) === "1");
    localStorage.setItem(FORCE_KEY, next ? "1" : "0");
    await refresh();
  }

  async function doSync() {
    if (forced || !navigator.onLine) return;
    setBusy(true);
    try {
      const r = await syncNow();
      setLastSync(new Date().toLocaleTimeString("fr-CD"));
      await refresh();
      if (r.synced === 0) setMode("online");
    } catch {
      /* keep pending */
    } finally {
      setBusy(false);
    }
  }

  const label =
    mode === "offline"
      ? "Mode hors ligne"
      : mode === "syncing"
        ? "Synchronisation"
        : "Connecté";
  const color =
    mode === "offline" ? "bg-sky-500" : mode === "syncing" ? "bg-amber-400" : "bg-emerald-500";

  return (
    <div className="sticky top-0 z-50 border-b border-[var(--yk-line)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
        <div className="flex items-center gap-2 font-medium text-[var(--yk-ink)]">
          <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />
          <span>{label}</span>
          {pending > 0 && (
            <span className="text-[var(--yk-muted)]">
              · {pending} activité{pending > 1 ? "s" : ""} en attente
            </span>
          )}
          {lastSync && mode === "online" && (
            <span className="hidden text-[var(--yk-muted)] sm:inline">· sync {lastSync}</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleOffline}
            className="rounded-lg border border-[var(--yk-line)] px-3 py-1.5 text-xs font-semibold"
          >
            {forced ? "Désactiver offline démo" : "Simuler offline"}
          </button>
          <button
            type="button"
            disabled={busy || forced || pending === 0}
            onClick={doSync}
            className="rounded-lg bg-[var(--yk-forest)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
          >
            {busy ? "Sync…" : "Synchroniser"}
          </button>
        </div>
      </div>
      {mode === "offline" && (
        <div className="bg-sky-50 px-4 py-1.5 text-center text-xs text-sky-900">
          Learning Hub local actif - les quiz et progrès restent sur cet appareil jusqu&apos;à la sync.
        </div>
      )}
    </div>
  );
}
