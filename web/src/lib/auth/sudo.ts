import { cookies } from "next/headers";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { userPasskeyCount } from "@/lib/auth/passkeys";

const SUDO_COOKIE = "yekola_sudo";
const SUDO_MINUTES = 10;

function hashSudo(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

declare global {
  var __yekolaSudo: Map<string, { userId: string; expiresAt: number }> | undefined;
}

function sudoStore() {
  if (!globalThis.__yekolaSudo) globalThis.__yekolaSudo = new Map();
  return globalThis.__yekolaSudo;
}

/** Issue a short-lived SUDO cookie after passkey step-up. */
export async function grantSudo(userId: string) {
  const raw = randomBytes(24).toString("hex");
  const expiresAt = Date.now() + SUDO_MINUTES * 60_000;
  sudoStore().set(hashSudo(raw), { userId, expiresAt });
  const jar = await cookies();
  jar.set(SUDO_COOKIE, raw, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SUDO_MINUTES * 60,
  });
}

export async function hasFreshSudo(userId: string): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(SUDO_COOKIE)?.value;
  if (!raw) return false;
  const row = sudoStore().get(hashSudo(raw));
  if (!row || row.userId !== userId) return false;
  if (row.expiresAt < Date.now()) {
    sudoStore().delete(hashSudo(raw));
    return false;
  }
  return true;
}

/** True if user has passkeys and must step-up for sensitive actions. */
export function requiresPasskeySudo(userId: string) {
  return userPasskeyCount(userId) > 0;
}

export async function assertSudoOrPasskey(args: {
  userId: string;
  passkeyChallengeId?: string | null;
  passkeyResponse?: unknown;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (await hasFreshSudo(args.userId)) return { ok: true };
  if (!requiresPasskeySudo(args.userId)) return { ok: true };

  if (args.passkeyChallengeId && args.passkeyResponse) {
    const { passkeyStepUpVerify } = await import("@/lib/auth/passkeys");
    const v = await passkeyStepUpVerify({
      userId: args.userId,
      challengeId: args.passkeyChallengeId,
      response: args.passkeyResponse as never,
    });
    if (!v.ok) return { ok: false, error: v.error };
    await grantSudo(args.userId);
    return { ok: true };
  }

  return { ok: false, error: "sudo_required" };
}

export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}
