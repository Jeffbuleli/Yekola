"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";
import { savePollToken } from "@/lib/auth/poll-login";
import { PiAuthPanel } from "@/components/pi-auth-panel";
import { piConnectOnly } from "@/lib/pi/client-env";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();

  function goAfterPi(role: string) {
    router.push(role === "teacher" ? "/studio" : "/learn");
    router.refresh();
  }
  const initialRole = params.get("role") === "teacher" ? "teacher" : "learner";
  const [role, setRole] = useState<"teacher" | "learner">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [error, setError] = useState("");
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
        credentials: "same-origin",
        body: JSON.stringify({
          action: "register",
          role,
          name,
          email,
          password,
          academyName: role === "teacher" ? academyName || `Académie ${name}` : undefined,
          city: role === "teacher" ? "Kinshasa" : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "email_taken" ? "Email déjà utilisé." : "Inscription impossible.",
        );
        return;
      }
      if (data.pendingVerification) {
        if (data.pollToken) savePollToken(data.pollToken);
        const q = new URLSearchParams({
          email: data.email || email,
          sent: data.emailSent ? "1" : "0",
        });
        if (data.pollToken) q.set("poll", data.pollToken);
        router.push(`/auth/check-email?${q}`);
        return;
      }
      const plan = params.get("plan");
      if (role === "teacher" && plan && plan !== "free") {
        router.push(`/studio/billing?plan=${plan}`);
      } else {
        router.push(role === "teacher" ? "/studio" : "/catalog");
      }
      router.refresh();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(false);
    }
  }

  if (piConnectOnly()) {
    return (
      <AuthShell
        title="Compte Pioneer"
        footer={
          <Link href="/catalog" className="font-bold text-[var(--yk-teal)]">
            Parcourir le catalogue
          </Link>
        }
      >
        <PiAuthPanel onSuccess={goAfterPi} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Créer un compte"
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
            Connexion
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {(["learner", "teacher"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-bold ${
                role === r
                  ? "border-[var(--yk-amber)] bg-amber-50 text-[var(--yk-forest)]"
                  : "border-[var(--yk-line)] text-[var(--yk-muted)]"
              }`}
            >
              {r === "teacher" ? "Enseignant" : "Apprenant"}
            </button>
          ))}
        </div>
        <label className={authLabelClass}>
          Nom
          <input required value={name} onChange={(e) => setName(e.target.value)} className={authInputClass} />
        </label>
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
        <label className={authLabelClass}>
          Mot de passe
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
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
            autoComplete="new-password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className={authInputClass}
          />
        </label>
        {role === "teacher" && (
          <label className={authLabelClass}>
            Académie
            <input
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              placeholder="Nom de l’académie"
              className={authInputClass}
            />
          </label>
        )}
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
          {busy ? "…" : "Continuer"}
        </button>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
