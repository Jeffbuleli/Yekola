"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatFc } from "@/lib/plans";
import { MOMO_OPTIONS } from "@/lib/payments/momo-providers";
import { PaymentPendingPanel } from "@/components/payment-pending-panel";

type Tx = {
  id: string;
  type: string;
  amountCdf: number;
  description: string;
  createdAt: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<Tx[]>([]);
  const [amount, setAmount] = useState(1000);
  const [msisdn, setMsisdn] = useState("");
  const [momoProvider, setMomoProvider] = useState("");
  const [msg, setMsg] = useState("");
  const [mode, setMode] = useState("demo");
  const [pendingRef, setPendingRef] = useState<string | null>(null);

  async function refresh() {
    const res = await fetch("/api/studio");
    const d = await res.json();
    setBalance(d.stats?.walletBalanceCdf ?? 0);
    setTxs(d.walletTx ?? []);
    setMode(d.paymentsMode ?? "demo");
  }

  useEffect(() => {
    refresh();
  }, []);

  async function withdraw() {
    setMsg("");
    setPendingRef(null);
    const res = await fetch("/api/studio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "withdraw",
        amount,
        msisdn: msisdn || undefined,
        momoProvider: momoProvider || undefined,
      }),
    });
    const d = await res.json();
    if (!res.ok) {
      setMsg(d.message || d.error || "Échec");
      return;
    }
    if (d.pending && d.reference) {
      setPendingRef(d.reference);
      setMsg(d.payment?.message || "Retrait en cours");
      await refresh();
      return;
    }
    setMsg(d.payment?.message || "Retrait initié");
    await refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--yk-paper)] px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/studio" className="text-sm font-bold text-[var(--yk-teal)]">
          ← Studio
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-[var(--yk-forest)]">
          Portefeuille
        </h1>
        <p className="mt-1 text-sm text-[var(--yk-muted)]">
          Mode : {mode === "momo" ? "Mobile Money" : "Démo"}
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-[var(--yk-amber)]">
          {formatFc(balance)}
        </p>

        {pendingRef ? (
          <div className="mt-6">
            <PaymentPendingPanel
              reference={pendingRef}
              onPaid={() => {
                setPendingRef(null);
                refresh();
                setMsg("Retrait confirmé");
              }}
            />
          </div>
        ) : (
          <div className="yk-card mt-6 space-y-3">
            <h2 className="font-display font-bold">Retrait Mobile Money</h2>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
            <input
              placeholder="N° Mobile Money"
              value={msisdn}
              onChange={(e) => setMsisdn(e.target.value)}
              className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2"
            />
            <select
              value={momoProvider}
              onChange={(e) => setMomoProvider(e.target.value)}
              className="w-full rounded-lg border border-[var(--yk-line)] px-3 py-2 text-sm"
            >
              <option value="">Opérateur (auto)</option>
              {MOMO_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <button type="button" onClick={withdraw} className="yk-btn yk-btn-primary">
              Retirer
            </button>
            {msg && <p className="text-sm text-[var(--yk-muted)]">{msg}</p>}
          </div>
        )}

        <h2 className="font-display mt-8 font-bold">Historique</h2>
        <ul className="mt-3 space-y-2">
          {txs.map((t) => (
            <li key={t.id} className="yk-card flex justify-between text-sm">
              <span>{t.description}</span>
              <span className={t.amountCdf >= 0 ? "text-emerald-700" : "text-red-700"}>
                {t.amountCdf >= 0 ? "+" : "−"}
                {formatFc(Math.abs(t.amountCdf))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
