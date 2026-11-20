"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function CheckEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [info, setInfo] = useState(
    params.get("sent") === "1"
      ? "Ouvrez le lien reçu par email (téléphone ou PC). Cet écran se connectera tout seul."
      : "Compte créé. Renvoyez l’email si besoin.",
  );
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    const fromQuery = params.get("poll");
    if (fromQuery) savePollToken(fromQuery);
    if (!readPollToken()) return;

    setWaiting(true);
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await pollLoginOnce();
        if (cancelled) return;
        if (r.ready) {
          setInfo("Email confirmé — connexion…");
          const role = r.user?.role;
          router.push(
            role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn",
          );
          router.refresh();
        }
      } catch {
        /* keep waiting */
      }
    };
    void tick();
    const id = setInterval(() => void tick(), 2500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [params, router]);

  async function resend() {
    if (!email) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resend_verify", email }),
      });
      const data = await res.json();
      if (data.pollToken) savePollToken(data.pollToken);
      setWaiting(Boolean(readPollToken()));
      setInfo(
        data.emailSent === false
          ? "Envoi impossible. Réessayez."
          : "Email renvoyé. Confirmez sur n’importe quel appareil — cet écran suivra.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Vérifiez votre email"
      footer={
        <Link
          href="/auth/login"
          className="font-bold text-[var(--yk-teal)]"
          onClick={() => clearPollToken()}
        >
          Connexion
        </Link>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--yk-forest)]">{info}</p>
        {waiting && (
          <p className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-900">
            En attente de confirmation… (même si vous ouvrez le lien sur téléphone)
          </p>
        )}
        <label className={authLabelClass}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
          />
        </label>
        <button
          type="button"
          disabled={busy || !email}
          onClick={() => void resend()}
          className="yk-btn yk-btn-secondary w-full"
        >
          {busy ? "…" : "Renvoyer"}
        </button>
      </div>
    </AuthShell>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailForm />
    </Suspense>
  );
}
