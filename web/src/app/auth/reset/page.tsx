"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(!token ? "Lien invalide ou incomplet." : "");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "invalid_or_expired"
            ? "Lien expiré ou déjà utilisé. Demandez un nouveau lien."
            : "Réinitialisation impossible.",
        );
        return;
      }
      router.push("/auth/login?reset=1");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]";

  return (
    <AuthShell title="Nouveau mot de passe" subtitle="Choisissez un mot de passe d’au moins 6 caractères.">
      {!token ? (
        <div className="space-y-4">
          <p className="text-sm text-red-600">{error}</p>
          <Link href="/auth/forgot" className="yk-btn yk-btn-primary w-full">
            Demander un nouveau lien
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-[var(--yk-forest)]">
            Nouveau mot de passe
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-semibold text-[var(--yk-forest)]">
            Confirmer
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={inputClass}
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
            {busy ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
