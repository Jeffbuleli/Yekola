import { NextResponse } from "next/server";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { sessionToken } from "@/lib/auth/crypto";
import {
  passkeyLoginOptions,
  passkeyLoginVerify,
  passkeyRegisterOptions,
  passkeyRegisterVerify,
  passkeyStepUpOptions,
  passkeyStepUpVerify,
  userPasskeyCount,
} from "@/lib/auth/passkeys";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { grantSudo } from "@/lib/auth/sudo";
import { getDb } from "@/lib/db/store";
import { publicUser } from "@/lib/db/queries";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ passkeyCount: 0 });
  return NextResponse.json({ passkeyCount: userPasskeyCount(user.id) });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const action = String(body?.action || "");

  if (action === "register_options") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const data = await passkeyRegisterOptions(user.id);
    return NextResponse.json(data);
  }

  if (action === "register_verify") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const result = await passkeyRegisterVerify({
      userId: user.id,
      challengeId: String(body.challengeId || ""),
      response: body.response as RegistrationResponseJSON,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      passkeyCount: userPasskeyCount(user.id),
    });
  }

  if (action === "login_options") {
    const email = body?.email ? String(body.email).toLowerCase().trim() : undefined;
    const data = await passkeyLoginOptions(email);
    return NextResponse.json(data);
  }

  if (action === "login_verify") {
    const result = await passkeyLoginVerify({
      challengeId: String(body.challengeId || ""),
      response: body.response as AuthenticationResponseJSON,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    const db = getDb();
    const user = db.users.find((u) => u.id === result.userId);
    if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (!user.emailVerifiedAt && !user.email.endsWith("@yekola.demo")) {
      return NextResponse.json(
        { error: "email_not_verified", email: user.email },
        { status: 403 },
      );
    }
    await createSession(user.id, sessionToken());
    const academy = user.academyId
      ? db.academies.find((a) => a.id === user.academyId) ?? null
      : null;
    return NextResponse.json({ user: publicUser(user), academy });
  }

  if (action === "stepup_options") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const data = await passkeyStepUpOptions(user.id);
    if (!data.ok) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }
    return NextResponse.json(data);
  }

  if (action === "stepup_verify") {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const result = await passkeyStepUpVerify({
      userId: user.id,
      challengeId: String(body.challengeId || ""),
      response: body.response as AuthenticationResponseJSON,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    await grantSudo(user.id);
    return NextResponse.json({ ok: true, sudo: true });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
