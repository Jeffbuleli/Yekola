import { normalizeCodPhone } from "./phone";

export const MOMO_OPTIONS = [
  { id: "airtel", label: "Airtel Money", pawapay: "AIRTEL_COD" },
  { id: "orange", label: "Orange Money", pawapay: "ORANGE_COD" },
  { id: "mpesa", label: "M-Pesa", pawapay: "VODACOM_MPESA_COD" },
] as const;

export type MomoProviderId = (typeof MOMO_OPTIONS)[number]["id"];

const PREFIX: { prefix: string; id: MomoProviderId }[] = [
  { prefix: "81", id: "mpesa" },
  { prefix: "82", id: "mpesa" },
  { prefix: "83", id: "mpesa" },
  { prefix: "86", id: "mpesa" },
  { prefix: "80", id: "orange" },
  { prefix: "84", id: "orange" },
  { prefix: "85", id: "orange" },
  { prefix: "89", id: "orange" },
  { prefix: "97", id: "airtel" },
  { prefix: "98", id: "airtel" },
  { prefix: "99", id: "airtel" },
  { prefix: "96", id: "airtel" },
];
PREFIX.sort((a, b) => b.prefix.length - a.prefix.length);

export function detectMomoProvider(msisdn: string): MomoProviderId | null {
  const n = normalizeCodPhone(msisdn);
  const local = n.startsWith("243") ? n.slice(3) : n;
  for (const row of PREFIX) {
    if (local.startsWith(row.prefix)) return row.id;
  }
  return null;
}

export function toPawapayProviderId(provider: string): string {
  const u = provider.trim().toLowerCase();
  const hit = MOMO_OPTIONS.find((o) => o.id === u || o.pawapay === provider.toUpperCase());
  if (hit) return hit.pawapay;
  const upper = provider.trim().toUpperCase();
  if (upper.includes("AIRTEL")) return "AIRTEL_COD";
  if (upper.includes("ORANGE")) return "ORANGE_COD";
  if (upper.includes("MPESA") || upper.includes("VODACOM")) return "VODACOM_MPESA_COD";
  return provider.trim();
}
