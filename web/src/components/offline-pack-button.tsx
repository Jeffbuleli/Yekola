"use client";

import { useEffect, useState } from "react";
import {
  getPack,
  hasPack,
  precacheLearnUrls,
  queueEvent,
  savePack,
  type OfflinePack,
} from "@/lib/sync/sync-manager";

export function OfflinePackButton({ courseId }: { courseId: string }) {
  const [ready, setReady] = useState(false);
  const [packMeta, setPackMeta] = useState<OfflinePack | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    hasPack(courseId).then(async (ok) => {
      setReady(ok);
      if (ok) setPackMeta(await getPack(courseId));
    });
  }, [courseId]);

  async function download() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch(`/api/offline/pack?courseId=${encodeURIComponent(courseId)}`);
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "Achetez ce cours pour télécharger le pack hors ligne.");
        return;
      }
      const pack = data.pack as OfflinePack;
      await savePack(pack);
      await precacheLearnUrls(pack);
      await queueEvent("PROGRESS_UPDATED", { courseId, action: "offline_pack_saved" });
      setReady(true);
      setPackMeta(pack);
      setMsg("Disponible hors ligne. Ouvrez les leçons même sans Internet.");
    } catch {
      setMsg("Téléchargement impossible. Vérifiez votre connexion.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="yk-card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display font-bold text-[var(--yk-forest)]">Pack hors ligne</p>
          <p className="text-sm text-[var(--yk-muted)]">
            {ready
              ? "Ce cours est disponible sans Internet (restez sur Yekola, ne fermez pas tout de suite après le téléchargement)."
              : "Téléchargez le contenu pour apprendre sans réseau. Gardez l’onglet ouvert le temps du téléchargement."}
          </p>
          {packMeta && (
            <p className="mt-1 text-xs text-[var(--yk-muted)]">
              Téléchargé le {new Date(packMeta.downloadedAt).toLocaleString("fr-CD")} ·{" "}
              {packMeta.modules.reduce((n, m) => n + m.lessons.length, 0)} leçons
            </p>
          )}
        </div>
        {ready ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            Disponible hors ligne
          </span>
        ) : (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
            Non téléchargé
          </span>
        )}
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={download}
        className="yk-btn yk-btn-secondary"
      >
        {busy ? "Téléchargement…" : ready ? "Retélécharger le pack" : "Télécharger pour hors ligne"}
      </button>
      {msg && <p className="text-sm text-[var(--yk-muted)]">{msg}</p>}
    </div>
  );
}
