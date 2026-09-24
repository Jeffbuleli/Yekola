"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "teacher" ? "teacher" : "learner";
  const [role, setRole] = useState<"teacher" | "learner">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [city, setCity] = useState("Kinshasa");
  const [error, setError] = useState("");
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
        body: JSON.stringify({
          action: "register",
          role,
          name,
          email,
          password,
          academyName: role === "teacher" ? academyName : undefined,
          city: role === "teacher" ? city : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "email_taken"
            ? "Cet email est déjà utilisé."
            : "Inscription impossible. Vérifiez vos informations.",
        );
        return;
      }
      if (data.pendingVerification) {
        const q = new URLSearchParams({
          email: data.email || email,
          sent: data.emailSent ? "1" : "0",
        });
        router.push(`/auth/check-email?${q.toString()}`);
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

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--yk-teal)]";

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Confirmation par email obligatoire (sauf comptes démo)."
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition ${
              role === "teacher"
                ? "border-[var(--yk-amber)] bg-amber-50 text-[var(--yk-forest)]"
                : "border-[var(--yk-line)] text-[var(--yk-muted)]"
            }`}
          >
            Enseignant
          </button>
          <button
            type="button"
            onClick={() => setRole("learner")}
            className={`rounded-lg border px-3 py-2.5 text-sm font-bold transition ${
              role === "learner"
                ? "border-[var(--yk-amber)] bg-amber-50 text-[var(--yk-forest)]"
                : "border-[var(--yk-line)] text-[var(--yk-muted)]"
            }`}
          >
            Apprenant
          </button>
        </div>
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Nom complet
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Mot de passe
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
          Confirmer le mot de passe
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
        {role === "teacher" && (
          <>
            <label className="block text-sm font-semibold text-[var(--yk-forest)]">
              Nom de l’académie
              <input
                required
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                placeholder="Ex. Académie Patty"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-semibold text-[var(--yk-forest)]">
              Ville
              <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </label>
          </>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
          {busy
            ? "Création…"
            : role === "teacher"
              ? "Créer mon académie"
              : "S’inscrire"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[var(--yk-muted)]">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
          Connexion
        </Link>
      </p>
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
