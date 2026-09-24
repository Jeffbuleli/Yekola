import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword, newId, sessionToken, verifyPassword } from "@/lib/auth/crypto";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth/session";
import { getDb, mutateDb } from "@/lib/db/store";
import { publicUser } from "@/lib/db/queries";
import type { Academy, PlanId } from "@/lib/types";
import { slugify } from "@/lib/db/queries";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(["teacher", "learner"]),
  academyName: z.string().min(2).optional(),
  city: z.string().optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null });
  const db = getDb();
  const academy = user.academyId
    ? db.academies.find((a) => a.id === user.academyId) ?? null
    : null;
  return NextResponse.json({ user: publicUser(user), academy });
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
      });
    });

    const token = sessionToken();
    await createSession(userId, token);
    const fresh = getDb();
    const user = fresh.users.find((u) => u.id === userId)!;
    const academy = academyId
      ? fresh.academies.find((a) => a.id === academyId) ?? null
      : null;
    return NextResponse.json({ user: publicUser(user), academy });
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
