"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
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

  return (
    <form onSubmit={onSubmit} className="yk-card mx-auto max-w-md space-y-4">
      <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">Connexion</h1>
      <p className="text-sm text-[var(--yk-muted)]">
        Démo · mot de passe <code>yekola2026</code>
        <br />
        Apprenant : dan@yekola.demo · Enseignant : patty@yekola.demo · Admin : jeff@yekola.demo
      </p>
      <label className="block text-sm font-semibold">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
        />
      </label>
      <label className="block text-sm font-semibold">
        Mot de passe
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
        {busy ? "…" : "Se connecter"}
      </button>
      <p className="text-center text-sm">
        Pas de compte ?{" "}
        <Link href="/auth/register" className="font-bold text-[var(--yk-teal)]">
          S’inscrire
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-12">
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
