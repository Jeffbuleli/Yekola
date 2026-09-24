/**
 * Client PawaPay Merchant API v2 (extrait / adapté depuis McBuleli).
 * Dépôts (achat / abonnement) + payouts (retrait enseignant).
 */

import { normalizeCodPhone } from "./phone";
import { toPawapayProviderId } from "./momo-providers";

export type PawapayInitResponse = {
  depositId?: string;
  payoutId?: string;
  status: string;
  failureReason?: { failureCode?: string; failureMessage?: string };
};

export type PawapayStatusResponse = {
  depositId?: string;
  payoutId?: string;
  status: string;
  amount?: string;
  currency?: string;
  providerTransactionId?: string;
  failureReason?: { failureCode?: string; failureMessage?: string };
  data?: PawapayStatusResponse | null;
};

function getBaseUrl() {
  const override = process.env.PAWAPAY_API_BASE_URL?.trim();
  if (override) return override.replace(/\/+$/, "");
  const env = process.env.PAWAPAY_ENV?.trim().toLowerCase();
  if (env === "sandbox" || env === "test") {
    return "https://api.sandbox.pawapay.io";
  }
  return "https://api.pawapay.io";
}

function getToken() {
  return process.env.PAWAPAY_API_TOKEN?.trim() || "";
}

export function isPawapayConfigured(): boolean {
  return Boolean(getToken());
}

export function formatPawapayAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount < 0) throw new Error("invalid_amount");
  if (amount === 0) return "0";
  let s = amount.toFixed(3);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  return s;
}

function isAccepted(status: string | undefined) {
  const s = String(status ?? "").toUpperCase();
  return s === "ACCEPTED" || s === "DUPLICATE_IGNORED";
}

export function mapPawapayStatus(
  status: string | undefined,
): "COMPLETED" | "FAILED" | "PROCESSING" {
  const s = String(status ?? "").toUpperCase();
  if (s === "COMPLETED") return "COMPLETED";
  if (s === "FAILED" || s === "REJECTED") return "FAILED";
  return "PROCESSING";
}

export function unwrapStatus(
  remote: PawapayStatusResponse | null | undefined,
): PawapayStatusResponse | null {
  if (!remote || typeof remote !== "object") return null;
  const top = String(remote.status ?? "").toUpperCase();
  if (top === "NOT_FOUND") return null;
  if (top === "FOUND" && remote.data) return remote.data;
  return remote;
}

async function pawapayFetch<T>(
  method: "GET" | "POST",
  path: string,
  body?: Record<string, unknown>,
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("pawapay_not_configured");
  const url = `${getBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    throw new Error(`pawapay_invalid_json:${res.status}`);
  }
  if (!res.ok && (!json || typeof json !== "object")) {
    throw new Error(`pawapay_http_${res.status}`);
  }
  return json as T;
}

function mmoAccount(phoneNumber: string, provider: string) {
  return {
    type: "MMO" as const,
    accountDetails: {
      phoneNumber: normalizeCodPhone(phoneNumber),
      provider: toPawapayProviderId(provider),
    },
  };
}

export async function pawapayDeposit(args: {
  depositId: string;
  amount: number;
  currency: "CDF" | "USD";
  phoneNumber: string;
  provider: string;
  customerMessage?: string;
}) {
  const response = await pawapayFetch<PawapayInitResponse>("POST", "/v2/deposits", {
    depositId: args.depositId,
    amount: formatPawapayAmount(args.amount),
    currency: args.currency,
    payer: mmoAccount(args.phoneNumber, args.provider),
    customerMessage: (args.customerMessage || "Yekola").slice(0, 22),
  });
  return { accepted: isAccepted(response.status), response };
}

export async function pawapayPayout(args: {
  payoutId: string;
  amount: number;
  currency: "CDF" | "USD";
  phoneNumber: string;
  provider: string;
  customerMessage?: string;
}) {
  const response = await pawapayFetch<PawapayInitResponse>("POST", "/v2/payouts", {
    payoutId: args.payoutId,
    amount: formatPawapayAmount(args.amount),
    currency: args.currency,
    recipient: mmoAccount(args.phoneNumber, args.provider),
    customerMessage: (args.customerMessage || "Yekola retrait").slice(0, 22),
  });
  return { accepted: isAccepted(response.status), response };
}

export async function pawapayCheckDeposit(depositId: string) {
  try {
    return await pawapayFetch<PawapayStatusResponse>("GET", `/v2/deposits/${depositId}`);
  } catch {
    return null;
  }
}

export async function pawapayCheckPayout(payoutId: string) {
  try {
    return await pawapayFetch<PawapayStatusResponse>("GET", `/v2/payouts/${payoutId}`);
  } catch {
    return null;
  }
}
