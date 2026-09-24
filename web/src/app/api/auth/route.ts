import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, newId, sessionToken, verifyPassword } from "@/lib/auth/crypto";
import {
  expiresInHours,
  hashAuthToken,
  isExpired,
  rawAuthToken,
} from "@/lib/auth/email-tokens";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { getDb, mutateDb } from "@/lib/db/store";
import { publicUser, slugify } from "@/lib/db/queries";
import type { Academy, PlanId } from "@/lib/types";
import {
  notifyPasswordChanged,
  notifyPasswordReset,
  notifyVerifyAccount,
  notifyWelcome,
} from "@/lib/email/notify";
import { canSendViaResend } from "@/lib/email/resend";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["teacher", "learner"]),
  academyName: z.string().min(2).optional(),
  city: z.string().optional(),
});

function isDemoEmail(email: string) {
  return email.endsWith("@yekola.demo");
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  const db = getDb();
  const academy = user.academyId
    ? db.academies.find((a) => a.id === user.academyId) ?? null
    : null;
  return NextResponse.json({
    user: publicUser(user),
    academy,
    emailConfigured: canSendViaResend(),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const action = body?.action as string | undefined;

  if (action === "logout") {
    await destroySession();
    return NextResponse.json({ ok: true });
  }

  if (action === "login") {
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");
    const db = getDb();
    const user = db.users.find((u) => u.email === email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }
    if (!user.emailVerifiedAt && !isDemoEmail(email)) {
      return NextResponse.json(
        {
          error: "email_not_verified",
          message: "Confirmez votre email avant de vous connecter.",
          email,
        },
        { status: 403 },
      );
    }
    const token = sessionToken();
    await createSession(user.id, token);
    const academy = user.academyId
      ? db.academies.find((a) => a.id === user.academyId) ?? null
      : null;
    return NextResponse.json({ user: publicUser(user), academy });
  }

  if (action === "register") {
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const data = parsed.data;
    const email = data.email.toLowerCase().trim();
    const db = getDb();
    if (db.users.some((u) => u.email === email)) {
      return NextResponse.json({ error: "email_taken" }, { status: 409 });
    }

    const userId = newId("usr");
    let academyId: string | null = null;
    const now = new Date().toISOString();
    const verifyRaw = rawAuthToken();
    const demo = isDemoEmail(email);

    mutateDb((d) => {
      if (data.role === "teacher") {
        academyId = newId("acd");
        const name = data.academyName?.trim() || `Académie ${data.name}`;
        const academy: Academy = {
          id: academyId,
          slug: uniqueSlug(d, slugify(name)),
          name,
          ownerId: userId,
          city: data.city?.trim() || "Kinshasa",
          bio: "",
          planId: "free" as PlanId,
          subscriptionStatus: "active",
          subscriptionExpiresAt: new Date(Date.now() + 365 * 864e5).toISOString(),
          walletBalanceCdf: 0,
          createdAt: now,
        };
        d.academies.push(academy);
      }
      d.users.push({
        id: userId,
        email,
        name: data.name.trim(),
        role: data.role,
        passwordHash: hashPassword(data.password),
        academyId,
        createdAt: now,
        emailVerifiedAt: demo ? now : null,
        emailVerifyTokenHash: demo ? null : hashAuthToken(verifyRaw),
        emailVerifyExpiresAt: demo ? null : expiresInHours(24),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      });
    });

    if (demo) {
      const token = sessionToken();
      await createSession(userId, token);
      const fresh = getDb();
      const user = fresh.users.find((u) => u.id === userId)!;
      const academy = academyId
        ? fresh.academies.find((a) => a.id === academyId) ?? null
        : null;
      return NextResponse.json({
        user: publicUser(user),
        academy,
        pendingVerification: false,
      });
    }

    const mail = await notifyVerifyAccount({
      to: email,
      name: data.name.trim(),
      rawToken: verifyRaw,
    });

    return NextResponse.json({
      user: null,
      pendingVerification: true,
      email,
      emailSent: mail.ok,
      message: mail.ok
        ? "Un email de confirmation vous a été envoyé."
        : "Compte créé. Email de confirmation non envoyé — réessayez depuis la page de confirmation.",
    });
  }

  if (action === "resend_verify") {
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }
    const db = getDb();
    const user = db.users.find((u) => u.email === email);
    // Always opaque success to avoid account enumeration
    if (!user || user.emailVerifiedAt) {
      return NextResponse.json({ ok: true });
    }
    const verifyRaw = rawAuthToken();
    mutateDb((d) => {
      const u = d.users.find((x) => x.id === user.id);
      if (!u) return;
      u.emailVerifyTokenHash = hashAuthToken(verifyRaw);
      u.emailVerifyExpiresAt = expiresInHours(24);
    });
    const mail = await notifyVerifyAccount({
      to: email,
      name: user.name,
      rawToken: verifyRaw,
    });
    return NextResponse.json({ ok: true, emailSent: mail.ok });
  }

  if (action === "verify_email") {
    const raw = String(body.token ?? "").trim();
    if (!raw) {
      return NextResponse.json({ error: "token_required" }, { status: 400 });
    }
    const tokenHash = hashAuthToken(raw);
    const db = getDb();
    const user = db.users.find(
      (u) =>
        u.emailVerifyTokenHash === tokenHash &&
        !isExpired(u.emailVerifyExpiresAt),
    );
    if (!user) {
      return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }
    const now = new Date().toISOString();
    mutateDb((d) => {
      const u = d.users.find((x) => x.id === user.id);
      if (!u) return;
      u.emailVerifiedAt = now;
      u.emailVerifyTokenHash = null;
      u.emailVerifyExpiresAt = null;
    });
    await notifyWelcome({ to: user.email, name: user.name, role: user.role });
    const session = sessionToken();
    await createSession(user.id, session);
    const fresh = getDb();
    const verified = fresh.users.find((u) => u.id === user.id)!;
    const academy = verified.academyId
      ? fresh.academies.find((a) => a.id === verified.academyId) ?? null
      : null;
    return NextResponse.json({
      ok: true,
      user: publicUser(verified),
      academy,
    });
  }

  if (action === "forgot_password") {
    const email = String(body.email ?? "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }
    if (!canSendViaResend()) {
      return NextResponse.json(
        {
          error: "email_unavailable",
          message: "Envoi d’emails indisponible. Réessayez plus tard ou contactez hi@mcbuleli.org.",
        },
        { status: 503 },
      );
    }
    const db = getDb();
    const user = db.users.find((u) => u.email === email);
    let emailSent = false;
    let sendError: string | undefined;
    if (user) {
      const resetRaw = rawAuthToken();
      mutateDb((d) => {
        const u = d.users.find((x) => x.id === user.id);
        if (!u) return;
        u.passwordResetTokenHash = hashAuthToken(resetRaw);
        u.passwordResetExpiresAt = expiresInHours(1);
      });
      const mail = await notifyPasswordReset({
        to: email,
        name: user.name,
        rawToken: resetRaw,
      });
      emailSent = mail.ok;
      sendError = mail.error;
      if (!mail.ok) {
        return NextResponse.json(
          {
            error: "email_failed",
            message: `Échec d’envoi Resend (${mail.error || "inconnu"}). Vérifiez spam ou réessayez.`,
            emailSent: false,
          },
          { status: 502 },
        );
      }
    }
    return NextResponse.json({
      ok: true,
      emailSent: user ? emailSent : false,
      message: user
        ? "Lien de récupération envoyé. Vérifiez votre boîte (et spam)."
        : "Si un compte existe pour cet email, un lien a été envoyé.",
      sendError,
    });
  }

  if (action === "reset_password") {
    const raw = String(body.token ?? "").trim();
    const password = String(body.password ?? "");
    if (!raw || password.length < 6) {
      return NextResponse.json({ error: "invalid_input" }, { status: 400 });
    }
    const tokenHash = hashAuthToken(raw);
    const db = getDb();
    const user = db.users.find(
      (u) =>
        u.passwordResetTokenHash === tokenHash &&
        !isExpired(u.passwordResetExpiresAt),
    );
    if (!user) {
      return NextResponse.json({ error: "invalid_or_expired" }, { status: 400 });
    }
    mutateDb((d) => {
      const u = d.users.find((x) => x.id === user.id);
      if (!u) return;
      u.passwordHash = hashPassword(password);
      u.passwordResetTokenHash = null;
      u.passwordResetExpiresAt = null;
      // Confirm email if resetting via email link
      if (!u.emailVerifiedAt) u.emailVerifiedAt = new Date().toISOString();
    });
    await notifyPasswordChanged({ to: user.email, name: user.name });
    return NextResponse.json({
      ok: true,
      message: "Mot de passe mis à jour. Vous pouvez vous connecter.",
    });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

function uniqueSlug(db: ReturnType<typeof getDb>, base: string) {
  let slug = base || "academie";
  let i = 1;
  while (db.academies.some((a) => a.slug === slug)) {
    slug = `${base}-${i++}`;
  }
  return slug;
}
