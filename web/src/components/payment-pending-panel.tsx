"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  humanizePaymentMessage,
  paymentStatusLabel,
} from "@/lib/payments/messages";

export function PaymentPendingPanel({
  reference,
  onPaid,
  redirectTo,
}: {
  reference: string;
  onPaid?: () => void;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState(
    "Validez le paiement sur votre téléphone…",
  );

  useEffect(() => {
    let cancelled = false;
    let tries = 0;

    async function poll() {
      tries += 1;
      try {
        const res = await fetch(
          `/api/payments/status?ref=${encodeURIComponent(reference)}`,
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setMessage(
            humanizePaymentMessage(data.message || data.error, "failed"),
          );
          return;
        }
        const st = String(data.payment?.status || "pending");
        setStatus(st);
        setMessage(humanizePaymentMessage(data.payment?.message, st));
        if (data.paid) {
          setMessage("Paiement confirmé.");
          onPaid?.();
          if (redirectTo) {
            router.push(redirectTo);
            router.refresh();
          }
          return;
        }
        if (st === "failed") return;
      } catch {
        if (!cancelled) setMessage("Réseau instable — nouvelle tentative…");
      }
      if (!cancelled && tries < 60) {
        setTimeout(poll, 3000);
      } else if (!cancelled && tries >= 60) {
        setMessage(
          "Toujours en attente. Si vous avez confirmé sur MoMo, rafraîchissez la page.",
        );
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  return (
    <div className="yk-card space-y-2 border-[var(--yk-amber)]">
      <p className="font-display font-bold text-[var(--yk-forest)]">
        Paiement Mobile Money
      </p>
      <p className="text-sm text-[var(--yk-forest)]">{message}</p>
      <p className="text-xs text-[var(--yk-muted)]">
        Réf. <code className="break-all">{reference}</code>
        {" · "}
        <strong>{paymentStatusLabel(status)}</strong>
      </p>
      {(status === "pending" || status === "processing") && (
        <p className="text-xs text-amber-800">
          Ouvrez votre app MoMo et confirmez. Cette page se met à jour
          automatiquement.
        </p>
      )}
    </div>
  );
}
