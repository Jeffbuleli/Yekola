import type {
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getDb, mutateDb } from "@/lib/db/store";
import { newId } from "@/lib/auth/crypto";
import type { PasskeyRecord, WebAuthnChallenge } from "@/lib/types";

export function webAuthnRpId() {
  const fromEnv = process.env.WEBAUTHN_RP_ID?.trim();
  if (fromEnv?.includes(".")) return fromEnv;
  try {
    return new URL(
      process.env.NEXT_PUBLIC_APP_URL || "https://yekola.mcbuleli.com",
    ).hostname;
  } catch {
    return "yekola.mcbuleli.com";
  }
}

export function webAuthnOrigin() {
  return (
    process.env.WEBAUTHN_ORIGIN?.trim().replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "") ||
    "https://yekola.mcbuleli.com"
  );
}

function pruneChallenges(list: WebAuthnChallenge[]) {
  const now = Date.now();
  return list.filter((c) => new Date(c.expiresAt).getTime() > now);
}

function saveChallenge(row: WebAuthnChallenge) {
  mutateDb((d) => {
    d.webauthnChallenges = pruneChallenges(d.webauthnChallenges || []).filter(
      (c) => c.id !== row.id,
    );
    d.webauthnChallenges.push(row);
  });
}

function takeChallenge(id: string, purpose: WebAuthnChallenge["purpose"]) {
  const db = getDb();
  const list = pruneChallenges(db.webauthnChallenges || []);
  const row = list.find((c) => c.id === id && c.purpose === purpose);
  mutateDb((d) => {
    d.webauthnChallenges = list.filter((c) => c.id !== id);
  });
  return row ?? null;
}

export async function passkeyRegisterOptions(userId: string) {
  const db = getDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error("not_found");
  const existing = (db.passkeys || []).filter((p) => p.userId === userId);

  const options = await generateRegistrationOptions({
    rpName: "Yekola",
    rpID: webAuthnRpId(),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    excludeCredentials: existing.map((pk) => ({
      id: pk.credentialId,
      transports: (pk.transports ?? undefined) as
        | AuthenticatorTransportFuture[]
        | undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  const challengeId = newId("wac");
  saveChallenge({
    id: challengeId,
    userId,
    purpose: "passkey_register",
    challenge: options.challenge,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  });

  return { options, challengeId };
}

export async function passkeyRegisterVerify(args: {
  userId: string;
  challengeId: string;
  response: RegistrationResponseJSON;
}) {
  const row = takeChallenge(args.challengeId, "passkey_register");
  if (!row || row.userId !== args.userId) {
    return { ok: false as const, error: "challenge_expired" };
  }

  const verification = await verifyRegistrationResponse({
    response: args.response,
    expectedChallenge: row.challenge,
    expectedOrigin: webAuthnOrigin(),
    expectedRPID: webAuthnRpId(),
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return { ok: false as const, error: "passkey_invalid" };
  }

  const { credential } = verification.registrationInfo;
  const pk: PasskeyRecord = {
    id: newId("pk"),
    userId: args.userId,
    credentialId: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString("base64url"),
    counter: credential.counter,
    deviceName: "Passkey",
    transports: credential.transports ?? null,
    createdAt: new Date().toISOString(),
  };
  mutateDb((d) => {
    d.passkeys = d.passkeys || [];
    d.passkeys.push(pk);
  });
  return { ok: true as const };
}

export async function passkeyLoginOptions(email?: string) {
  const db = getDb();
  let allowCredentials:
    | { id: string; transports?: AuthenticatorTransportFuture[] }[]
    | undefined;
  let userId: string | null = null;

  if (email) {
    const u = db.users.find((x) => x.email === email.trim().toLowerCase());
    if (u) {
      userId = u.id;
      allowCredentials = (db.passkeys || [])
        .filter((p) => p.userId === u.id)
        .map((p) => ({
          id: p.credentialId,
          transports: (p.transports ?? undefined) as
            | AuthenticatorTransportFuture[]
            | undefined,
        }));
    }
  }

  const options = await generateAuthenticationOptions({
    rpID: webAuthnRpId(),
    allowCredentials,
    userVerification: "preferred",
  });

  const challengeId = newId("wac");
  saveChallenge({
    id: challengeId,
    userId,
    purpose: "passkey_login",
    challenge: options.challenge,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  });

  return { options, challengeId };
}

export async function passkeyLoginVerify(args: {
  challengeId: string;
  response: AuthenticationResponseJSON;
}) {
  const row = takeChallenge(args.challengeId, "passkey_login");
  if (!row) return { ok: false as const, error: "challenge_expired" };

  const db = getDb();
  const credentialId = args.response.id;
  const pk = (db.passkeys || []).find((p) => p.credentialId === credentialId);
  if (!pk) return { ok: false as const, error: "passkey_not_found" };

  const verification = await verifyAuthenticationResponse({
    response: args.response,
    expectedChallenge: row.challenge,
    expectedOrigin: webAuthnOrigin(),
    expectedRPID: webAuthnRpId(),
    credential: {
      id: pk.credentialId,
      publicKey: Buffer.from(pk.publicKey, "base64url"),
      counter: pk.counter,
      transports: (pk.transports ?? undefined) as
        | AuthenticatorTransportFuture[]
        | undefined,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    return { ok: false as const, error: "passkey_invalid" };
  }

  mutateDb((d) => {
    const hit = (d.passkeys || []).find((p) => p.id === pk.id);
    if (hit) hit.counter = verification.authenticationInfo.newCounter;
  });

  return { ok: true as const, userId: pk.userId };
}

export async function passkeyStepUpOptions(userId: string) {
  const db = getDb();
  const existing = (db.passkeys || []).filter((p) => p.userId === userId);
  if (existing.length === 0) {
    return { ok: false as const, error: "no_passkey" };
  }

  const options = await generateAuthenticationOptions({
    rpID: webAuthnRpId(),
    allowCredentials: existing.map((p) => ({
      id: p.credentialId,
      transports: (p.transports ?? undefined) as
        | AuthenticatorTransportFuture[]
        | undefined,
    })),
    userVerification: "preferred",
  });

  const challengeId = newId("wac");
  saveChallenge({
    id: challengeId,
    userId,
    purpose: "passkey_stepup",
    challenge: options.challenge,
    expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
  });

  return { ok: true as const, options, challengeId };
}

export async function passkeyStepUpVerify(args: {
  userId: string;
  challengeId: string;
  response: AuthenticationResponseJSON;
}) {
  const row = takeChallenge(args.challengeId, "passkey_stepup");
  if (!row || row.userId !== args.userId) {
    return { ok: false as const, error: "challenge_expired" };
  }

  const db = getDb();
  const pk = (db.passkeys || []).find(
    (p) => p.credentialId === args.response.id && p.userId === args.userId,
  );
  if (!pk) return { ok: false as const, error: "passkey_not_found" };

  const verification = await verifyAuthenticationResponse({
    response: args.response,
    expectedChallenge: row.challenge,
    expectedOrigin: webAuthnOrigin(),
    expectedRPID: webAuthnRpId(),
    credential: {
      id: pk.credentialId,
      publicKey: Buffer.from(pk.publicKey, "base64url"),
      counter: pk.counter,
      transports: (pk.transports ?? undefined) as
        | AuthenticatorTransportFuture[]
        | undefined,
    },
    requireUserVerification: false,
  });

  if (!verification.verified) {
    return { ok: false as const, error: "passkey_invalid" };
  }

  mutateDb((d) => {
    const hit = (d.passkeys || []).find((p) => p.id === pk.id);
    if (hit) hit.counter = verification.authenticationInfo.newCounter;
  });

  return { ok: true as const };
}

export function userPasskeyCount(userId: string) {
  return (getDb().passkeys || []).filter((p) => p.userId === userId).length;
}
