"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(!token ? "Lien invalide." : "");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password !== password2) {
      setError("Mots de passe différents.");
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
            ? "Lien expiré. Demandez-en un nouveau."
            : "Échec.",
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

  return (
    <AuthShell
      title="Nouveau mot de passe"
      footer={
        <Link href="/auth/forgot" className="font-bold text-[var(--yk-teal)]">
          Nouveau lien
        </Link>
      }
    >
      {!token ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className={authLabelClass}>
            Mot de passe
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={authInputClass}
            />
          </label>
          <label className={authLabelClass}>
            Confirmer
            <input
              type="password"
              required
              minLength={6}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className={authInputClass}
            />
          </label>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
          <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
            {busy ? "…" : "Enregistrer"}
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
