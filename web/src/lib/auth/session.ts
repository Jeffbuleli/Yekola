import { cookies } from "next/headers";
import { hashToken } from "./crypto";
import { getDb, saveDb } from "@/lib/db/store";
import type { User } from "@/lib/types";

const COOKIE = "yekola_session";
const SESSION_DAYS = 30;

type SessionRow = {
  tokenHash: string;
  userId: string;
  expiresAt: string;
};

declare global {
  var __yekolaSessions: Map<string, SessionRow> | undefined;
}

function sessions(): Map<string, SessionRow> {
  if (!globalThis.__yekolaSessions) {
    globalThis.__yekolaSessions = new Map();
  }
  return globalThis.__yekolaSessions;
}

export async function createSession(userId: string, rawToken: string) {
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5).toISOString();
  const tokenHash = hashToken(rawToken);
  sessions().set(tokenHash, { tokenHash, userId, expiresAt });
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
  if (raw) sessions().delete(hashToken(raw));
  jar.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  const row = sessions().get(hashToken(raw));
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    sessions().delete(row.tokenHash);
    return null;
  }
  const db = getDb();
  return db.users.find((u) => u.id === row.userId) ?? null;
}

export async function requireUser(roles?: User["role"][]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthorized");
  if (roles && !roles.includes(user.role)) throw new Error("forbidden");
  return user;
}

/** Keep sessions alive across soft reloads by also tagging users in store. */
export function touchUser(userId: string) {
  const db = getDb();
  const u = db.users.find((x) => x.id === userId);
  if (u) saveDb(db);
}
