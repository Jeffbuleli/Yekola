const PI_PLATFORM_V2 = "https://api.minepi.com/v2";

export function piApiKey(): string | null {
  const key = (process.env.PI_API_KEY || process.env.API_KEY_YEKOLA || "").trim();
  return key ? key : null;
}

/** Adresse publique du wallet Yekola. La seed reste dans l’environnement et n’est jamais lue ici. */
export function piWalletAddress(): string | null {
  const address = (process.env.WALLET_ADRESS_YEKOLA || process.env.PI_WALLET_ADDRESS || "").trim();
  return address ? address : null;
}

function authKeyHeader(apiKey: string): HeadersInit {
  return {
    Authorization: `Key ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

function errorMessage(json: unknown, fallback: string): string {
  if (typeof json === "object" && json !== null && "message" in json) {
    return String((json as { message: unknown }).message);
  }
  return fallback;
}

export type PiMe = { uid?: string; username?: string };

export async function piFetchMe(accessToken: string): Promise<PiMe> {
  const res = await fetch(`${PI_PLATFORM_V2}/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(errorMessage(json, "Pi identity rejected"));
  return (json ?? {}) as PiMe;
}

export type PiPlatformPayment = {
  identifier?: string;
  amount?: number;
  memo?: string;
  metadata?: Record<string, unknown>;
  status?: { developer_approved?: boolean; developer_completed?: boolean; cancelled?: boolean };
  transaction?: { txid?: string } | null;
};

export async function piGetPayment(paymentId: string, apiKey: string): Promise<PiPlatformPayment> {
  const res = await fetch(`${PI_PLATFORM_V2}/payments/${encodeURIComponent(paymentId)}`, {
    headers: authKeyHeader(apiKey),
    cache: "no-store",
  });
  const json = await readJson(res);
  if (!res.ok) throw new Error(errorMessage(json, `Pi payment lookup failed (${res.status})`));
  return (json ?? {}) as PiPlatformPayment;
}

export async function piApprovePayment(paymentId: string, apiKey: string): Promise<void> {
  const res = await fetch(
    `${PI_PLATFORM_V2}/payments/${encodeURIComponent(paymentId)}/approve`,
    { method: "POST", headers: authKeyHeader(apiKey), body: "{}", cache: "no-store" },
  );
  const json = await readJson(res);
  if (!res.ok) throw new Error(errorMessage(json, `Pi approve failed (${res.status})`));
}

export async function piCompletePayment(
  paymentId: string,
  txid: string,
  apiKey: string,
): Promise<void> {
  const res = await fetch(
    `${PI_PLATFORM_V2}/payments/${encodeURIComponent(paymentId)}/complete`,
    {
      method: "POST",
      headers: authKeyHeader(apiKey),
      body: JSON.stringify({ txid }),
      cache: "no-store",
    },
  );
  const json = await readJson(res);
  if (!res.ok) throw new Error(errorMessage(json, `Pi complete failed (${res.status})`));
}
