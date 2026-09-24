"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    params.get("verified") === "1"
      ? "Email confirmé. Vous pouvez vous connecter."
      : params.get("reset") === "1"
        ? "Mot de passe mis à jour. Connectez-vous."
        : "",
  );
  const [busy, setBusy] = useState(false);
  const [needVerify, setNeedVerify] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    setNeedVerify(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "email_not_verified") {
          setNeedVerify(true);
          setError(data.message || "Confirmez votre email d’abord.");
          return;
        }
        setError("Email ou mot de passe incorrect.");
        return;
      }
      const role = data.user.role as string;
      router.push(role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn");
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerify() {
    setBusy(true);
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_verify", email }),
      });
      setInfo("Si un compte existe, un nouvel email de confirmation a été envoyé.");
      setError("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à vos cours ou à votre studio enseignant."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]"
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Mot de passe
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]"
          />
        </label>
        <div className="flex justify-end">
          <Link
            href="/auth/forgot"
            className="text-xs font-bold text-[var(--yk-teal)] hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-[var(--yk-teal)]">{info}</p>}
        {needVerify && (
          <button
            type="button"
            disabled={busy}
            onClick={resendVerify}
            className="text-sm font-bold text-[var(--yk-amber)] underline"
          >
            Renvoyer l’email de confirmation
          </button>
        )}
        <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--yk-muted)]">
        Pas de compte ?{" "}
        <Link href="/auth/register" className="font-bold text-[var(--yk-teal)]">
          S’inscrire
        </Link>
      </p>
      <p className="mt-4 rounded-lg bg-[var(--yk-paper)] px-3 py-2 text-[11px] leading-relaxed text-[var(--yk-muted)]">
        Démo · mdp <code className="font-semibold">yekola2026</code>
        <br />
        dan@yekola.demo · patty@yekola.demo · jeff@yekola.demo
      </p>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
