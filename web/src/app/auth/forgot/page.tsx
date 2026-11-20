"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";
import {
  clearPollToken,
  pollLoginOnce,
  readPollToken,
  savePollToken,
} from "@/lib/auth/poll-login";

export default function ForgotPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!done) return;
    if (!readPollToken()) return;
    setWaiting(true);
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await pollLoginOnce();
        if (cancelled) return;
        if (r.ready) {
          setInfo("Mot de passe mis à jour — connexion…");
          const role = r.user?.role;
          router.push(
            role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn",
          );
          router.refresh();
        }
      } catch {
        /* keep */
      }
    };
    void tick();
    const id = setInterval(() => void tick(), 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [done, router]);

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
      if (data.pollToken) {
        savePollToken(data.pollToken);
        setWaiting(true);
      }
      setDone(true);
      setInfo(
        data.message ||
          "Vérifiez votre boîte mail. Si vous changez le mot de passe sur téléphone, cet écran se connectera.",
      );
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
        <Link
          href="/auth/login"
          className="font-bold text-[var(--yk-teal)]"
          onClick={() => clearPollToken()}
        >
          Retour connexion
        </Link>
      }
    >
      {done ? (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-[var(--yk-forest)]">{info}</p>
          {waiting && (
            <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
              En attente… ouvrez le lien sur n’importe quel appareil.
            </p>
          )}
        </div>
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
