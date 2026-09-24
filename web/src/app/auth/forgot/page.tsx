"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "forgot_password", email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Impossible d’envoyer le lien.");
        return;
      }
      setDone(true);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Nous envoyons un lien de récupération à votre email."
    >
      {done ? (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[var(--yk-forest)]">
            Si un compte existe pour <strong>{email}</strong>, un email a été envoyé
            avec un lien valable 1 heure.
          </p>
          <Link href="/auth/login" className="yk-btn yk-btn-primary w-full">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-[var(--yk-forest)]">
            Email du compte
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
            {busy ? "Envoi…" : "Envoyer le lien"}
          </button>
          <p className="text-center text-sm">
            <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
              Retour connexion
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
