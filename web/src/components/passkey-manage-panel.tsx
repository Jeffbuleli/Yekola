"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import { useEffect, useState } from "react";

export function PasskeyManagePanel() {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const res = await fetch("/api/auth/passkey", { credentials: "same-origin" });
    const d = await res.json();
    setCount(d.passkeyCount ?? 0);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function addPasskey() {
    setBusy(true);
    setMsg("");
    try {
      const optRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "register_options" }),
      });
      const opt = await optRes.json();
      if (!optRes.ok) {
        setMsg(opt.error || "Impossible");
        return;
      }
      const att = await startRegistration({ optionsJSON: opt.options });
      const verRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "register_verify",
          challengeId: opt.challengeId,
          response: att,
        }),
      });
      const data = await verRes.json();
      if (!verRes.ok) {
        setMsg(data.error || "Échec");
        return;
      }
      setCount(data.passkeyCount ?? count + 1);
      setMsg("Passkey ajoutée. Elle servira aussi de SUDO (retraits).");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Annulé");
    } finally {
      setBusy(false);
    }
  }

  async function testSudo() {
    setBusy(true);
    setMsg("");
    try {
      const optRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "stepup_options" }),
      });
      const opt = await optRes.json();
      if (!optRes.ok) {
        setMsg(opt.error === "no_passkey" ? "Ajoutez d’abord une passkey." : opt.error);
        return;
      }
      const assertion = await startAuthentication({ optionsJSON: opt.options });
      const verRes = await fetch("/api/auth/passkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "stepup_verify",
          challengeId: opt.challengeId,
          response: assertion,
        }),
      });
      const data = await verRes.json();
      if (!verRes.ok) {
        setMsg(data.error || "SUDO refusé");
        return;
      }
      setMsg("SUDO actif 10 min.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Annulé");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="yk-card space-y-3 sm:col-span-2">
      <p className="text-xs font-bold uppercase text-[var(--yk-muted)]">Passkey / SUDO</p>
      <p className="text-sm text-[var(--yk-forest)]">
        {count > 0
          ? `${count} passkey enregistrée${count > 1 ? "s" : ""}.`
          : "Aucune passkey."}{" "}
        Utilisée pour la connexion et le SUDO (retraits portefeuille).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void addPasskey()}
          className="yk-btn yk-btn-primary !py-2 !text-sm"
        >
          {busy ? "…" : "Ajouter une passkey"}
        </button>
        {count > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void testSudo()}
            className="yk-btn yk-btn-ghost !py-2 !text-sm"
          >
            Valider SUDO
          </button>
        )}
      </div>
      {msg && <p className="text-xs text-[var(--yk-muted)]">{msg}</p>}
    </article>
  );
}
