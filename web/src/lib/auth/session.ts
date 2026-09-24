import { cookies } from "next/headers";
import { hashToken } from "./crypto";
import { getDb, mutateDb, saveDb } from "@/lib/db/store";
import type { SessionRecord, User } from "@/lib/types";

const COOKIE = "yekola_session";
const SESSION_DAYS = 30;

function pruneExpired(sessions: SessionRecord[], now = Date.now()) {
  return sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
}

export async function createSession(userId: string, rawToken: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  const tokenHash = hashToken(rawToken);

  mutateDb((d) => {
    d.sessions = pruneExpired(d.sessions || []).filter((s) => s.tokenHash !== tokenHash);
    d.sessions.push({ tokenHash, userId, expiresAt });
  });

  const jar = await cookies();
  jar.set(COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (raw) {
    const tokenHash = hashToken(raw);
    mutateDb((d) => {
      d.sessions = (d.sessions || []).filter((s) => s.tokenHash !== tokenHash);
    });
  }
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const db = getDb();
  const sessions = pruneExpired(db.sessions || []);
  const row = sessions.find((s) => s.tokenHash === tokenHash);
  if (!row) {
    // Cookie orphelin : ne pas jar.delete ici (interdit en render RSC).
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
