"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatFc } from "@/lib/plans";
import { MOMO_OPTIONS } from "@/lib/payments/momo-providers";
import { PaymentPendingPanel } from "@/components/payment-pending-panel";

export function BuyCourseButton({
  courseId,
  priceCdf,
}: {
  courseId: string;
  priceCdf: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msisdn, setMsisdn] = useState("");
  const [momoProvider, setMomoProvider] = useState("");
  const [msg, setMsg] = useState("");
  const [pendingRef, setPendingRef] = useState<string | null>(null);

  async function buy() {
    setBusy(true);
    setMsg("");
    setPendingRef(null);
    try {
      const res = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          msisdn: msisdn || undefined,
          momoProvider: momoProvider || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || data.error || "Achat impossible");
        return;
      }
      if (data.pending && data.reference) {
        setPendingRef(data.reference);
        setMsg(data.payment?.message || "Confirmez sur votre téléphone");
        return;
      }
      setMsg(data.payment?.message || "Achat réussi");
      router.push(`/learn/${courseId}`);
      router.refresh();
    } catch {
      setMsg("Erreur réseau");
    } finally {
      setBusy(false);
    }
  }

  if (pendingRef) {
    return (
      <PaymentPendingPanel
        reference={pendingRef}
        redirectTo={`/learn/${courseId}`}
      />
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="tel"
        placeholder="N° Mobile Money (0812… / 243…)"
        value={msisdn}
        onChange={(e) => setMsisdn(e.target.value)}
        className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
        required={priceCdf > 0}
      />
      <select
        value={momoProvider}
        onChange={(e) => setMomoProvider(e.target.value)}
        className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
      >
        <option value="">Opérateur (auto si possible)</option>
        {MOMO_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <button type="button" disabled={busy} onClick={buy} className="yk-btn yk-btn-primary">
        {busy ? "Paiement…" : `Acheter · ${formatFc(priceCdf)}`}
      </button>
      {msg && <p className="text-xs text-[var(--yk-muted)]">{msg}</p>}
    </div>
  );
}
