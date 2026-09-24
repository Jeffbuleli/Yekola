import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const db = getDb();
  const cert = db.certificates.find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );
  if (!cert) {
    // fallback seed certificate for docs
    if (code.toUpperCase() === "YK-WEB-2026-JM01") {
      return NextResponse.json({
        valid: true,
        certificate: {
          code: "YK-WEB-2026-JM01",
          learnerName: "Patty Basoga",
          courseTitle: "Développement Web Moderne",
          academyName: "Académie Jeff",
          teacherName: "Jeff Buleli",
          skills: ["Culture numérique", "HTML & CSS", "JavaScript"],
          issuedAt: "2026-09-20",
        },
      });
    }
    return NextResponse.json({ valid: false }, { status: 404 });
  }
  return NextResponse.json({ valid: true, certificate: cert });
}
