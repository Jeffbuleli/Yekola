"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPi } from "@/lib/plans";
import { piInit } from "@/lib/pi/browser";

type Kind = "course_purchase" | "teacher_subscription";

export function PiCheckoutButton({
  kind,
  amountPi,
  courseId,
  planId,
  label,
  redirectTo,
}: {
  kind: Kind;
  amountPi: number;
  courseId?: string;
  planId?: string;
  label: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function post(action: "approve" | "complete", paymentId: string, txid?: string) {
    const res = await fetch("/api/pi/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ action, paymentId, txid, kind, courseId, planId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Paiement Pi refusé");
    }
    return data;
  }

  async function pay() {
    setBusy(true);
    setMsg("");
    try {
      const Pi = await piInit();
      const auth = await Pi.authenticate(["username", "payments"], async (payment) => {
        const id =
          payment && typeof payment === "object" && "identifier" in payment
            ? String((payment as { identifier?: string }).identifier ?? "")
            : "";
        const txid =
          payment &&
          typeof payment === "object" &&
          "transaction" in payment &&
          (payment as { transaction?: { txid?: string } }).transaction?.txid
            ? String((payment as { transaction?: { txid?: string } }).transaction?.txid)
            : undefined;
        if (id) await post(txid ? "complete" : "approve", id, txid);
      });
      await fetch("/api/pi/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });

      await new Promise<void>((resolve, reject) => {
        Pi.createPayment(
          {
            amount: amountPi,
            memo: label.slice(0, 80),
            metadata: {
              kind,
              courseId: courseId ?? "",
              planId: planId ?? "",
            },
          },
          {
            onReadyForServerApproval: (paymentId) => {
              void post("approve", paymentId).catch(reject);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
              void post("complete", paymentId, txid)
                .then(() => resolve())
                .catch(reject);
            },
            onCancel: () => reject(new Error("Paiement annulé")),
            onError: (error) => reject(error),
          },
        );
      });

      setMsg("Paiement Pi confirmé. Le cours reste disponible hors ligne.");
      if (redirectTo) router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Paiement Pi impossible");
    } finally {
      setBusy(false);
    }
  }

  if (amountPi <= 0) return null;

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto">
      <button
        type="button"
        disabled={busy}
        onClick={() => void pay()}
        className="yk-btn yk-btn-secondary w-full disabled:opacity-50 sm:w-auto"
      >
        {busy ? "Pi…" : `Payer ${formatPi(amountPi)}`}
      </button>
      {msg && <p className="text-sm text-[var(--yk-teal)]">{msg}</p>}
    </div>
  );
}
