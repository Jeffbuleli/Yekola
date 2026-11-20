import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { hashToken } from "./crypto";
import { getDb, mutateDb, saveDb } from "@/lib/db/store";
import type { SessionRecord, User } from "@/lib/types";

export const SESSION_COOKIE = "yekola_session";
const SESSION_DAYS = 30;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_DAYS * 86400,
};

function pruneExpired(sessions: SessionRecord[], now = Date.now()) {
  return sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
}

/** Persist session row; optionally attach cookie on a NextResponse (preferred). */
export async function createSession(
  userId: string,
  rawToken: string,
  res?: NextResponse,
) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  const tokenHash = hashToken(rawToken);

  mutateDb((d) => {
    d.sessions = pruneExpired(d.sessions || []).filter((s) => s.tokenHash !== tokenHash);
    // one active session per user (avoid orphans)
    d.sessions = d.sessions.filter((s) => s.userId !== userId);
    d.sessions.push({ tokenHash, userId, expiresAt });
  });

  if (res) {
    res.cookies.set(SESSION_COOKIE, rawToken, cookieOptions);
  } else {
    const jar = await cookies();
    jar.set(SESSION_COOKIE, rawToken, cookieOptions);
  }
}

export async function destroySession(res?: NextResponse) {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const tokenHash = hashToken(raw);
    mutateDb((d) => {
      d.sessions = (d.sessions || []).filter((s) => s.tokenHash !== tokenHash);
    });
  }
  if (res) {
    res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  } else {
    jar.delete(SESSION_COOKIE);
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const db = getDb();
  const sessions = pruneExpired(db.sessions || []);
  const row = sessions.find((s) => s.tokenHash === tokenHash);
  if (!row) {
    if (sessions.length !== (db.sessions || []).length) {
      saveDb({ ...db, sessions });
    }
    return null;
  }

  if (sessions.length !== (db.sessions || []).length) {
    saveDb({ ...db, sessions });
  }

  return db.users.find((u) => u.id === row.userId) ?? null;
}

export async function requireUser(roles?: User["role"][]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  if (roles && !roles.includes(user.role)) throw new Error("forbidden");
  return user;
}
