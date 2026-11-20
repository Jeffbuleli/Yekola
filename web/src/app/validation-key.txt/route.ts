import { NextResponse } from "next/server";

/** Vérification domaine Pi — corps exact, sans HTML. Ne pas committer la clé. */
export async function GET() {
  const key = (
    process.env.PI_VALIDATION_KEY ||
    process.env.VALIDATION_KEY_YEKOLA ||
    ""
  ).trim();
  if (!key) {
    return new NextResponse("Not found", { status: 404 });
  }
  return new NextResponse(key, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}