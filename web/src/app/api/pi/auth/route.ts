import { NextResponse } from "next/server";
import { hashPassword, newId, sessionToken } from "@/lib/auth/crypto";
import { createSession, getCurrentUser } from "@/lib/auth/session";
import { publicUser } from "@/lib/db/queries";
import { getDb, mutateDb } from "@/lib/db/store";
import { piFetchMe } from "@/lib/pi/platform";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

function piEmail(username: string): string {
  const safe = username.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return `${safe || "pioneer"}@pi.yekola`;
}

/** Connexion Pi, ou lien du Pioneer au compte Yekola déjà ouvert. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const accessToken = String(body?.accessToken ?? "").trim();
  if (!accessToken) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  let me: { uid?: string; username?: string };
  try {
    me = await piFetchMe(accessToken);
  } catch (err) {
    return NextResponse.json(
      { error: "pi_me_failed", message: err instanceof Error ? err.message : "Pi" },
      { status: 401 },
    );
  }

  const username = me.username?.trim() ?? "";
  const uid = me.uid?.trim() ?? "";
  if (!username || !uid) {
    return NextResponse.json({ error: "pi_user_incomplete" }, { status: 502 });
  }

  const current = await getCurrentUser();
  if (current) {
    mutateDb((d) => {
      const row = d.users.find((u) => u.id === current.id);
      if (!row) return;
      row.piUid = uid;
      row.piUsername = username;
    });
    const linked = getDb().users.find((u) => u.id === current.id)!;
    return NextResponse.json({ ok: true, linked: true, user: publicUser(linked) });
  }

  const db = getDb();
  let user = db.users.find((u) => u.piUid === uid) ?? null;
  if (!user) {
    const email = piEmail(username);
    const taken = db.users.some((u) => u.email === email);
    const now = new Date().toISOString();
    const created: User = {
      id: newId("usr"),
      email: taken ? `${uid.slice(0, 8)}.${email}` : email,
      name: username,
      role: "learner",
      passwordHash: hashPassword(sessionToken()),
      academyId: null,
      createdAt: now,
      emailVerifiedAt: now,
      emailVerifyTokenHash: null,
      emailVerifyExpiresAt: null,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
      devicePollTokenHash: null,
      devicePollExpiresAt: null,
      devicePollPurpose: null,
      piUid: uid,
      piUsername: username,
    };
    mutateDb((d) => {
      d.users.push(created);
    });
    user = created;
  }

  const res = NextResponse.json({ ok: true, user: publicUser(user) });
  await createSession(user.id, sessionToken(), res);
  return res;
}
