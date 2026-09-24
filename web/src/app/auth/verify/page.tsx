"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AuthShell } from "@/components/auth-shell";

function VerifyClient() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("Confirmation en cours…");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setMessage("Lien de confirmation invalide.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "verify_email", token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("err");
          setMessage(
            data.error === "invalid_or_expired"
              ? "Lien expiré ou déjà utilisé. Demandez un nouvel email."
              : "Confirmation impossible.",
          );
          return;
        }
        setStatus("ok");
        setMessage("Compte confirmé. Redirection…");
        const role = data.user?.role as string;
        setTimeout(() => {
          router.push(
            role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn",
          );
          router.refresh();
        }, 800);
      } catch {
        if (!cancelled) {
          setStatus("err");
          setMessage("Erreur réseau.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  return (
    <AuthShell title="Confirmation du compte" subtitle="Validation de votre adresse email.">
      <p
        className={`text-sm ${status === "err" ? "text-red-600" : "text-[var(--yk-forest)]"}`}
      >
        {message}
      </p>
      {status === "err" && (
        <div className="mt-6 space-y-3">
          <Link href={`/auth/check-email`} className="yk-btn yk-btn-primary w-full">
            Renvoyer l’email
          </Link>
          <Link href="/auth/login" className="yk-btn yk-btn-ghost w-full">
            Connexion
          </Link>
        </div>
      )}
    </AuthShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyClient />
    </Suspense>
  );
}
