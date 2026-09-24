"use client";

import { useState } from "react";

export function MeetJoinButton({ courseId }: { courseId: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function join() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/meet?courseId=${encodeURIComponent(courseId)}`);
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error || "Impossible d’ouvrir Meet");
        return;
      }
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch {
      setErr("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={join}
        className="yk-btn yk-btn-ghost"
      >
        {busy ? "…" : "Rejoindre la séance audio"}
      </button>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}
