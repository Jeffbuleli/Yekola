"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import {
  AuthShell,
  authInputClass,
  authLabelClass,
} from "@/components/auth-shell";

function CheckEmailForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [info, setInfo] = useState(
    params.get("sent") === "1"
      ? "Ouvrez le lien reçu par email."
      : "Compte créé. Renvoyez l’email si besoin.",
  );
  const [busy, setBusy] = useState(false);

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
      setInfo(
        data.emailSent === false
          ? "Envoi impossible. Réessayez."
          : "Email renvoyé.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Vérifiez votre email"
      footer={
        <Link href="/auth/login" className="font-bold text-[var(--yk-teal)]">
          Connexion
        </Link>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--yk-forest)]">{info}</p>
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
