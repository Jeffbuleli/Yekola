"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = params.get("role") === "teacher" ? "teacher" : "learner";
  const [role, setRole] = useState<"teacher" | "learner">(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [academyName, setAcademyName] = useState("");
  const [city, setCity] = useState("Kinshasa");
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
            : "Inscription impossible.",
        );
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

  return (
    <form onSubmit={onSubmit} className="yk-card mx-auto max-w-md space-y-4">
      <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)]">Créer un compte</h1>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setRole("teacher")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold ${
            role === "teacher"
              ? "border-[var(--yk-amber)] bg-amber-50 text-[var(--yk-forest)]"
              : "border-[var(--yk-line)]"
          }`}
        >
          Enseignant
        </button>
        <button
          type="button"
          onClick={() => setRole("learner")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-bold ${
            role === "learner"
              ? "border-[var(--yk-amber)] bg-amber-50 text-[var(--yk-forest)]"
              : "border-[var(--yk-line)]"
          }`}
        >
          Apprenant
        </button>
      </div>
      <label className="block text-sm font-semibold">
        Nom complet
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
        />
      </label>
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
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
        />
      </label>
      {role === "teacher" && (
        <>
          <label className="block text-sm font-semibold">
            Nom de l’académie
            <input
              required
              value={academyName}
              onChange={(e) => setAcademyName(e.target.value)}
              placeholder="Ex. Académie Jeff"
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
          <label className="block text-sm font-semibold">
            Ville
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
          </label>
        </>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="yk-btn yk-btn-primary w-full">
        {busy ? "…" : role === "teacher" ? "Créer mon académie" : "S’inscrire"}
      </button>
      <p className="text-center text-sm">
        Déjà inscrit ?{" "}
        <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
          Connexion
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-12">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
