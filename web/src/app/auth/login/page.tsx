"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";
import { PasskeyLoginButton } from "@/components/passkey-login-button";
import { PiLoginButton } from "@/components/pi-login-button";
import { PiAuthPanel } from "@/components/pi-auth-panel";
import { piConnectOnly } from "@/lib/pi/client-env";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState(
    params.get("reset") === "1"
      ? "Mot de passe mis à jour."
      : params.get("verified") === "1"
        ? "Email confirmé."
        : "",
  );
  const [busy, setBusy] = useState(false);
  const [needVerify, setNeedVerify] = useState(false);

  function goAfterLogin(role: string) {
    const next = params.get("next");
    const safe =
      next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    router.push(
      safe ||
        (role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn"),
    );
    router.refresh();
  }

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
        credentials: "same-origin",
        body: JSON.stringify({ action: "login", email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "email_not_verified") {
          setNeedVerify(true);
          setError("Confirmez votre email.");
          return;
        }
        setError("Email ou mot de passe incorrect.");
        return;
      }
      goAfterLogin(data.user.role);
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  async function resendVerify() {
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_verify", email }),
      });
      const data = await res.json();
      setInfo(
        data.emailSent === false
          ? "Envoi impossible. Réessayez."
          : "Email de confirmation renvoyé.",
      );
      setError("");
    } finally {
      setBusy(false);
    }
  }

  const pioneerOnly = piConnectOnly();

  if (pioneerOnly) {
    return (
      <AuthShell title="Connexion Pioneer">
        <PiAuthPanel onSuccess={(role) => goAfterLogin(role)} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Connexion"
      footer={
        <>
          Pas de compte ?{" "}
          <Link href="/auth/register" className="font-bold text-[var(--yk-teal)]">
            S’inscrire
          </Link>
        </>
      }
    >
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
            placeholder="you@email.com"
          />
        </label>
        <div>
          <div className="flex items-center justify-between gap-2">
            <label className={authLabelClass}>Mot de passe</label>
            <Link
              href="/auth/forgot"
              className="text-xs font-bold text-[var(--yk-teal)]"
            >
              Oublié ?
            </Link>
          </div>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
          />
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {info && (
          <p className="rounded-xl border border-[var(--yk-line)] bg-[var(--yk-paper)] px-3 py-2 text-sm text-[var(--yk-teal)]">
            {info}
          </p>
        )}
        {needVerify && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void resendVerify()}
            className="text-sm font-bold text-[var(--yk-amber)] underline"
          >
            Renvoyer la confirmation
          </button>
        )}
        <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
          {busy ? "…" : "Se connecter"}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-[var(--yk-line)]" />
        </div>
        <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-[var(--yk-muted)]">
          <span className="bg-white px-2">ou</span>
        </div>
      </div>

      <PasskeyLoginButton
        email={email}
        onSuccess={(data) => goAfterLogin(data.user.role)}
      />
      <div className="mt-3">
        <PiLoginButton onSuccess={(role) => goAfterLogin(role)} />
      </div>
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
