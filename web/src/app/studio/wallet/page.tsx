"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { formatFc } from "@/lib/plans";
import { MOMO_OPTIONS } from "@/lib/payments/momo-providers";
import { PaymentPendingPanel } from "@/components/payment-pending-panel";
import { humanizePaymentMessage } from "@/lib/payments/messages";

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
  const [busy, setBusy] = useState(false);

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

  async function ensureSudo() {
    const optRes = await fetch("/api/auth/passkey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action: "stepup_options" }),
    });
    const opt = await optRes.json();
    if (!optRes.ok) {
      if (opt.error === "no_passkey") return {};
      throw new Error(opt.message || opt.error || "SUDO impossible");
    }
    const assertion = await startAuthentication({ optionsJSON: opt.options });
    return { passkeyChallengeId: opt.challengeId, passkeyResponse: assertion };
  }

  async function withdraw() {
    setBusy(true);
    setMsg("");
    setPendingRef(null);
    try {
      let sudoPayload: Record<string, unknown> = {};
      try {
        sudoPayload = await ensureSudo();
      } catch {
        /* no passkey → server allows */
      }

      const res = await fetch("/api/studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "withdraw",
          amount,
          msisdn: msisdn || undefined,
          momoProvider: momoProvider || undefined,
          ...sudoPayload,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        if (d.error === "sudo_required") {
          setMsg("Ajoutez une passkey (Profil) puis validez SUDO pour retirer.");
        } else if (d.error === "insufficient_balance") {
          setMsg("Solde insuffisant pour ce retrait.");
        } else {
          setMsg(
            humanizePaymentMessage(
              d.message || d.error || d.pay?.message || d.payment?.message || d.pay,
              "failed",
            ),
          );
        }
        return;
      }
      if (d.pending && d.reference) {
        setPendingRef(d.reference);
        setMsg(
          humanizePaymentMessage(
            d.payment?.message,
            d.payment?.status || "pending",
          ),
        );
        await refresh();
        return;
      }
      setMsg(
        humanizePaymentMessage(
          d.payment?.message,
          d.payment?.status || "paid",
        ),
      );
      await refresh();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-[var(--yk-forest)] sm:text-3xl">
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
            <p className="text-xs text-[var(--yk-muted)]">
              Si une passkey est enregistrée, SUDO sera demandé.
            </p>
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
            <button
              type="button"
              disabled={busy}
              onClick={() => void withdraw()}
              className="yk-btn yk-btn-primary"
            >
              {busy ? "…" : "Retirer"}
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
  );
}
