"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function CheckEmailForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const sent = params.get("sent") === "1";
  const [info, setInfo] = useState(
    sent
      ? "Ouvrez votre boîte mail et cliquez sur le lien de confirmation."
      : "Compte créé. Si l’email n’arrive pas, renvoyez-le ci-dessous.",
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
          ? "Envoi impossible pour le moment. Réessayez dans une minute."
          : "Email renvoyé (si le compte existe et n’est pas encore confirmé).",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Vérifiez votre email"
      subtitle="Un dernier clic pour activer votre compte Yekola."
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--yk-forest)]">{info}</p>
        {email && (
          <p className="rounded-lg bg-[var(--yk-paper)] px-3 py-2 text-sm font-semibold text-[var(--yk-teal)]">
            {email}
          </p>
        )}
        <label className="block text-sm font-semibold text-[var(--yk-forest)]">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-[var(--yk-line)] px-3 py-2.5 text-sm"
          />
        </label>
        <button
          type="button"
          disabled={busy || !email}
          onClick={resend}
          className="yk-btn yk-btn-secondary w-full"
        >
          {busy ? "Envoi…" : "Renvoyer l’email de confirmation"}
        </button>
        <Link href="/auth/login" className="yk-btn yk-btn-ghost w-full">
          J’ai confirmé · Se connecter
        </Link>
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
