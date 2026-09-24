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
  const [message, setMessage] = useState("Confirmation…");

  useEffect(() => {
    if (!token) {
      setStatus("err");
      setMessage("Lien invalide.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ action: "verify_email", token }),
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setStatus("err");
          setMessage(
            data.error === "invalid_or_expired"
              ? "Lien expiré ou déjà utilisé."
              : "Confirmation impossible.",
          );
          return;
        }
        setStatus("ok");
        setMessage("Compte confirmé.");
        const role = data.user?.role as string;
        setTimeout(() => {
          router.push(
            role === "admin" ? "/admin" : role === "teacher" ? "/studio" : "/learn",
          );
          router.refresh();
        }, 600);
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
    <AuthShell
      title="Confirmation"
      footer={
        status === "err" ? (
          <Link href="/auth/check-email" className="font-bold text-[var(--yk-teal)]">
            Renvoyer l’email
          </Link>
        ) : null
      }
    >
      <p className={`text-sm ${status === "err" ? "text-red-600" : "text-[var(--yk-forest)]"}`}>
        {message}
      </p>
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
