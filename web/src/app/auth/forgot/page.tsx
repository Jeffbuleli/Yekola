"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot_password", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Envoi impossible.");
        return;
      }
      setDone(true);
      setInfo(data.message || "Vérifiez votre boîte mail.");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      footer={
        <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
          Retour connexion
        </Link>
      }
    >
      {done ? (
        <p className="text-sm leading-relaxed text-[var(--yk-forest)]">{info}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className={authLabelClass}>
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authInputClass}
            />
          </label>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
            {busy ? "…" : "Envoyer le lien"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
