import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/store";
import { buildCertificateHtml } from "@/lib/progress/certificate-html";

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
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const html = await buildCertificateHtml(cert);
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="brevet-yekola-${cert.code}.html"`,
      "Cache-Control": "no-store",
    },
  });
}
