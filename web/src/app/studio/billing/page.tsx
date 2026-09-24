"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Plan } from "@/lib/plans";
import { formatFc } from "@/lib/plans";
import { MOMO_OPTIONS } from "@/lib/payments/momo-providers";
import { PaymentPendingPanel } from "@/components/payment-pending-panel";
import { humanizePaymentMessage } from "@/lib/payments/messages";
import { IconCheck } from "@/components/icons";

function BillingInner() {
  const params = useSearchParams();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [current, setCurrent] = useState<string>("free");
  const [msisdn, setMsisdn] = useState("");
  const [momoProvider, setMomoProvider] = useState("");
  const [mode, setMode] = useState("demo");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingRef, setPendingRef] = useState<string | null>(null);
  const prefer = params.get("plan");

  useEffect(() => {
    fetch("/api/studio")
      .then((r) => r.json())
      .then((d) => {
        setPlans(d.plans ?? []);
        setCurrent(d.academy?.planId ?? "free");
        setMode(d.paymentsMode ?? "demo");
      });
  }, []);

  async function subscribe(planId: string) {
    setBusy(true);
    setMsg("");
    setPendingRef(null);
    try {
      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "subscribe",
          planId,
          msisdn: msisdn || undefined,
          momoProvider: momoProvider || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(humanizePaymentMessage(data.message || data.error, "failed"));
        return;
      }
      if (data.pending && data.reference) {
        setPendingRef(data.reference);
        setMsg(humanizePaymentMessage(data.payment?.message, "pending"));
        return;
      }
      setCurrent(planId);
      setMsg(humanizePaymentMessage(data.payment?.message, "paid"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/studio" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Studio
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-[var(--yk-forest)]">
          Abonnement
        </h1>
        <p className="mt-2 text-[var(--yk-muted)]">
          Plan actuel : <strong>{current}</strong> · Paiements :{" "}
          <strong>{mode === "momo" ? "Mobile Money" : "Démo"}</strong>
        </p>

        {pendingRef ? (
          <div className="mt-6">
            <PaymentPendingPanel
              reference={pendingRef}
              onPaid={() => {
                setPendingRef(null);
                fetch("/api/studio")
                  .then((r) => r.json())
                  .then((d) => setCurrent(d.academy?.planId ?? current));
                setMsg("Abonnement confirmé");
              }}
            />
          </div>
        ) : (
          <>
            <div className="mt-4 grid max-w-lg gap-2">
              <input
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                className="rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
                placeholder="N° Mobile Money (requis en mode MoMo)"
              />
              <select
                value={momoProvider}
                onChange={(e) => setMomoProvider(e.target.value)}
                className="rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
              >
                <option value="">Opérateur (auto)</option>
                {MOMO_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {msg && <p className="mt-3 text-sm text-[var(--yk-teal)]">{msg}</p>}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {plans.map((p) => (
                <article
                  key={p.id}
                  className={`yk-card ${prefer === p.id || current === p.id ? "ring-2 ring-[var(--yk-amber)]" : ""}`}
                >
                  <h2 className="font-display text-lg font-bold">{p.name}</h2>
                  <p className="font-display text-2xl font-bold">
                    {formatFc(p.priceCdf)}/mois
                  </p>
                  <ul className="mt-3 space-y-1 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <IconCheck size={16} className="mt-0.5 shrink-0 text-[var(--yk-lime)]" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    disabled={busy || current === p.id}
                    onClick={() => subscribe(p.id)}
                    className="yk-btn yk-btn-primary mt-4 w-full disabled:opacity-50"
                  >
                    {current === p.id ? "Plan actif" : `Passer à ${p.name}`}
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingInner />
    </Suspense>
  );
}
