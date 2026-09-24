import { createHash, randomBytes } from "crypto";

export function rawAuthToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashAuthToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function expiresInHours(hours: number): string {
  return new Date(Date.now() + hours * 3600_000).toISOString();
}

export function isExpired(iso: string | null | undefined): boolean {
  if (!iso) return true;
  return new Date(iso).getTime() < Date.now();
}
