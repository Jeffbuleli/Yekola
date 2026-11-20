"use client";

import { useState } from "react";
import { piInit } from "@/lib/pi/browser";

export function PiLoginButton({
  onSuccess,
}: {
  onSuccess: (role: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const Pi = await piInit();
      const auth = await Pi.authenticate(["username"], async () => {});
      const res = await fetch("/api/pi/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Connexion Pi refusée");
      }
      onSuccess(data.user?.role || "learner");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion Pi impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={() => void signIn()}
        className="yk-btn yk-btn-secondary w-full disabled:opacity-50"
      >
        {busy ? "Pi…" : "Continuer avec Pi"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
