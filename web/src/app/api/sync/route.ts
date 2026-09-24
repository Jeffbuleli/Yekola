import { NextResponse } from "next/server";

/** Accepte des événements sync idempotents (event.id). */
const seen = new Set<string>();

export async function POST(req: Request) {
  const body = await req.json();
  const events = Array.isArray(body.events) ? body.events : [];
  const accepted: string[] = [];
  for (const ev of events) {
    const id = String(ev?.id || "");
    if (!id) continue;
    if (!seen.has(id)) {
      seen.add(id);
      // En prod: écrire Postgres Learning Hub / cloud
      console.info("[yekola-sync]", ev.type, id);
    }
    accepted.push(id);
  }
  return NextResponse.json({
    ok: true,
    accepted,
    serverTime: new Date().toISOString(),
  });
}
