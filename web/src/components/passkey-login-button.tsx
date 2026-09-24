"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";

export function PasskeyLoginButton({
  email,
  onSuccess,
}: {
  email: string;
  onSuccess: (data: { user: { role: string } }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setBusy(true);
    setErr("");
    try {
      const optRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "login_options",
          email: email || undefined,
        }),
      });
      const opt = await optRes.json();
      if (!optRes.ok) {
        setErr(opt.error || "Passkey indisponible");
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: opt.options });
      const verRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "login_verify",
          challengeId: opt.challengeId,
          response: assertion,
        }),
      });
      const data = await verRes.json();
      if (!verRes.ok) {
        setErr(
          data.error === "email_not_verified"
            ? "Confirmez votre email d’abord."
            : data.error || "Passkey refusée",
        );
        return;
      }
      onSuccess(data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Passkey annulée");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void run()}
        className="yk-btn yk-btn-ghost w-full"
      >
        {busy ? "…" : "Passkey / SUDO"}
      </button>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
    </div>
  );
}
